import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ProfileBox from '@COMMON/ProfileBox';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { getJobInfo } from '@/lib/common';
import { isBlockCheck } from '@/lib/api/orgchart';
import { getDic } from '@/config';

const LatestMessage = () => {
  let hiddenTimer = null;

  const chineseWall = useSelector(({ login }) => login.chineseWall);

  const { latestMessage } = useSelector(({ room }) => ({
    latestMessage: room.messages[room.messages.length - 1],
  }));

  const [beforeId, setBeforeId] = useState(
    (latestMessage && latestMessage.messageID) || 0,
  );
  const [visible, setVisible] = useState(false);
  const [context, setContext] = useState('');

  const handleVisible = useCallback(() => {
    setVisible(true);

    if (hiddenTimer != null) {
      clearTimeout(hiddenTimer);
    }
    hiddenTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (hiddenTimer != null) clearTimeout(hiddenTimer);
    };
  }, []);

  const drawMessage = useCallback(
    message => {
      let senderInfo = null;

      if (!(typeof message.senderInfo === 'object')) {
        senderInfo = JSON.parse(message.senderInfo);
      } else {
        senderInfo = message.senderInfo;
      }

      let isBlock = false;
      if (chineseWall.length) {
        const targetInfo = {
          ...senderInfo,
          id: senderInfo.sender,
        };

        const { blockChat, blockFile } = isBlockCheck({
          targetInfo,
          chineseWall,
        });
        const isFile = !!message?.File;
        isBlock = isFile ? blockFile : blockChat;
      }

      if (isBlock) {
        setContext(getDic('BlockChat', '차단된 메시지 입니다.'));
      } else {
        setContext(message.context);
      }

      return (
        <>
          <ProfileBox
            userId={message.sender}
            userName={senderInfo.name}
            img={senderInfo.photoPath}
            style={{ height: 40, width: 40 }}
          />
          <View style={styles.infoBox}>
            <Text style={styles.sender}>{getJobInfo(senderInfo)}</Text>
            <Text
              style={styles.context}
              adjustsFontSizeToFit={Platform.OS === 'android'}
              numberOfLines={1}
            >
              {context}
            </Text>
          </View>
        </>
      );
    },
    [chineseWall, context],
  );

  useEffect(() => {
    if (
      latestMessage &&
      latestMessage.messageID != beforeId &&
      latestMessage.isMine != 'Y'
    ) {
      setBeforeId(latestMessage.messageID);
      handleVisible();
    }
  }, [latestMessage]);

  return (
    <>
      {visible && (
        <View style={styles.container}>{drawMessage(latestMessage)}</View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 10,
    borderRadius: 5,
    backgroundColor: '#F9F9F9',
    borderColor: '#AAA',
    borderWidth: 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  infoBox: {
    flex: 1,
    marginRight: 60,
    marginLeft: 10,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  sender: {
    marginBottom: 5,
    fontWeight: '600',
  },
  context: {
    paddingLeft: 5,
    color: '#444',
  },
});

export default LatestMessage;
