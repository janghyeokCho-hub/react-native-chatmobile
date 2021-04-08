import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, Clipboard, TouchableOpacity } from 'react-native';
import { getDic } from '@/config';
import * as messageApi from '@API/message';
import * as channelApi from '@API/channel';
import { getPlainText } from '@/lib/common';
import Share from 'react-native-share';

const MessageExtension = ({ messageData, onClose, btnStyle }) => {
  const isRoom = useSelector(({ room }) => !!room.currentRoom);
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
    isChannel &&
      messageData.isMine === 'Y' &&
      modalBtn.push({
        type: 'delete',
        title: getDic('MessageDelete'),
        onPress: () => {
          messageApi.deleteChannelMessage({
            messageId: messageData.messageID,
          });
        },
      });

    return modalBtn;
  }, [isRoom, isChannel]);

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
