import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import {
  isJSONStr,
  getDictionary,
  convertEumTalkProtocol,
  getSysMsgFormatStr,
} from '@/lib/common';
import { isBlockCheck } from '@/lib/api/orgchart';
import { getDic } from '@/config';
import { getAttribute } from '@/lib/messageUtil';
import { Plain, Link, Tag, Sticker, Mention } from '@C/chat/message/types';
import { getFileExtension, fileTypeImage } from '@/lib/fileUtil';
import { reqThumbnail } from '@API/api';
import ScaledImage from '@C/chat/message/types/ScaledImage';

import { useTheme } from '@react-navigation/native';

const MessageReplyBox = ({
  replyID,
  replyInfo,
  roomType = 'CHAT',
  style,
  styleType,
  roomInfo,
  sizes,
  goToOriginMsg,
}) => {
  const currentRoomID = roomType === 'CHAT' ? roomInfo.roomID : roomInfo.roomId;
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const [replyMessage, setReplyMessage] = useState(null);
  const [processMsg, setProcessMsg] = useState(null);
  const [emoticon, setEmoticon] = useState(null);
  const [fileInfos, setFileInfos] = useState(null);

  const [senderName, setSenderName] = useState(null);
  const [context, setContext] = useState(null);
  const [blockFile, setBlockFile] = useState(false);
  const [blockChat, setBlockChat] = useState(false);
  const [isMsgDelete, setIsMsgDelete] = useState(false);
  const [isFile, setIsFile] = useState(false);

  useEffect(() => {
    if (replyID && replyInfo) {
      setReplyMessage(isJSONStr(replyInfo) ? JSON.parse(replyInfo) : replyInfo);
    } else {
      setIsMsgDelete(true);
    }
    return () => {
      setReplyMessage(null);
    };
  }, [replyID, replyInfo]);

  useEffect(() => {
    if (replyMessage) {
      const sender =
        getDictionary(replyMessage?.senderName) || replyMessage?.sender;
      setSenderName(sender || '@Unknown');

      const result = convertEumTalkProtocol(replyMessage?.context, {
        messageType: roomType.toLowerCase(),
      });
      setContext(result?.message || '');

      setProcessMsg(result);

      const targetInfo = {
        id: replyMessage.sender,
        deptCode: replyMessage.deptCode,
      };

      const chineseWallResult = isBlockCheck({ targetInfo, chineseWall });
      setBlockChat(chineseWallResult.blockChat);
      setBlockFile(chineseWallResult.blockFile);

      setIsFile(!!replyMessage?.fileInfos);
      if (!!replyMessage?.fileInfos) {
        const file = isJSONStr(replyMessage.fileInfos)
          ? JSON.parse(replyMessage.fileInfos)
          : replyMessage.fileInfos;
        setFileInfos(file);
      }
    }
    return () => {
      setSenderName(null);
      setContext(null);
      setFileInfos(null);
      setProcessMsg(null);
      setBlockChat(false);
      setBlockFile(false);
    };
  }, [replyMessage, chineseWall, roomType]);

  useEffect(() => {
    if (processMsg) {
      if (processMsg.type === 'emoticon') {
        setEmoticon(processMsg.message);
        setContext(getDic('emoticon', '이모티콘'));
      } else {
        let contextMsg = processMsg.message;
        if (isFile) {
          if (!contextMsg) {
            const isFileArray = Array.isArray(fileInfos);
            if (isFileArray) {
              contextMsg = !blockFile
                ? getSysMsgFormatStr(
                    fileInfos[0].isImage === 'Y'
                      ? getDic('Tmp_imgExCnt', '사진 외 %s건')
                      : getDic('Tmp_fileExCnt', '파일 외 %s건'),
                    [{ type: 'Plain', data: fileInfos.length - 1 }],
                  )
                : getDic('BlockChat', '차단된 메시지 입니다.');
            } else {
              contextMsg = !blockFile
                ? fileInfos.isImage === 'Y'
                  ? getDic('Image', '사진')
                  : getDic('File', '파일')
                : getDic('BlockChat', '차단된 메시지 입니다.');
            }
          }
        } else {
          contextMsg = blockChat
            ? getDic('BlockChat', '차단된 메시지 입니다.')
            : processMsg.message;
        }
        setContext(contextMsg || getDic('Msg_NoMessages', '대화내용 없음'));
      }
    }
    return () => {
      setEmoticon(null);
      setContext(null);
    };
  }, [processMsg, blockChat, blockFile, isFile, fileInfos]);

  return (
    <View style={styles.container}>
      {(isMsgDelete && (
        <View style={styles.replyWrap}>
          <Text>{getDic('Msg_Deleted', '삭제된 메시지 입니다.')}</Text>
        </View>
      )) || (
        <TouchableOpacity
          style={styles.replyWrap}
          onPress={() => {
            goToOriginMsg(currentRoomID, replyID);
          }}
        >
          {emoticon && <EmoticonComponent emoticon={emoticon} />}
          {isFile && <FileComponent fileInfos={fileInfos} />}
          <ContentComponent
            senderName={senderName}
            blockChat={blockChat}
            context={context}
            style={style}
            styleType={styleType}
            roomInfo={roomInfo}
            sizes={sizes}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const EmoticonComponent = ({ emoticon }) => {
  const pattern = new RegExp(
    /[<](LINK|NEWLINE|TAG|STICKER|MENTION)[^>]*[/>]/,
    'gi',
  );
  const match = pattern.exec(emoticon);
  const attrs = getAttribute(match?.[0]);
  return (
    <View style={styles.fileWrap}>
      <Sticker style={{ width: 45, height: 45 }} {...attrs} />
    </View>
  );
};

const FileComponent = ({ fileInfos }) => {
  const isFileArray = Array.isArray(fileInfos);
  const file = isFileArray ? fileInfos[0] : fileInfos;

  const [thumbnailURL, setThumbnailURL] = useState(null);

  useEffect(() => {
    if (file.thumbnail) {
      setThumbnailURL({ uri: reqThumbnail(file.token) });
    } else if (file.image && file.isTemp) {
      setThumbnailURL({ uri: file.thumbDataURL });
    }
  }, [file]);

  if (!file) return <></>;

  if (file.isImage === 'Y') {
    return (
      <View style={styles.fileWrap}>
        <ScaledImage source={thumbnailURL} scaledWidth={45} scaledHeight={45} />
      </View>
    );
  } else {
    return (
      <View style={styles.fileWrap}>
        <Image
          style={styles.fileTypeIcon}
          source={fileTypeImage[getFileExtension(file.ext)]}
        />
      </View>
    );
  }
};

const ContentComponent = ({
  senderName,
  blockChat,
  context,
  style,
  styleType,
  roomInfo,
  sizes,
}) => {
  return (
    <View style={styles.contentWrap}>
      <SenderComponent senderName={senderName} />
      <ContextComponent
        blockChat={blockChat}
        context={context}
        style={style}
        styleType={styleType}
        roomInfo={roomInfo}
        sizes={sizes}
      />
    </View>
  );
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

const ContextComponent = ({
  blockChat,
  context,
  marking,
  styleType,
  roomInfo,
}) => {
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
            marking={marking}
            style={{
              ...styles[styleType],
              fontSize: sizes.chat,
              width: '100%',
            }}
            ellipsizeMode="tail"
            numberOfLines={1}
          />,
        );
      }

      const attrs = getAttribute(match[0]);

      if (match[1] === 'LINK') {
        returnJSX.push(
          <Link
            key={returnJSX.length}
            marking={marking}
            style={{ ...styles[styleType], fontSize: sizes.chat }}
            {...attrs}
          />,
        );
      } else if (match[1] === 'NEWLINE') {
        if (returnJSX.length === 0) {
          newLineJSX.push(
            <View key={newLineJSX.length} style={styles.lineBreaker}>
              <Plain
                key="newline_0"
                text=""
                marking={marking}
                style={{
                  ...styles[styleType],
                  fontSize: sizes.chat,
                  width: '100%',
                }}
                ellipsizeMode="tail"
                numberOfLines={1}
              />
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
            marking={marking}
            style={{ ...styles[styleType], fontSize: sizes.chat }}
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
              marking={marking}
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
            marking={marking}
            style={{
              ...styles[styleType],
              fontSize: sizes.chat,
              width: '100%',
            }}
            ellipsizeMode="tail"
            numberOfLines={1}
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
          marking={marking}
          style={{ ...styles[styleType], fontSize: sizes.chat, width: '100%' }}
          ellipsizeMode="tail"
          numberOfLines={1}
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
      return <></>;
    }
  }
};

const styles = StyleSheet.create({
  container: {
    minWidth: 200,
    maxWidth: 200,
  },
  replyWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingBottom: 5,
  },
  fileWrap: {
    flex: 1,
    minWidth: 0,
    maxWidth: 45,
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
  },
  contextWrap: {
    flex: 1,
  },
  fileTypeImage: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    resizeMode: 'contain',
  },
  fileTypeIcon: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    resizeMode: 'contain',
  },
});

export default React.memo(MessageReplyBox);
