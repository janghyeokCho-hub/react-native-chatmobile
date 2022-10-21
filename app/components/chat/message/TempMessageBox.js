import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  reSendMessage,
  removeTempMessage,
  reSendChannelMessage,
  removeChannelTempMessage,
} from '@/modules/message';
import Message from '@/components/chat/message/Message';
import { eumTalkRegularExp, convertEumTalkProtocol } from '@/lib/common';
import FileMessageBox from '@C/chat/message/FileMessageBox';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { getDic } from '@/config';

const chatSendImg = require('@C/assets/ico_chat_sending.png');
const messageResendImg = require('@C/assets/ico_message_resend.png');
const messageDeleteImg = require('@C/assets/ico_message_delete.png');

const TempMessageBox = ({ message, type }) => {
  const dispatch = useDispatch();

  const handleFailMessage = () => {
    Alert.alert(
      null,
      '메시지 전송을 실패하였습니다. 재발송하시겠습니까?',
      [
        {
          text: '재발송',
          onPress: () => {
            // dispatch(reSendMessage(message));
            dispatch(
              message.roomType === 'C'
                ? reSendChannelMessage(message)
                : reSendMessage(message),
            );
          },
        },
        {
          text: getDic('Delete'),
          onPress: () => {
            // dispatch(removeTempMessage(message.tempId));
            dispatch(
              message.roomType === 'C'
                ? removeChannelTempMessage(message.tempId)
                : removeTempMessage(message.tempId),
            );
          },
        },
      ],
      { cancelable: true },
    );
  };

  const drawFileContext = useMemo(() => {
    if (message.sendFileInfo) {
      const flieInfoObj = message.sendFileInfo.fileInfos;

      return (
        <View style={[styles.textOnly, styles.replies]}>
          <View style={[styles.chatInfo]}>
            {message.status === 'send' && (
              <Image style={styles.sending} source={chatSendImg} />
            )}
            {message.status === 'fail' && (
              <TouchableOpacity onPress={handleFailMessage}>
                <View style={styles.resendDelete}>
                  <View style={styles.resend}>
                    <Svg
                      width="13.833"
                      height="12.37"
                      viewBox="0 0 11.833 10.37"
                    >
                      <Path
                        d="M12.794,8.064h-1.5v-.13a5.172,5.172,0,1,0-1.983,4.215L8.423,11.2A3.891,3.891,0,1,1,10,7.934v.13H8.313l2.209,2.462,2.272-2.462Z"
                        transform="translate(-0.961 -2.878)"
                        fill="#fff"
                      />
                    </Svg>
                  </View>
                  <View style={styles.delete}>
                    <Svg
                      width="10.976"
                      height="10.988"
                      viewBox="0 0 8.976 8.988"
                    >
                      <G transform="translate(0 0)">
                        <G transform="translate(0 0)">
                          <Path
                            d="M128.471,136.971a.621.621,0,0,0,.441.189.6.6,0,0,0,.441-.189l3.42-3.42,3.42,3.42a.621.621,0,0,0,.441.189.6.6,0,0,0,.441-.189.64.64,0,0,0,0-.892l-3.41-3.41,3.41-3.42a.64.64,0,0,0,0-.892.63.63,0,0,0-.892,0l-3.41,3.42-3.42-3.41a.631.631,0,0,0-.892.892l3.42,3.41-3.41,3.42A.608.608,0,0,0,128.471,136.971Z"
                            transform="translate(-128.279 -128.173)"
                            fill="#fff"
                          />
                        </G>
                      </G>
                    </Svg>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
          <FileMessageBox
            messageId={`test_${message.tempId}`}
            fileObj={flieInfoObj.length == 1 ? flieInfoObj[0] : flieInfoObj}
            tempObj={{
              status: message.status,
              handleFailMessage: handleFailMessage,
            }}
            isTemp={true}
          />
        </View>
      );
    }
  }, [message]);

  const messageContext = useMemo(() => {
    let messageType = 'message';
    let drawText = message.context;
    console.log('message : ', message);

    // 처리가 필요한 message의 경우 ( protocol 이 포함된 경우 )
    if (eumTalkRegularExp.test(drawText)) {
      const processMsg = convertEumTalkProtocol(drawText, { messageType });
      messageType = processMsg.type;
      drawText = processMsg.message;
    }

    drawText = drawText.replace(/\n/gi, '<NEWLINE />');

    return (
      <Message
        style={[styles.message, styles.repliseText, styles[messageType]]}
        styleType={'repliseText'}
      >
        {drawText}
      </Message>
    );
  }, [message]);

  return (
    <View>
      {message.sendFileInfo == undefined && (
        <View style={[styles.textOnly, styles.replies]}>
          <>
            <View style={[styles.chatInfo]}>
              {message.status === 'send' && (
                <Image style={styles.sending} source={chatSendImg} />
              )}
              {message.status === 'fail' && (
                <TouchableOpacity onPress={handleFailMessage}>
                  <View style={styles.resendDelete}>
                    <View style={styles.resend}>
                      <Svg
                        width="13.833"
                        height="12.37"
                        viewBox="0 0 11.833 10.37"
                      >
                        <Path
                          d="M12.794,8.064h-1.5v-.13a5.172,5.172,0,1,0-1.983,4.215L8.423,11.2A3.891,3.891,0,1,1,10,7.934v.13H8.313l2.209,2.462,2.272-2.462Z"
                          transform="translate(-0.961 -2.878)"
                          fill="#fff"
                        />
                      </Svg>
                    </View>
                    <View style={styles.delete}>
                      <Svg
                        width="10.976"
                        height="10.988"
                        viewBox="0 0 8.976 8.988"
                      >
                        <G transform="translate(0 0)">
                          <G transform="translate(0 0)">
                            <Path
                              d="M128.471,136.971a.621.621,0,0,0,.441.189.6.6,0,0,0,.441-.189l3.42-3.42,3.42,3.42a.621.621,0,0,0,.441.189.6.6,0,0,0,.441-.189.64.64,0,0,0,0-.892l-3.41-3.41,3.41-3.42a.64.64,0,0,0,0-.892.63.63,0,0,0-.892,0l-3.41,3.42-3.42-3.41a.631.631,0,0,0-.892.892l3.42,3.41-3.41,3.42A.608.608,0,0,0,128.471,136.971Z"
                              transform="translate(-128.279 -128.173)"
                              fill="#fff"
                            />
                          </G>
                        </G>
                      </Svg>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            {message.context && messageContext}
          </>
        </View>
      )}
      {message.sendFileInfo && drawFileContext}
    </View>
  );
};

const styles = StyleSheet.create({
  textOnly: {
    margin: 5,
  },
  replies: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  repliseText: {
    justifyContent: 'center',
  },
  chatInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 2,
  },
  message: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 5,
  },
  sending: {
    width: 18,
    height: 16,
  },
  resendDelete: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: '#FB6045',
    borderRadius: 3,
    width: 43,
    height: 22,
  },
  resend: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightColor: '#c24d38',
    borderRightWidth: 1,
  },
  delete: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoticon: {
    backgroundColor: '#FFF',
  },
});

export default React.memo(TempMessageBox);
