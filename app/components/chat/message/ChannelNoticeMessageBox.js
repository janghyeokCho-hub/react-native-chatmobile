import React, { useState, useMemo, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import ProfileBox from '@COMMON/ProfileBox';
import { format } from 'date-fns';
import * as common from '@/lib/common';
import LinkMessageBox from '@C/chat/message/LinkMessageBox';
import FileMessageBox from '@C/chat/message/FileMessageBox';
import { getDic } from '@/config';
import { getScreenWidth } from '@/lib/device/common';
import Svg, { G, Rect, Circle } from 'react-native-svg';
import * as LoginInfo from '@/lib/class/LoginInfo';
import useMemberInfo from '@/lib/hooks/useMemberInfo';
import { Plain, Link, Mention } from '@C/chat/message/types';
import ChannelNoticeIcon from '@/components/common/icons/ChannelNoticeIcon';
import { getAttribute } from '@/lib/messageUtil';

const ChannelNoticeMessageBox = ({
  dateBox,
  message,
  isMine,
  nameBox,
  timeBox,
  id,
  marking,
  navigation,
  isBlock,
}) => {
  const currMember = useSelector(
    ({ channel }) => channel.currentChannel.members,
  );
  const [linkData, setLinkData] = useState(null);
  const { colors, sizes } = useTheme();
  const isOldMember = useMemo(() => {
    return (
      currMember &&
      currMember.find(item => item.id == message.sender) == undefined
    );
  }, [currMember]);
  const context = useMemo(() => {
    const text = isBlock
      ? getDic('BlockChat', '차단된 메시지 입니다.')
      : message.context;
    return common.convertURLMessage(text);
  }, [message.context, isBlock]);
  const [processedContext, setProcessedContext] = useState([]);
  const { findMemberInfo } = useMemberInfo('channel');

  const generateJSX = async () => {
    const pattern = new RegExp(/[<](MENTION|LINK)[^>]*[/>]/, 'gi');
    const returnJSX = [];
    let match = null;
    let beforeLastIndex = 0;

    if (
      common.eumTalkRegularExp.test(context) ||
      /[<](LINK)[^>]*[/>]/.test(context)
    ) {
      const { type, message, mentionInfo } = common.convertEumTalkProtocol(
        context,
        { messageType: 'channel' },
      );
      while ((match = pattern.exec(message)) !== null) {
        if (match.index > 0 && match.index > beforeLastIndex) {
          const txt = message.substring(beforeLastIndex, match.index);
          returnJSX.push(<Plain key={returnJSX.length} text={txt} />);
        }

        const attrs = getAttribute(match[0]);
        if (match[1] === 'MENTION') {
          const memberInfo = await findMemberInfo(mentionInfo, attrs.targetId);
          returnJSX.push(
            <Mention
              key={returnJSX.length}
              marking={marking}
              mentionInfo={mentionInfo}
              style={{ ...styles.sentMentionText, fontSize: sizes.chat }}
              navigation={navigation}
              // 현재
              longPressEvt={() => {}}
              {...attrs}
            />,
          );
        } else if (match[1] === 'LINK') {
          returnJSX.push(<Link key={returnJSX.length} {...attrs} />);
        }
        beforeLastIndex = match.index + match[0].length;
      }

      if (beforeLastIndex < message.length) {
        const txt = message.substring(beforeLastIndex);
        returnJSX.push(<Plain key={returnJSX.length} text={txt} />);
      }
    } else {
    }

    if (beforeLastIndex === 0 && returnJSX.length === 0) {
      returnJSX.push(<Plain key={returnJSX.length} text={context} />);
    }

    return returnJSX;
  };

  useEffect(() => {
    generateJSX().then(jsx => {
      setProcessedContext(jsx);
    });
  }, [context]);

  const drawMessage = useMemo(() => {
    let nameBoxVisible = nameBox;
    let senderInfo = null;

    let urlInfoJSX = null;
    let fileInfoJSX = null;

    let mentionInfo = [];
    let messageType = 'message';
    // let procValMsgMessage = drawText;
    let returnJSX = [];
    let match = null;
    if (!isMine) {
      if (!(typeof message.senderInfo === 'object')) {
        senderInfo = JSON.parse(message.senderInfo);
      } else {
        senderInfo = message.senderInfo;
      }
    }

    if (messageType === 'message') {
      let index = 0;

      if (processedContext) {
        index = 1;
      }

      if (message.linkInfo || linkData) {
        index = 2;
        let linkInfoObj = null;
        let link = '';
        if (message.linkInfo != null) {
          if (typeof message.linkInfo == 'object') {
            linkInfoObj = message.linkInfo.thumbNailInfo;
            link = message.linkInfo.link;
          } else {
            const linkInfoJSON = JSON.parse(message.linkInfo);
            linkInfoObj = linkInfoJSON.thumbNailInfo;
            link = linkInfoJSON.link;
          }
        } else {
          linkInfoObj = linkData.thumbNailInfo;
          link = linkData.link;
        }

        urlInfoJSX = (
          <View
            style={[styles.textOnly, isMine ? styles.replies : styles.sent]}
            key={`${message.messageID}_linkThumnail`}
          >
            {!isMine && <LinkMessageBox link={link} linkData={linkInfoObj} />}
            {!message.fileInfos && (
              <View style={isMine ? styles.chatInfo : styles.chatInfoSent}>
                {/* {message.unreadCnt > 0 && (
                  <Text style={styles.unreadCnt}>{message.unreadCnt}</Text>
                )} */}
                {timeBox && (
                  <Text style={styles.sendTime}>
                    {format(new Date(message.sendDate), 'HH:mm')}
                  </Text>
                )}
              </View>
            )}
            {isMine && <LinkMessageBox link={link} linkData={linkInfoObj} />}
          </View>
        );
      } else {
      }

      if (message.fileInfos) {
        const fileInfoJSON = JSON.parse(message.fileInfos);
        if (!isMine) {
          fileInfoJSX = (
            <View
              style={[
                styles.textOnly,
                styles.sent,
                nameBoxVisible && index == 0 ? styles.firstText : null,
                nameBoxVisible ? styles.sentFirst : null,
              ]}
            >
              {nameBoxVisible && index == 0 && (
                <>
                  <ProfileBox
                    userId={message.sender}
                    userName={senderInfo.name}
                    presence={senderInfo.presence}
                    isInherit={isOldMember ? false : true}
                    img={senderInfo.photoPath}
                    style={styles.profile}
                  />
                  <View style={[styles.sentFirstMessage]}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Text style={styles.msgname}>
                        {common.getJobInfo(senderInfo)}
                      </Text>
                      {senderInfo.isMobile === 'Y' && (
                        <View style={{ paddingLeft: 5 }}>
                          <Svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="9"
                            height="12"
                            viewBox="0 0 7 10"
                          >
                            <G transform="translate(-185 -231)">
                              <Rect
                                width="7"
                                height="10"
                                transform="translate(185 231)"
                                fill="#4f5050"
                              />
                              <Rect
                                width="5"
                                height="6"
                                transform="translate(186 232)"
                                fill="#fff"
                              />
                              <Circle
                                cx="0.5"
                                cy="0.5"
                                r="0.5"
                                transform="translate(188 239)"
                                fill="#fff"
                              />
                            </G>
                          </Svg>
                        </View>
                      )}
                    </View>
                    <FileMessageBox
                      messageId={message.messageID}
                      fileObj={fileInfoJSON}
                      id={!processedContext && id}
                    />
                  </View>
                </>
              )}
              {!(nameBoxVisible && index == 0) && (
                <FileMessageBox
                  messageId={message.messageID}
                  fileObj={fileInfoJSON}
                  id={!processedContext && id}
                />
              )}
              <View style={styles.chatInfoSent}>
                {/* {message.unreadCnt > 0 && (
                  <Text style={styles.unreadCnt}>{message.unreadCnt}</Text>
                )} */}
                {timeBox && (
                  <Text style={styles.sendTime}>
                    {format(new Date(message.sendDate), 'HH:mm')}
                  </Text>
                )}
              </View>
            </View>
          );
        } else {
          fileInfoJSX = (
            <View
              style={[
                styles.textOnly,
                styles.replies,
                nameBoxVisible && index == 0 ? styles.firstText : null,
              ]}
            >
              <View style={styles.chatInfo}>
                {/* {message.unreadCnt > 0 && (
                  <Text style={styles.unreadCnt}>{message.unreadCnt}</Text>
                )} */}
                {timeBox && (
                  <Text style={styles.sendTime}>
                    {format(new Date(message.sendDate), 'HH:mm')}
                  </Text>
                )}
              </View>
              <FileMessageBox
                messageId={message.messageID}
                fileObj={fileInfoJSON}
                id={!processedContext && id}
              />
            </View>
          );
        }
      }

      // Tag 처리
      // const tagPattern = new RegExp(/#([^#\s,;]+)/, 'gm');
      // drawText = drawText.replace(tagPattern, (item, plainText) => {
      //   return `<TAG text="${item}" value="${plainText}" />`;
      // });

      // NEW LINE 처리
      // drawText = drawText.replace(/\n/gi, '<NEWLINE />');
    }

    // if (drawText == '') drawText = null;

    // isMine == null 일 경우를 처리해줘야함
    if (
      senderInfo != null &&
      senderInfo.name != LoginInfo.getLoginInfo().userInfo.name
    ) {
      return (
        <>
          {processedContext && (
            <>
              <View style={styles.messageBoxWrap}>
                <View
                  style={[
                    styles.textOnly,
                    nameBoxVisible ? styles.firstText : null,
                    nameBoxVisible ? styles.sentFirst : styles.sent,
                  ]}
                >
                  {nameBoxVisible && (
                    <>
                      <ProfileBox
                        userId={message.sender}
                        userName={senderInfo.name}
                        presence={senderInfo.presence}
                        isInherit={isOldMember ? false : true}
                        img={senderInfo.photoPath}
                        style={styles.profile}
                      />
                      <View style={[styles.sentFirstMessageBoxWrap]}>
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Text style={styles.msgname}>
                            {common.getJobInfo(senderInfo)}
                          </Text>
                          {senderInfo.isMobile === 'Y' && (
                            <View style={{ paddingLeft: 5 }}>
                              <Svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="9"
                                height="12"
                                viewBox="0 0 7 10"
                              >
                                <G transform="translate(-185 -231)">
                                  <Rect
                                    width="7"
                                    height="10"
                                    transform="translate(185 231)"
                                    fill="#4f5050"
                                  />
                                  <Rect
                                    width="5"
                                    height="6"
                                    transform="translate(186 232)"
                                    fill="#fff"
                                  />
                                  <Circle
                                    cx="0.5"
                                    cy="0.5"
                                    r="0.5"
                                    transform="translate(188 239)"
                                    fill="#fff"
                                  />
                                </G>
                              </Svg>
                            </View>
                          )}
                        </View>
                        <View style={styles.sentFirstMessageBox}>
                          <TouchableOpacity
                            style={{
                              borderColor: '#e0e0e0',
                              borderWidth: 0.8,
                              backgroundColor: 'white',
                              borderRadius: 5,
                              padding: 15,
                            }}
                          >
                            <View style={{ flexDirection: 'row' }}>
                              <ChannelNoticeIcon
                                color="black"
                                width="24"
                                height="24"
                              />
                              <Text
                                style={{
                                  color: 'black',
                                  fontSize: 12,
                                  marginLeft: 7,
                                  padding: 3,
                                }}
                              >
                                {getDic('AddNotice')}
                              </Text>
                            </View>
                            <Text style={{ marginTop: 7, color: '#777' }}>
                              {processedContext}
                            </Text>
                          </TouchableOpacity>
                          {!fileInfoJSX && !urlInfoJSX && (
                            <View style={styles.chatInfoSent}>
                              {timeBox && (
                                <Text style={styles.sendTime}>
                                  {format(new Date(message.sendDate), 'HH:mm')}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    </>
                  )}
                  {!nameBoxVisible && (
                    <>
                      <TouchableOpacity
                        style={{
                          borderColor: '#e0e0e0',
                          borderWidth: 0.8,
                          backgroundColor: 'white',
                          borderRadius: 5,
                          padding: 15,
                        }}
                      >
                        <View style={{ flexDirection: 'row' }}>
                          <ChannelNoticeIcon
                            color="black"
                            width="24"
                            height="24"
                          />
                          <Text
                            style={{
                              color: 'black',
                              fontSize: 12,
                              marginLeft: 7,
                              padding: 3,
                            }}
                          >
                            {getDic('AddNotice')}
                          </Text>
                        </View>
                        <Text style={{ marginTop: 7, color: '#777' }}>
                          {processedContext}
                        </Text>
                      </TouchableOpacity>
                      {!fileInfoJSX && !urlInfoJSX && (
                        <View style={styles.chatInfoSent}>
                          {/* {message.unreadCnt > 0 && (
                            <Text style={styles.unreadCnt}>
                              {message.unreadCnt}
                            </Text>
                          )} */}
                          {timeBox && (
                            <Text style={styles.sendTime}>
                              {format(new Date(message.sendDate), 'HH:mm')}
                            </Text>
                          )}
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
              {urlInfoJSX && urlInfoJSX}
            </>
          )}
          {fileInfoJSX && fileInfoJSX}
        </>
      );
    } else {
      // 둠칫
      return (
        <>
          {processedContext && (
            <>
              <View style={styles.messageBoxWrap}>
                <View
                  style={[
                    styles.textOnly,
                    styles.replies,
                    nameBoxVisible ? styles.firstText : null,
                  ]}
                >
                  {!fileInfoJSX && !urlInfoJSX && (
                    <View style={styles.chatInfo}>
                      {/* {message.unreadCnt > 0 && (
                        <Text style={styles.unreadCnt}>
                          {message.unreadCnt}
                        </Text>
                      )} */}
                      {timeBox && (
                        <Text style={styles.sendTime}>
                          {format(new Date(message.sendDate), 'HH:mm')}
                        </Text>
                      )}
                    </View>
                  )}
                  <TouchableOpacity
                    style={{
                      borderColor: '#e0e0e0',
                      borderWidth: 0.8,
                      backgroundColor: 'white',
                      borderRadius: 5,
                      padding: 15,
                    }}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <ChannelNoticeIcon color="black" width="24" height="24" />
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 12,
                          marginLeft: 7,
                          padding: 3,
                        }}
                      >
                        {getDic('AddNotice')}
                      </Text>
                    </View>
                    <Text style={{ marginTop: 7, color: '#777' }}>
                      {processedContext}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {urlInfoJSX && urlInfoJSX}
            </>
          )}
          {fileInfoJSX && fileInfoJSX}
        </>
      );
    }
  }, [message.context, processedContext]);

  return (
    <>
      {dateBox && dateBox}
      {drawMessage}
    </>
  );
};

const styles = StyleSheet.create({
  messageBoxWrap: {
    width: '100%',
    minHeight: 30,
  },
  firstText: {
    marginTop: 10,
  },
  textOnly: {
    margin: 5,
  },
  replies: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  repliseText: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  sent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 60,
  },
  sentFirst: {
    flexDirection: 'row',
    paddingLeft: 0,
  },
  sentFirstMessageBoxWrap: {
    maxWidth: Math.round(getScreenWidth() * 0.8) - 70,
    flexDirection: 'column',
    marginLeft: 20,
  },
  sentFirstMessageBox: {
    maxWidth: '100%',
    flexDirection: 'row',
  },
  sentFirstMessage: {
    padding: 10,
    borderRadius: 5,
    maxWidth: '100%',
  },
  sentText: {
    justifyContent: 'center',
    backgroundColor: '#efefef',
    alignItems: 'flex-start',
  },
  chatInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 2,
  },
  chatInfoSent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 2,
  },
  sendTime: {
    color: '#999',
  },
  message: {
    padding: 10,
    borderRadius: 5,
    maxWidth: '80%',
  },
  emoticon: {
    backgroundColor: '#FFF',
  },
  profile: {
    width: 40,
    height: 40,
  },
});

export default React.memo(ChannelNoticeMessageBox, (currProps, nextProps) => {
  return currProps.message === nextProps.message;
});
