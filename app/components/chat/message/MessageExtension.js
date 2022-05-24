import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { getDic, getConfig } from '@/config';
import * as messageApi from '@API/message';
import * as channelApi from '@API/channel';
import { getPlainText, isJSONStr } from '@/lib/common';
import Share from 'react-native-share';
import * as RootNavigation from '@/components/RootNavigation';
import Clipboard from '@react-native-clipboard/clipboard';
import { isBlockCheck } from '@/lib/api/orgchart';

const MessageExtension = ({ messageData, onClose, btnStyle }) => {
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const currentRoom = useSelector(({ room }) => room.currentRoom);
  const isChannel = useSelector(({ channel }) => !!channel.currentChannel);
  const useMessageDelete = isChannel
    ? getConfig('UseChannelDeleteMessage', false) === true
    : getConfig('UseChatroomDeleteMessage', false) === true;
  const useForwardFile = getConfig('UseForwardFile') || false;
  const buttons = useMemo(() => {
    let modalBtn = [];
    let isBlock = false;
    const message = messageData;
    if (message?.isMine === 'N' && chineseWall.length) {
      const senderInfo = isJSONStr(message?.senderInfo)
        ? JSON.parse(message.senderInfo)
        : message.senderInfo;
      const { blockChat, blockFile } = isBlockCheck({
        targetInfo: {
          ...senderInfo,
          id: message.sender,
        },
        chineseWall,
      });
      const isFile = !!message.fileInfos;
      isBlock = isFile ? blockFile : blockChat;
    }

    if (!messageData.fileInfos) {
      // copy
      !isBlock &&
        modalBtn.push({
          type: 'copy',
          title: getDic('Copy'),
          onPress: () => {
            Clipboard.setString(getPlainText(messageData.context));
          },
        });
    }

    // share
    if (!messageData.fileInfos) {
      !isBlock &&
        modalBtn.push({
          type: 'share',
          title: getDic('Share'),
          onPress: () => {
            const plainText = getPlainText(messageData.context);
            // plainText 와 images 공유?
            Share.open({
              message: plainText,
              title: plainText,
              subject: plainText,
            }).catch(err => {
              err && console.log(err);
            });
          },
        });
    }

    //Forward
    console.log('useForwardFile : ', useForwardFile);
    if (!messageData.fileInfos) {
      !isBlock &&
        modalBtn.push({
          type: 'share',
          title: getDic('Msg_Note_Forward', '전달하기'),
          onPress: async () => {
            RootNavigation.navigate('Share', {
              messageData,
              messageType: 'message',
            });
          },
        });
    } else if (useForwardFile) {
      !isBlock &&
        modalBtn.push({
          type: 'share',
          title: getDic('Msg_Note_Forward', '전달하기'),
          onPress: async () => {
            // 파일 토큰 유효검사 로직 추가해야함
            let files = JSON.parse(messageData.fileInfos);
            if (!Array.isArray(files) && files) {
              files = Array(files);
            }
            files = files.map(item => item.token);
            const result = await messageApi.checkFileTokenValidation({
              token: files,
              serviceType: 'CHAT',
            });

            if (result.status === 204) {
              Alert.alert(getDic('Msg_FileExpired', '만료된 파일입니다.'));
              return;
            } else if (result.status === 403) {
              Alert.alert(
                getDic('Msg_FilePermission', '권한이 없는 파일입니다.'),
              );
              return;
            } else {
              RootNavigation.navigate('Share', {
                messageData,
                messageType: 'file',
              });
            }
          },
        });
    }

    // notice
    isChannel &&
      modalBtn.push({
        type: 'notice',
        title: getDic('Notice'),
        onPress: () => {
          if (isBlock) {
            Alert.alert(getDic('BlockChat', '차단된 메시지 입니다.'));
          } else {
            channelApi.setChannelNotice({
              messageID: messageData.messageID,
            });
          }
        },
      });

    // delete
    useMessageDelete &&
      messageData.isMine === 'Y' &&
      modalBtn.push({
        type: 'delete',
        title: getDic('MessageDelete'),
        onPress: () => {
          let token = [];
          if (messageData.fileInfos) {
            if (Array.isArray(JSON.parse(messageData.fileInfos))) {
              token = JSON.parse(messageData.fileInfos).map(f => f.token);
            } else {
              token.push(JSON.parse(messageData.fileInfos).token);
            }
          }
          if (isChannel) {
            // 채널 대화삭제
            messageApi.deleteChannelMessage({
              token,
              messageId: messageData.messageID,
            });
          } else {
            // 대화방 대화삭제
            if (!currentRoom.roomID || !messageData.messageID) {
              return;
            }
            messageApi.delChatroomMessage({
              token,
              roomID: currentRoom.roomID,
              messageIds: [messageData.messageID],
            });
          }
        },
      });

    if (!modalBtn?.length) {
      modalBtn.push({
        type: 'close',
        title: getDic('Close'),
        onPress() {
          return;
        },
      });
    }
    return modalBtn;
  }, [currentRoom, isChannel, messageData, useMessageDelete, chineseWall]);

  return (
    <View>
      {buttons &&
        buttons.map(modalInfo => {
          return (
            <View key={`msgext_${modalInfo.type}`}>
              <TouchableOpacity
                onPress={() => {
                  modalInfo.onPress();
                  onClose();
                }}
              >
                <Text style={btnStyle}>{modalInfo.title}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
    </View>
  );
};

export default MessageExtension;
