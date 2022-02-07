import React, { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProfileBox from '@COMMON/ProfileBox';
import Message from '@C/chat/message/Message';
import { format } from 'date-fns';
import * as common from '@/lib/common';
import LinkMessageBox from '@C/chat/message/LinkMessageBox';
import FileMessageBox from '@C/chat/message/FileMessageBox';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { linkPreview } from '@/lib/api/api';
import { getScreenWidth } from '@/lib/device/common';
import Svg, { G, Rect, Circle } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';
import { openMsgUtilBox } from '@/lib/messageUtil';

const MessageBox = ({
  dateBox,
  message,
  isMine,
  nameBox,
  timeBox,
  id,
  navigation,
  marking,
}) => {
  const { sizes, colors } = useTheme();
  const currMember = useSelector(({ room }) => room.currentRoom.members);
  const [linkData, setLinkData] = useState(null);

  const isOldMember = useMemo(() => {
    return (
      currMember &&
      currMember.find(item => item.id == message.sender) == undefined
    );
  }, [currMember]);

  const handleProfilePopup = senderId => {
    navigation.navigate('ProfilePopup', { targetID: senderId });
  };

  const dispatch = useDispatch();

  const msgUtilBox = useCallback(() => {
    openMsgUtilBox(message, dispatch);
  }, [message, dispatch]);

  const drawMessage = useMemo(() => {
    let drawText = message.context;

    let nameBoxVisible = nameBox;

    let senderInfo = null;

    let urlInfoJSX = null;
    let fileInfoJSX = null;

    let roomId = null;

    let messageType = 'message';

    // 처리가 필요한 message의 경우 ( protocol 이 포함된 경우 )
    if (common.eumTalkRegularExp.test(drawText)) {
      const processMsg = common.convertEumTalkProtocol(drawText, {
        messageType: 'room',
      });
      messageType = processMsg.type;
      roomId = processMsg.roomInfo.roomId;
      drawText = processMsg.message;
    }

    if (!isMine) {
      if (!(typeof message.senderInfo === 'object')) {
        senderInfo = JSON.parse(message.senderInfo);
      } else {
        senderInfo = message.senderInfo;
      }
    }

    if (messageType == 'message') {
      let index = 0;

      if (drawText) {
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

        if (linkInfoObj && link) {
          urlInfoJSX = (
            <View
              style={[styles.textOnly, isMine ? styles.replies : styles.sent]}
              key={`${message.messageID}_linkThumnail`}
            >
              {!isMine && <LinkMessageBox link={link} linkData={linkInfoObj} />}
              {!message.fileInfos && (
                <View style={isMine ? styles.chatInfo : styles.chatInfoSent}>
                  {message.unreadCnt > 0 && (
                    <Text
                      style={{ ...styles.unreadCnt, color: colors.primary }}
                    >
                      {message.unreadCnt}
                    </Text>
                  )}
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
        }
      } else {
        const checkURLResult = common.checkURL(drawText);
        // 링크 썸네일 처리
        if (checkURLResult.isURL) {
          linkPreview(
            checkURLResult.url,
            args => {
              setLinkData(args);
            },
            message.messageID,
          );
        }
      }

      // Link 처리
      drawText = common.convertURLMessage(drawText);

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
              {nameBoxVisible && (
                <>
                  <TouchableOpacity
                    onPress={() => handleProfilePopup(message.sender)}
                  >
                    <ProfileBox
                      userId={message.sender}
                      userName={senderInfo.name}
                      presence={senderInfo.presence}
                      isInherit={isOldMember ? false : true}
                      img={senderInfo.photoPath}
                      style={styles.profile}
                    />
                  </TouchableOpacity>
                  <View style={styles.sentFirstMessageFileBoxWrap}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: sizes.default }}>
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
                    <View style={{ flex: 1 }}>
                      <FileMessageBox
                        messageId={message.messageID}
                        fileObj={fileInfoJSON}
                        id={!drawText && id}
                      />
                    </View>
                  </View>
                </>
              )}
              {!nameBoxVisible && (
                <View style={nameBoxVisible ? { marginLeft: 60 } : {}}>
                  <FileMessageBox
                    messageId={message.messageID}
                    fileObj={fileInfoJSON}
                    id={!drawText && id}
                  />
                </View>
              )}
              <View style={styles.chatInfoSent}>
                {message.unreadCnt > 0 && (
                  <Text style={{ ...styles.unreadCnt, color: colors.primary }}>
                    {message.unreadCnt}
                  </Text>
                )}
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
                {message.unreadCnt > 0 && (
                  <Text style={{ ...styles.unreadCnt, color: colors.primary }}>
                    {message.unreadCnt}
                  </Text>
                )}
                {timeBox && (
                  <Text style={styles.sendTime}>
                    {format(new Date(message.sendDate), 'HH:mm')}
                  </Text>
                )}
              </View>
              <FileMessageBox
                messageId={message.messageID}
                fileObj={fileInfoJSON}
                id={!drawText && id}
              />
            </View>
          );
        }
      }

      // Tag 처리
      const tagPattern = new RegExp(/(#)([a-z가-힣0-9ㄱ-ㅎ]+)/, 'gmi');
      drawText = drawText.replace(tagPattern, `<TAG text="$1$2" value="$2" />`);

      // NEW LINE 처리
      drawText = drawText.replace(/(\r\n|\n|\r)/gi, '<NEWLINE />');
    }

    if (drawText == '') drawText = null;

    if (!isMine) {
      return (
        <>
          {(drawText && (
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
                      <TouchableOpacity
                        onPress={() => handleProfilePopup(message.sender)}
                      >
                        <ProfileBox
                          userId={message.sender}
                          userName={senderInfo.name}
                          presence={senderInfo.presence}
                          isInherit={isOldMember ? false : true}
                          img={senderInfo.photoPath}
                          style={styles.profile}
                        />
                      </TouchableOpacity>
                      <View style={[styles.sentFirstMessageBoxWrap]}>
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Text style={{ fontSize: sizes.default }}>
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
                        <View>
                          <View style={styles.sentFirstMessageBox}>
                            <Message
                              style={[
                                !nameBoxVisible
                                  ? styles.message
                                  : styles.sentFirstMessage,
                                styles.sentText,
                                messageType != 'message' && styles[messageType],
                              ]}
                              navigation={navigation}
                              styleType={'sentText'}
                              marking={marking}
                              longPressEvt={msgUtilBox}
                            >
                              {drawText}
                            </Message>
                            {!fileInfoJSX && !urlInfoJSX && (
                              <View style={styles.chatInfoSent}>
                                {message.unreadCnt > 0 && (
                                  <Text
                                    style={{
                                      ...styles.unreadCnt,
                                      color: colors.primary,
                                    }}
                                  >
                                    {message.unreadCnt}
                                  </Text>
                                )}
                                {timeBox && (
                                  <Text style={styles.sendTime}>
                                    {format(
                                      new Date(message.sendDate),
                                      'HH:mm',
                                    )}
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </>
                  )}
                  {!nameBoxVisible && (
                    <>
                      <Message
                        style={[
                          styles.message,
                          styles.sentText,
                          messageType != 'message' && styles[messageType],
                        ]}
                        navigation={navigation}
                        styleType={'sentText'}
                        marking={marking}
                        longPressEvt={msgUtilBox}
                      >
                        {drawText}
                      </Message>
                      {!fileInfoJSX && !urlInfoJSX && (
                        <View style={styles.chatInfoSent}>
                          {message.unreadCnt > 0 && (
                            <Text
                              style={{
                                ...styles.unreadCnt,
                                color: colors.primary,
                              }}
                            >
                              {message.unreadCnt}
                            </Text>
                          )}
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
              {fileInfoJSX && fileInfoJSX}
            </>
          )) || (
            <View style={styles.messageBoxWrap}>
              {fileInfoJSX && fileInfoJSX}
            </View>
          )}
        </>
      );
    } else {
      return (
        <>
          {drawText && (
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
                      {message.unreadCnt > 0 && (
                        <Text
                          style={{ ...styles.unreadCnt, color: colors.primary }}
                        >
                          {message.unreadCnt}
                        </Text>
                      )}
                      {timeBox && (
                        <Text style={styles.sendTime}>
                          {format(new Date(message.sendDate), 'HH:mm')}
                        </Text>
                      )}
                    </View>
                  )}
                  <Message
                    style={[
                      styles.message,
                      styles.repliseText,
                      messageType != 'message' && styles[messageType],
                    ]}
                    eleId={id}
                    navigation={navigation}
                    marking={marking}
                    styleType={'repliseText'}
                    longPressEvt={msgUtilBox}
                  >
                    {drawText}
                  </Message>
                </View>
              </View>
              {urlInfoJSX && urlInfoJSX}
            </>
          )}
          {fileInfoJSX && fileInfoJSX}
        </>
      );
    }
  }, [message, marking, linkData, timeBox, nameBox]);

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
    marginLeft: 10,
    marginTop: 5,
    marginRight: 10,
    marginBottom: 5,
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
  sentFirstMessageFileBoxWrap: {
    maxWidth: Math.round(getScreenWidth() * 0.8),
    flexDirection: 'column',
    marginLeft: 20,
  },
  sentFirstMessageBox: {
    maxWidth: '100%',
    flexDirection: 'row',
    marginTop: 5,
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
  unreadCnt: {
    fontWeight: '700',
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

export default React.memo(MessageBox, (currProps, nextProps) => {
  return (
    currProps.message === nextProps.message &&
    currProps.nameBox === nextProps.nameBox &&
    currProps.timeBox === nextProps.timeBox
  );
});
