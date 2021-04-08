import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ProfileBox from '@COMMON/ProfileBox';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { getJobInfo } from '@/lib/common';
const LatestMessage = () => {
  let hiddenTimer = null;

  const { latestMessage } = useSelector(({ room }) => ({
    latestMessage: room.messages[room.messages.length - 1],
  }));

  const [beforeId, setBeforeId] = useState(
    (latestMessage && latestMessage.messageID) || 0,
  );
  const [visible, setVisible] = useState(false);

  const handleVisible = useCallback(() => {
    setVisible(true);

    if (hiddenTimer != null) clearTimeout(hiddenTimer);
    hiddenTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (hiddenTimer != null) clearTimeout(hiddenTimer);
    };
  }, []);

  const drawMessage = useCallback(message => {
    let senderInfo = null;

    if (!(typeof message.senderInfo === 'object')) {
      senderInfo = JSON.parse(message.senderInfo);
    } else {
      senderInfo = message.senderInfo;
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
            adjustsFontSizeToFit={Platform.OS == 'android'}
            numberOfLines={1}
          >
            {message.context}
          </Text>
        </View>
      </>
    );
  }, []);

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
