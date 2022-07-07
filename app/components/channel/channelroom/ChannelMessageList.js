import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { differenceInCalendarDays } from 'date-fns';
import ChannelMessageBox from '@C/chat/message/ChannelMessageBox';
import ChannelNoticeMessageBox from '@C/chat/message/ChannelNoticeMessageBox';
import NoticeBox from '@C/chat/message/NoticeBox';
import TempMessageBox from '@C/chat/message/TempMessageBox';
import SystemMessageBox from '@C/chat/message/SystemMessageBox';
import LatestMessage from '@C/chat/chatroom/normal/LatestMessage';
import { setMessages, initMessages } from '@/modules/channel';
import { getChannelMessage } from '@/lib/messageUtil';
import {
  StyleSheet,
  View,
  FlatList,
  Keyboard,
  TouchableOpacity,
  Image,
} from 'react-native';
import ChannelMessageSync from '@C/channel/channelroom/controls/ChannelMessageSync';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';

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
    const chineseWall = useSelector(({ login }) => login.chineseWall);

    let _listener = null;

    const [messageData, setMessageData] = useState([]);
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
        let isBlock = false;
        const message = item;
        if (message?.isMine === 'N' && chineseWall?.length) {
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
        const beforeMessage = index > 0 ? messageData[index - 1] : null;
        const nextMessage =
          index < messageData.length - 1 ? messageData[index + 1] : null;
        const nextMessageSender = (nextMessage && nextMessage.sender) || '';
        const nextMessagenSendTime =
          (nextMessage && Math.floor(nextMessage.sendDate / 60000)) || 0;
        const currentTime = Math.floor(message.sendDate / 60000);

        const beforeSendTime =
          (beforeMessage && Math.floor(beforeMessage.sendDate / 60000)) || 0;
        const beforeSender = (beforeMessage && beforeMessage.sender) || '';

        let dateBox = true;
        try {
          if (!Number(message?.sendDate) || !Number(nextMessage?.sendDate)) {
            dateBox = true;
          } else {
            const currentMessageDate = new Date(message.sendDate);
            const nextMessageDate = new Date(nextMessage.sendDate);
            dateBox = Boolean(
              differenceInCalendarDays(currentMessageDate, nextMessageDate),
            );
          }
        } catch (err) {
          dateBox = true;
        }

        /* 메시지 보낸사람 프로필 표시 여부 */
        let nameBox;
        if (message.messageType === 'S') {
          // 시스템 메시지
          nameBox = true;
        } else if (message.sender === nextMessageSender) {
          // 이전 메시지와 동일유저 && 이전 메시지로부터 시간이 지남
          nameBox = !(nextMessagenSendTime === currentTime);
        } else {
          // 이전 메시지와 동일 유저가 아닌 경우
          nameBox = true;
        }

        /* 메시지 시간 표시 여부 */
        const timeBox =
          // 메시지 표시 시간이 달라진 경우
          !(beforeSendTime === currentTime) ||
          // 이전 메시지와 다른 사람의 메시지
          !(message.sender === beforeSender);

        const dateCompareVal = Math.floor(message.sendDate / 86400000);
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
              isBlock={isBlock}
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
              isBlock={isBlock}
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
                isBlock={isBlock}
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
                isBlock={isBlock}
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
          messageComp = (
            <TempMessageBox message={item} messageType={'channel'} />
          );
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
            messageData ? messageData[messageData.length - 1]?.messageID : null
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
