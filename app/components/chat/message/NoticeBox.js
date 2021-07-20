import React, { useMemo } from 'react';

import ProfileBox from '@COMMON/ProfileBox';
import Notice from '@C/chat/message/Notice';
import { format } from 'date-fns';
import * as common from '@/lib/common';

import { View, Text, StyleSheet } from 'react-native';
import { getScreenWidth } from '@/lib/device/common';
import { useTheme } from '@react-navigation/native';

import { getDic } from '@/config';

const isJSONStr = str => {
  try {
    return typeof JSON.parse(str) == 'object';
  } catch (e) {
    return false;
  }
};

const NoticeBox = ({
  dateBox,
  message,
  isMine,
  nameBox,
  timeBox,
  navigation,
}) => {
  const { colors, sizes } = useTheme();
  const drawMessage = useMemo(() => {
    let drawData = message.context;

    let isJSONData = isJSONStr(drawData);
    let drawText = '';
    if (isJSONData) {
      try {
        drawData = JSON.parse(drawData);
      } catch {
        drawData = drawData;
      }
      drawText = drawData.context;
    } else {
      drawText = drawData;
    }
    let senderInfo = null;

    let messageType = 'message';

    // 처리가 필요한 message의 경우 ( protocol 이 포함된 경우 )
    if (common.eumTalkRegularExp.test(drawText)) {
      const processMsg = common.convertEumTalkProtocol(drawText, {
        messageType: 'channel',
      });
      // messageType = processMsg.type; // notice 에선 message type 고정
      drawText = processMsg.message;
      if (processMsg.type !== 'message') {
        if (typeof drawData === 'object') {
          drawData.func = {
            type: processMsg.type,
            name: getDic('MoveChannel'),
            data: processMsg.args,
          };
        } else {
          drawData = {
            context: drawData,
            func: {
              type: processMsg.type,
              name: getDic('MoveChannel'),
              data: processMsg.args,
            },
          };
        }

        isJSONData = true;
      }
    }

    if (!(typeof message.senderInfo === 'object')) {
      try {
        senderInfo = JSON.parse(message.senderInfo);
      } catch {
        senderInfo = message.senderInfo;
      }
    } else {
      senderInfo = message.senderInfo;
    }

    if (messageType == 'message') {
      drawText = common.convertURLMessage(drawText);

      // NEW LINE 처리
      drawText = drawText.replace(/\n/gi, '<NEWLINE />');
    }

    if (drawText == '') return;

    if (!isMine) {
      return (
        <>
          {drawText && (
            <>
              <View style={styles.messageBoxWrap}>
                <View
                  style={[
                    styles.textOnly,
                    nameBox ? styles.firstText : null,
                    nameBox ? styles.sentFirst : styles.sent,
                  ]}
                >
                  {nameBox && (
                    <>
                      <ProfileBox
                        userId={message.sender}
                        userName={senderInfo.name}
                        img={senderInfo.photoPath}
                        style={styles.profile}
                      />
                      <View style={[styles.sentFirstMessageBoxWrap]}>
                        <View>
                          <Text style={{ fontSize: sizes.default }}>
                            {common.getJobInfo(senderInfo)}
                          </Text>
                        </View>
                        <View>
                          <View style={styles.sentFirstMessageBox}>
                            {(isJSONData && (
                              <Notice
                                title={common.getDictionary(drawData.title)}
                                value={drawText}
                                func={drawData.func}
                                style={[
                                  !nameBox
                                    ? styles.message
                                    : styles.sentFirstMessage,
                                  styles.sentText,
                                  messageType != 'message' &&
                                    styles[messageType],
                                ]}
                                navigation={navigation}
                                styleType={'sentText'}
                              />
                            )) || (
                              <Notice
                                style={[
                                  !nameBox
                                    ? styles.message
                                    : styles.sentFirstMessage,
                                  styles.sentText,
                                  messageType != 'message' &&
                                    styles[messageType],
                                ]}
                                navigation={navigation}
                                styleType={'sentText'}
                                value={drawText}
                              />
                            )}
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
                          </View>
                        </View>
                      </View>
                    </>
                  )}
                  {!nameBox && (
                    <>
                      {(isJSONData && (
                        <Notice
                          title={common.getDictionary(drawData.title)}
                          value={drawText}
                          func={drawData.func}
                          style={[
                            !nameBox ? styles.message : styles.sentFirstMessage,
                            styles.sentText,
                            messageType != 'message' && styles[messageType],
                          ]}
                          navigation={navigation}
                          styleType={'sentText'}
                        />
                      )) || (
                        <Notice
                          style={[
                            !nameBox ? styles.message : styles.sentFirstMessage,
                            styles.sentText,
                            messageType != 'message' && styles[messageType],
                          ]}
                          navigation={navigation}
                          styleType={'sentText'}
                          value={drawText}
                        />
                      )}
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
                    </>
                  )}
                </View>
              </View>
            </>
          )}
        </>
      );
    } else {
      return (
        <>
          {drawText && (
            <>
              <View
                style={
                  ([styles.messageBoxWrap, styles.sentFirstMessageBoxWrap],
                  { justifyContent: 'flex-end', marginLeft: 60 })
                }
              >
                <View style={[styles.textOnly, styles.replies]}>
                  <>
                    <View style={styles.chatInfo}>
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
                    {(isJSONData && (
                      <Notice
                        title={drawData.title}
                        value={drawText}
                        func={drawData.func}
                        style={[
                          styles.message,
                          styles.sentText,
                          messageType != 'message' && styles[messageType],
                        ]}
                        navigation={navigation}
                        styleType={'sentText'}
                      />
                    )) || (
                      <Notice
                        style={[
                          styles.message,
                          styles.sentText,
                          messageType != 'message' && styles[messageType],
                        ]}
                        navigation={navigation}
                        styleType={'sentText'}
                        value={drawText}
                      />
                    )}
                  </>
                </View>
              </View>
            </>
          )}
        </>
      );
    }
  }, [message]);

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
    width: Math.round(getScreenWidth() * 0.8) - 70,
    flexDirection: 'column',
    marginLeft: 20,
  },
  sentFirstMessageFileBoxWrap: {
    width: Math.round(getScreenWidth() * 0.8),
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
    width: '100%', // notice only
    justifyContent: 'center',
    backgroundColor: '#fff', // notice only
    alignItems: 'flex-start',
    borderWidth: 0.5,
    borderColor: '#eee',
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

export default React.memo(NoticeBox, (currProps, nextProps) => {
  return currProps.message === nextProps.message;
});
