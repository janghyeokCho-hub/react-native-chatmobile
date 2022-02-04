import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, Clipboard, TouchableOpacity} from 'react-native';
import { getDic } from '@/config';
import * as messageApi from '@API/message';
import * as channelApi from '@API/channel';
import { getPlainText } from '@/lib/common';
import Share from 'react-native-share';

const MessageExtension = ({ messageData, onClose, btnStyle }) => {
  const currentRoom = useSelector(({ room }) => room.currentRoom);
  const isChannel = useSelector(({ channel }) => !!channel.currentChannel);

  const buttons = useMemo(() => {
    let modalBtn = [];

    // copy
    modalBtn.push({
      type: 'copy',
      title: getDic('Copy'),
      onPress: () => {
        Clipboard.setString(getPlainText(messageData.context));
      },
    });

    // share
    modalBtn.push({
      type: 'share',
      title: getDic('Share'),
      onPress: () => {
        const plainText = getPlainText(messageData.context);
        // plainText 와 images 공유?
        Share.open({ message: plainText, title: plainText, subject: plainText })
          .then(res => {})
          .catch(err => {
            err && console.log(err);
          });
      },
    });

    // notice
    isChannel &&
      modalBtn.push({
        type: 'notice',
        title: getDic('Notice'),
        onPress: () => {
          channelApi.setChannelNotice({
            messageID: messageData.messageID,
          });
        },
      });

    // delete
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

    return modalBtn;
  }, [currentRoom, isChannel, messageData]);

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
