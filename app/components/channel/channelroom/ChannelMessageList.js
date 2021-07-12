import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ChannelMessageBox from '@C/chat/message/ChannelMessageBox';
import ChannelNoticeMessageBox from '@C/chat/message/ChannelNoticeMessageBox';
import NoticeBox from '@C/chat/message/NoticeBox';
import TempMessageBox from '@C/chat/message/TempMessageBox';
import SystemMessageBox from '@C/chat/message/SystemMessageBox';
import LatestMessage from '@C/chat/chatroom/normal/LatestMessage';
import { setMessages, initMessages } from '@/modules/channel';
import { setChannelNotice } from '@/lib/api/channel';
import { getChannelMessage } from '@/lib/messageUtil';
import {
  StyleSheet,
  View,
  FlatList,
  Keyboard,
  TouchableOpacity,
  Image,
  Clipboard,
} from 'react-native';
import { openModal, changeModal } from '@/modules/modal';
import ChannelMessageSync from '@C/channel/channelroom/controls/ChannelMessageSync';
import { getDic } from '@/config';
const ico_chatDown = require('@C/assets/ico_chatdownbtn.png');

const ChannelMessageList = React.forwardRef(
  ({ onExtension, navigation, roomInfo }, ref) => {
    const { tempMessage, messages, currentChannel } = useSelector(
      ({ message, channel }) => ({
        tempMessage: message.tempChannelMessage,
        messages: channel.messages,
        currentChannel: channel.currentChannel,
      }),
    );

    let _listener = null;

    const [messageData, setMessageData] = useState(null);
    const [bottomView, setBottomView] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const [useScroll, setUseScroll] = useState(false);
    const [topEnd, setTopEnd] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
      const messageData = [
        ...messages,
        ...tempMessage.filter(
          item => currentChannel && item.roomId == currentChannel.roomId,
        ),
      ].reverse();

      setMessageData(messageData);

      const keyboardListener = 'keyboardDidShow';
      _listener = Keyboard.addListener(keyboardListener, keyboardShowEvt);

      return () => {
        _listener && _listener.remove();
      };
    }, []);

    useEffect(() => {
      const newMessageData = [
        ...messages,
        ...tempMessage.filter(
          item => currentChannel && item.roomID == currentChannel.roomId,
        ),
      ].reverse();
      setMessageData(newMessageData);
    }, [messages, tempMessage]);

    const keyboardShowEvt = useCallback(
      e => {
        onExtension('');
      },
      [onExtension],
    );

    const handleScrollTop = useCallback(() => {
      if (!topEnd && !refresh && currentChannel) {
        setRefresh(true);
        getChannelMessage(
          currentChannel.roomId,
          messageData[messageData.length - 1].messageID,
          'NEXT',
        )
          .then(response => {
            if (response.data.status == 'SUCCESS') {
              const data = response.data.result;
              if (data.length > 0) {
                dispatch(setMessages({ messages: data, dist: 'NEXT' }));
              } else {
                setTopEnd(true);
              }
            } else {
              setTopEnd(true);
            }

            setRefresh(false);
          })
          .catch(e => {
            setTopEnd(true);
            setRefresh(false);
          });
      }
    }, [dispatch, messageData, currentChannel, topEnd, refresh]);

    const handlePageInit = useCallback(() => {
      // TODO: messages에 내용 split
      dispatch(initMessages());
      setTopEnd(false);
    }, [dispatch, topEnd]);

    const drawMessage = useCallback(
      (item, index) => {
        const message = item;
        const beforeMessage = index > 0 ? messageData[index - 1] : null;
        const nextMessage =
          index < messageData.length - 1 ? messageData[index + 1] : null;

        // TODO: timezone 적용 시 검토 필요
        const timeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

        const dateCompareVal = Math.floor(
          (message.sendDate + timeZoneOffset) / 86400000,
        );
        const nextCompareVal =
          (nextMessage &&
            Math.floor((nextMessage.sendDate + timeZoneOffset) / 86400000)) ||
          0;

        const nextMessageSender = (nextMessage && nextMessage.sender) || '';

        const currentTime = Math.floor(message.sendDate / 60000);

        const beforeSendTime =
          (beforeMessage && Math.floor(beforeMessage.sendDate / 60000)) || 0;
        const beforeSender = (beforeMessage && beforeMessage.sender) || '';

        let nameBox = !(message.sender == nextMessageSender);

        const dateBox = dateCompareVal != nextCompareVal;

        if (dateBox || nextMessage.messageType === 'S') nameBox = true;

        let timeBox = !(beforeSendTime == currentTime);
        if (!timeBox) {
          // time은 같지만 다른사용자의 채팅으로 넘어가는경우
          timeBox = !(message.sender == beforeSender);
        }
        if (message.messageType === 'I') {
          return (
            <ChannelNoticeMessageBox
              dateBox={
                (dateBox && (
                  <SystemMessageBox
                    key={`date_${dateCompareVal}`}
                    message={message.sendDate}
                    date={true}
                  />
                )) ||
                null
              }
              key={message.messageID}
              message={message}
              isMine={message.isMine === 'Y'}
              nameBox={nameBox}
              timeBox={timeBox}
              navigation={navigation}
            />
          );
        } else if (message.messageType === 'A') {
          return (
            <NoticeBox
              dateBox={
                (dateBox && (
                  <SystemMessageBox
                    key={`date_${dateCompareVal}`}
                    message={message.sendDate}
                    date={true}
                  />
                )) ||
                null
              }
              key={message.messageID}
              message={message}
              navigation={navigation}
              isMine={message.isMine === 'Y'}
              nameBox={nameBox}
              timeBox={timeBox}
            />
          );
        } else if (message.messageType !== 'S') {
          return (
            (!message.mentionInfo && (
              <ChannelMessageBox
                dateBox={
                  (dateBox && (
                    <SystemMessageBox
                      key={`date_${dateCompareVal}`}
                      message={message.sendDate}
                      date={true}
                    />
                  )) ||
                  null
                }
                key={message.messageID}
                message={message}
                isMine={message.isMine === 'Y'}
                nameBox={nameBox}
                timeBox={timeBox}
                navigation={navigation}
                roomInfo={roomInfo}
              />
            )) ||
            (message.mentionInfo && (
              <ChannelMessageBox
                dateBox={
                  (dateBox && (
                    <SystemMessageBox
                      key={`date_${dateCompareVal}`}
                      message={message.sendDate}
                      date={true}
                    />
                  )) ||
                  null
                }
                key={message.messageID}
                message={message}
                isMine={message.isMine === 'Y'}
                nameBox={nameBox}
                timeBox={timeBox}
                navigation={navigation}
                roomInfo={roomInfo}
              />
            ))
          );
        } else {
          return <SystemMessageBox key={message.messageID} message={message} />;
        }
      },
      [messageData],
    );

    const renderMessage = useCallback(
      (item, index) => {
        let messageComp = null;
        // status key 가 존재하면 tempMessage
        if (item.status) {
          messageComp = <TempMessageBox message={item} messageType={'channel'} />;
        } else {
          messageComp = drawMessage(item, index);
        }

        return (
          <TouchableOpacity
            onPress={e => {
              Keyboard.dismiss();
              onExtension('');
            }}
            activeOpacity={1}
          >
            {messageComp}
          </TouchableOpacity>
        );
      },
      [messageData, onExtension, dispatch],
    );

    const handleScrollUpdate = useCallback(
      e => {
        const nativeEvent = e.nativeEvent;
        // TODO: 다른 사람이 보낸 메시지 도착 시 아래로 가지않도록 수정 필요
        // 한페이지 이상 스크롤을 올렸을 경우
        if (
          !useScroll &&
          nativeEvent.contentOffset.y > nativeEvent.layoutMeasurement.height
        ) {
          setUseScroll(true);
          setBottomView(true);
        } else if (
          useScroll &&
          nativeEvent.contentOffset.y <= nativeEvent.layoutMeasurement.height
        ) {
          setUseScroll(false);
          setBottomView(false);
        }
      },
      [useScroll],
    );

    return (
      <>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={e => {
              Keyboard.dismiss();
              onExtension('');
            }}
            activeOpacity={1}
          >
            <FlatList
              inverted
              ref={ref}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'flex-end',
              }}
              style={[styles.container, { flex: 1 }]}
              data={messageData}
              keyExtractor={item => {
                const key =
                  (item.messageID && item.messageID) || `temp_${item.tempId}`;
                return key.toString();
              }}
              renderItem={({ item, index }) => renderMessage(item, index)}
              keyboardShouldPersistTaps="handled"
              onEndReachedThreshold={0.3}
              onEndReached={() => {
                handleScrollTop();
              }}
              onScroll={handleScrollUpdate}
              scrollEventThrottle={100}
              refreshing={refresh}
              decelerationRate="fast"
            />
          </TouchableOpacity>
          {bottomView && (
            <View style={styles.bottomViewBox}>
              <LatestMessage />
              <View style={styles.bottomBtn}>
                <TouchableOpacity
                  onPress={e => {
                    ref.current.scrollToOffset({
                      y: 0,
                      animated: true,
                    });
                    setTimeout(() => {
                      handlePageInit();
                    }, 50);
                  }}
                >
                  <View style={styles.bottomBtnIcoWrap}>
                    <Image source={ico_chatDown} style={styles.bottomBtnIco} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <ChannelMessageSync
          roomID={currentChannel.roomID}
          messageID={
            messageData ? messageData[messageData.length - 1].messageID : null
          }
        />
      </>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  bottomViewBox: {
    position: 'absolute',
    right: 5,
    bottom: 12,
    width: 60,
    height: 60,
    zIndex: 10,
  },
  bottomBtn: {
    width: 45,
    height: 45,
    backgroundColor: '#FFF',
    position: 'absolute',
    borderRadius: 22,
    right: 10,
    bottom: 8,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomBtnIcoWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnIco: {
    width: 13,
    height: 13,
  },
});

export default ChannelMessageList;
