import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { reqThumbnail } from '@/lib/api/api';
import { isBlockCheck } from '@/lib/api/orgchart';
import { fileTypeImage, getFileExtension } from '@/lib/fileUtil';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import ScaledImage from '../chat/message/types/ScaledImage';
import { setPostReplyMessage } from '@/modules/message';
import {
  convertEumTalkProtocol,
  getDictionary,
  getSysMsgFormatStr,
  isJSONStr,
} from '@/lib/common';
import { convertChildren, getAttribute } from '@/lib/messageUtil';
import { getDic } from '@/config';
import { Plain, Link, Tag, Sticker, Mention } from '@C/chat/message/types';
import { useTheme } from '@react-navigation/native';
import CloseIcon from '@COMMON/icons/CloseIcon';

const FileComponent = ({ fileInfos }) => {
  const [file, setFile] = useState(null);
  const [thumbnailURL, setThumbnailURL] = useState(null);

  useEffect(() => {
    if (fileInfos) {
      const isFileArray = Array.isArray(fileInfos);
      const targetFile = isFileArray ? fileInfos[0] : fileInfos;
      setFile(targetFile);
    } else {
      setFile(null);
    }
    return () => {
      setFile(null);
    };
  }, [fileInfos]);

  useEffect(() => {
    if (file?.thumbnail) {
      setThumbnailURL({ uri: reqThumbnail(file.token) });
    } else if (file?.image && file?.isTemp) {
      setThumbnailURL({ uri: file.thumbDataURL });
    }
    return () => {
      setThumbnailURL(null);
    };
  }, [file]);

  if (file?.isImage === 'Y') {
    return (
      <ScaledImage source={thumbnailURL} scaledWidth={45} scaledHeight={45} />
    );
  } else if (file?.ext) {
    return (
      <Image
        style={styles.fileTypeIcon}
        source={fileTypeImage[getFileExtension(file.ext)]}
      />
    );
  } else {
    return <></>;
  }
};

const EmoticonComponent = ({ emoticon }) => {
  const pattern = new RegExp(
    /[<](LINK|NEWLINE|TAG|STICKER|MENTION)[^>]*[/>]/,
    'gi',
  );
  const match = pattern.exec(emoticon);
  const attrs = getAttribute(match?.[0]);
  return <Sticker style={{ width: 45, height: 45 }} {...attrs} />;
};

const SenderComponent = ({ senderName }) => {
  return (
    <View style={styles.senderWrap}>
      <Text>
        {getSysMsgFormatStr(getDic('replyToUser', '%s에게 답장'), [
          { type: 'Plain', data: getDictionary(senderName) },
        ])}
      </Text>
    </View>
  );
};

const ContextComponent = ({ blockChat, context, roomInfo, fileInfos }) => {
  const { sizes } = useTheme();
  const [drawText, setDrawText] = useState(<View />);

  useEffect(() => {
    const pattern = new RegExp(
      /[<](LINK|NEWLINE|TAG|STICKER|MENTION|MOVE)[^>]*[/>]/,
      'gi',
    );

    let newLineJSX = [];
    let returnJSX = [];
    let beforeLastIndex = 0;
    let match = null;

    while ((match = pattern.exec(context)) != null) {
      if (match.index > 0 && match.index > beforeLastIndex) {
        returnJSX.push(
          <Plain
            key={returnJSX.length}
            text={context.substring(beforeLastIndex, match.index)}
            style={{ fontSize: sizes.chat }}
          />,
        );
      }

      const attrs = getAttribute(match[0]);

      if (match[1] === 'LINK') {
        returnJSX.push(
          <Link
            key={returnJSX.length}
            style={{ fontSize: sizes.chat }}
            {...attrs}
          />,
        );
      } else if (match[1] === 'NEWLINE') {
        if (returnJSX.length === 0) {
          newLineJSX.push(
            <View key={newLineJSX.length} style={styles.lineBreaker}>
              <Plain key="newline_0" text="" style={{ fontSize: sizes.chat }} />
            </View>,
          );
        } else {
          newLineJSX.push(
            <View key={newLineJSX.length} style={styles.lineBreaker}>
              {[...returnJSX]}
            </View>,
          );

          returnJSX = [];
        }
      } else if (match[1] === 'TAG') {
        returnJSX.push(
          <Tag
            key={returnJSX.length}
            style={{ fontSize: sizes.chat }}
            {...attrs}
          />,
        );
      } else if (match[1] === 'STICKER') {
        returnJSX.push(<Sticker key={returnJSX.length} {...attrs} />);
      } else if (match[1] === 'MENTION') {
        returnJSX.push(
          roomInfo && (
            <Mention
              key={returnJSX.length}
              mentionInfo={roomInfo.members}
              style={{ ...styles.sentMentionText, fontSize: sizes.chat }}
              {...attrs}
            />
          ),
        );
      } else if (match[1] === 'MOVE') {
        returnJSX.push(
          <Plain
            key={returnJSX.length}
            text={'?'}
            style={{ fontSize: sizes.chat }}
          />,
        );
      } else {
      }
      beforeLastIndex = match.index + match[0].length;
    }

    if (beforeLastIndex < context?.length) {
      returnJSX.push(
        <Plain
          key={returnJSX.length}
          text={context.substr(beforeLastIndex)}
          style={{ fontSize: sizes.chat }}
        />,
      );
    }

    if (returnJSX.length > 0) {
      newLineJSX.push(
        <View key={newLineJSX.length} style={styles.lineBreaker}>
          {[...returnJSX]}
        </View>,
      );
    }
    setDrawText(newLineJSX);
  }, [context]);

  if (blockChat) {
    return (
      <View style={styles.contextWrap}>
        <Text>{getDic('BlockChat', '차단된 메시지 입니다.')}</Text>
      </View>
    );
  } else {
    if (context) {
      return <View style={styles.contextWrap}>{drawText}</View>;
    } else {
      let contextMsg = context;
      if (fileInfos) {
        const isFileArray = Array.isArray(fileInfos);
        if (isFileArray) {
          contextMsg = getSysMsgFormatStr(
            fileInfos[0].isImage === 'Y'
              ? getDic('Tmp_imgExCnt', '사진 외 %s건')
              : getDic('Tmp_fileExCnt', '파일 외 %s건'),
            [{ type: 'Plain', data: fileInfos.length - 1 }],
          );
        } else {
          contextMsg =
            fileInfos.isImage === 'Y'
              ? getDic('Image', '사진')
              : getDic('File', '파일');
        }
      } else {
        contextMsg = getDic('Msg_NoMessages', '대화내용 없음');
      }
      return (
        <View style={styles.contextWrap}>
          <Text>{contextMsg}</Text>
        </View>
      );
    }
  }
};

const MessagePostReplyBox = ({ replyMessage, roomType }) => {
  const dispatch = useDispatch();
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const [emoticon, setEmoticon] = useState(null);
  const [isFile, setIsFile] = useState(false);
  const [fileInfos, setFileInfos] = useState(null);
  const [senderName, setSenderName] = useState(null);
  const [blockChat, setBlockChat] = useState(false);
  const [blockFile, setBlockFile] = useState(false);
  const [context, setContext] = useState(null);
  const roomInfo = useSelector(
    ({ room, channel }) => room.currentRoom || channel.currentChannel,
  );
  const { sizes } = useTheme();

  useEffect(() => {
    if (replyMessage) {
      const senderInfo = isJSONStr(replyMessage.senderInfo)
        ? JSON.parse(replyMessage.senderInfo)
        : replyMessage.senderInfo;

      setSenderName(senderInfo.name);

      const targetInfo = {
        id: replyMessage.sender,
        deptCode: replyMessage.deptCode,
      };

      const chineseWallResult = isBlockCheck({
        targetInfo,
        chineseWall,
      });
      setBlockChat(chineseWallResult.blockChat);
      setBlockFile(chineseWallResult.blockFile);

      if (!blockFile) {
        const fileCheck = !!replyMessage?.fileInfos;
        setIsFile(fileCheck);
        if (fileCheck) {
          const file = isJSONStr(replyMessage.fileInfos)
            ? JSON.parse(replyMessage.fileInfos)
            : replyMessage.fileInfos;
          setFileInfos(file);
        }
      }

      if (!blockChat) {
        const result = convertEumTalkProtocol(replyMessage?.context, {
          messageType: roomType.toLowerCase(),
        });

        if (result.type === 'emoticon') {
          setEmoticon(result.message);
          setContext(getDic('Emoticon', '이모티콘'));
        } else {
          setContext(result.message || '');
        }
      }
    }
    return () => {
      setSenderName(null);
      setBlockChat(false);
      setBlockFile(false);
      setIsFile(null);
      setFileInfos(null);
      setEmoticon(null);
      setContext(null);
    };
  }, [dispatch, replyMessage, chineseWall, roomType]);

  useEffect(() => {
    return () => {
      dispatch(setPostReplyMessage(null));
    };
  }, [dispatch]);

  return (
    <View style={styles.container}>
      {isFile && (
        <View style={styles.fileWrap}>
          <FileComponent fileInfos={fileInfos} />
        </View>
      )}
      {emoticon && (
        <View style={styles.fileWrap}>
          <EmoticonComponent emoticon={emoticon} />
        </View>
      )}
      <View style={styles.contentWrap}>
        <SenderComponent senderName={senderName} />
        <ContextComponent
          blockChat={blockChat}
          context={context}
          roomInfo={roomInfo}
          sizes={sizes}
          fileInfos={fileInfos}
        />
      </View>

      <TouchableWithoutFeedback
        onPress={() => {
          dispatch(setPostReplyMessage(null));
        }}
      >
        <View style={styles.closeIconWrap}>
          <CloseIcon color={'#efefef'} width={25} height={25} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: 60,
    padding: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignSelf: 'center',
    bottom: 0,
    flexDirection: 'row',
  },
  fileWrap: {
    flex: 1,
    minWidth: 0,
    maxWidth: 45,
    justifyContent: 'center',
  },
  fileTypeIcon: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    resizeMode: 'contain',
  },
  contentWrap: {
    flex: 1,
    width: 'auto',
    paddingLeft: 5,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  senderWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  contextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  closeIconWrap: {
    alignSelf: 'center',
    right: 25,
  },
});

export default React.memo(MessagePostReplyBox);
