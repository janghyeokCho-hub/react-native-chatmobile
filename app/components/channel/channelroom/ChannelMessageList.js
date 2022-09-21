import React, {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { differenceInCalendarDays } from 'date-fns';
import ChannelMessageBox from '@C/chat/message/ChannelMessageBox';
import ChannelNoticeMessageBox from '@C/chat/message/ChannelNoticeMessageBox';
import NoticeBox from '@C/chat/message/NoticeBox';
import TempMessageBox from '@C/chat/message/TempMessageBox';
import SystemMessageBox from '@C/chat/message/SystemMessageBox';
import LatestMessage from '@C/chat/chatroom/normal/LatestMessage';
import { initMessages } from '@/modules/channel';
import { getChannelMessage } from '@/lib/messageUtil';
import {
  StyleSheet,
  View,
  Keyboard,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import ChannelMessageSync from '@C/channel/channelroom/controls/ChannelMessageSync';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';

import { FlatList } from 'react-native-bidirectional-infinite-scroll';
import { getDic } from '@/config';
import { setPostAction } from '@/modules/message';

const ico_chatDown = require('@C/assets/ico_chatdownbtn.png');
const _ = require('lodash');

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
    const postAction = useSelector(({ message }) => message.postAction);

    let _listener = null;

    const [messageData, setMessageData] = useState([]);
    const [bottomView, setBottomView] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [useScroll, setUseScroll] = useState(false);
    const [topEnd, setTopEnd] = useState(false);
    const [bottomEnd, setBottomEnd] = useState(false);
    const [replyFlag, setReplyFlag] = useState(false);
    const [replyMessageData, setReplyMessageData] = useState(null);
    const [targetMessageData, setTargetMessageData] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
      // const messageData = [
      //   ...messages,
      //   ...tempMessage.filter(
      //     item => currentChannel && item.roomId == currentChannel.roomId,
      //   ),
      // ].reverse();

      // setMessageData(messageData);

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
    }, [messages, tempMessage, currentChannel]);

    /**
     * 메시지 이동시 이동된 메시지 기준으로
     * 최하단으로 이동시 replyFlag 변경으로 인해 다시 messageData 사용
     */
    useEffect(() => {
      let targetMsgData = [];
      if (replyMessageData?.length || messageData?.length) {
        if (replyFlag) {
          targetMsgData = replyMessageData;
        } else {
          targetMsgData = messageData;
        }
      }

      setTargetMessageData(targetMsgData);
      return () => {
        setTargetMessageData(null);
      };
    }, [replyFlag, replyMessageData, messageData]);

    /**
     * 메시지 수신시 스크롤 하단으로 이동
     * 내가 메시지를 보낼 경우에는 ref 가 없음
     */
    useLayoutEffect(() => {
      if (ref.current) {
        if (messageData?.length && !bottomView) {
          ref.current.scrollToOffset({
            y: 0,
            animated: true,
          });
        }
      }
    }, [messageData, bottomView, ref]);

    useEffect(() => {
      if (postAction) {
        dispatch(setPostAction(false));
        if (replyFlag) {
          handlePageInit();
        } else {
          setTimeout(() => {
            ref.current.scrollToOffset({
              y: 0,
              animated: true,
            });
          }, 200);
        }
      }
    }, [dispatch, postAction, replyFlag, ref]);

    const keyboardShowEvt = useCallback(
      e => {
        onExtension('');
      },
      [onExtension],
    );

    const handleScrollTop = useCallback(async () => {
      if (!topEnd && !refresh && currentChannel) {
        // 본문 메시지를 중앙 기준으로 Total 불러올 갯수
        const LOAD_CNT = 50;
        setRefresh(true);
        const response = await getChannelMessage(
          currentChannel.roomId,
          targetMessageData[targetMessageData.length - 1].messageID,
          'NEXT',
        );
        if (response.data.status == 'SUCCESS') {
          const data = response.data.result;
          if (data?.length) {
            const message = [...targetMessageData, ...data].sort(
              (a, b) => b.messageID - a.messageID,
            );
            setTargetMessageData(_.uniqBy(message, 'messageID'));

            if (data.length < LOAD_CNT) {
              setTopEnd(true);
            } else {
              setTopEnd(false);
            }
          } else {
            setTopEnd(true);
          }
        } else {
          setTopEnd(true);
        }

        setRefresh(false);
      }
    }, [targetMessageData, currentChannel, topEnd, refresh]);

    /**
     * Reply 본문 메시지로 이동시
     * 스크롤 하단 이동시
     * 본문메시지부터 마지막 메시지 도달시까지
     * 정해진 LOAD_CNT 수 만큼 메시지를 불러옴
     */
    const handleScrollBottom = useCallback(async () => {
      if (!bottomEnd && !refresh && currentChannel) {
        // 본문 메시지를 중앙 기준으로 Total 불러올 갯수
        const LOAD_CNT = 50;
        setRefresh(true);
        const response = await getChannelMessage(
          currentChannel.roomId,
          targetMessageData[0].messageID,
          'BEFORE',
        );
        if (response.data.status == 'SUCCESS') {
          const data = response.data.result;
          if (data?.length) {
            const message = [...targetMessageData, ...data].sort(
              (a, b) => b.messageID - a.messageID,
            );
            setTargetMessageData(_.uniqBy(message, 'messageID'));

            if (data.length < LOAD_CNT) {
              setBottomEnd(true);
            } else {
              setBottomEnd(false);
            }
          } else {
            setBottomEnd(true);
          }
        } else {
          setBottomEnd(true);
        }

        setRefresh(false);
      }
    }, [targetMessageData, currentChannel, bottomEnd, refresh]);

    const handlePageInit = useCallback(() => {
      setTargetMessageData(null);
      dispatch(initMessages());

      setUseScroll(false);
      setTopEnd(false);
      setBottomEnd(true);
      setBottomView(false);
      setReplyFlag(false);
      setTimeout(() => {
        ref.current.scrollToOffset({
          y: 0,
          animated: true,
        });
      }, 200);
    }, [dispatch, ref]);

    const goToOriginMsg = useCallback(
      async (currentRoomID, replyID) => {
        const msgEle = targetMessageData.findIndex(
          item => item.messageID === replyID,
        );
        if (msgEle === -1 || msgEle >= 50) {
          setRefresh(true);

          const { data } = await getChannelMessage(
            currentRoomID,
            replyID,
            'CENTER',
          );

          const { status, result } = data;

          if (status === 'SUCCESS') {
            setReplyFlag(true);
            setReplyMessageData(result.reverse());
          } else {
            setReplyFlag(false);
            Alert.alert(
              getDic('Msg_NotMoveMessage', '원본 메시지로 이동할 수 없습니다.'),
            );
          }
        } else {
          setReplyMessageData(messageData);
        }
        setRefresh(false);

        setTimeout(() => {
          const { current } = ref;
          const replyEleIndex = current?.props?.data.findIndex(
            item => item.messageID === replyID,
          );

          if (replyEleIndex > -1) {
            current.scrollToIndex({
              index: replyEleIndex,
              viewPosition: 0.5,
            });
            setBottomView(true);
            setReplyFlag(true);
          } else {
            Alert.alert(
              getDic('Msg_NotMoveMessage', '원본 메시지로 이동할 수 없습니다.'),
            );
          }
          setBottomEnd(false);
        }, 500);
      },
      [ref, targetMessageData, messageData],
    );

    const drawMessage = (item, index) => {
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
      const beforeMessage = index > 0 ? targetMessageData[index - 1] : null;
      const nextMessage =
        index < targetMessageData.length - 1
          ? targetMessageData[index + 1]
          : null;
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
              goToOriginMsg={goToOriginMsg}
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
              goToOriginMsg={goToOriginMsg}
            />
          ))
        );
      } else {
        return <SystemMessageBox key={message.messageID} message={message} />;
      }
    };

    const renderMessage = useCallback(
      props => {
        const { item, index } = props;
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
            onPress={() => {
              Keyboard.dismiss();
              onExtension('');
            }}
            activeOpacity={1}
          >
            {messageComp}
          </TouchableOpacity>
        );
      },
      [targetMessageData, onExtension],
    );

    const handleScrollUpdate = useCallback(
      e => {
        if (!refresh) {
          const nativeEvent = e.nativeEvent;

          // TODO: 다른 사람이 보낸 메시지 도착 시 아래로 가지않도록 수정 필요
          // 한페이지 이상 스크롤을 올렸을 경우
          if (!useScroll && nativeEvent.contentOffset.y > 0) {
            setUseScroll(true);
            setBottomView(true);
          } else if (
            bottomEnd &&
            useScroll &&
            nativeEvent.contentOffset.y <= 0
          ) {
            setUseScroll(false);
            setBottomView(false);
            setReplyFlag(false);
            setReplyMessageData(null);
          }
        }
      },
      [useScroll, refresh, bottomEnd],
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
            {targetMessageData && (
              <FlatList
                inverted
                data={targetMessageData}
                onEndReached={handleScrollTop}
                onStartReached={handleScrollBottom}
                renderItem={renderMessage}
                style={[styles.container, { flex: 1 }]}
                ref={ref}
                onScrollToIndexFailed={info => {
                  const wait = new Promise(resolve => setTimeout(resolve, 500));
                  wait.then(() => {
                    ref.current.scrollToIndex({
                      index: info.index,
                      viewPosition: 0.5,
                    });
                  });
                }}
                keyExtractor={item => {
                  const key =
                    (item.messageID && item.messageID.toString()) ||
                    `temp_${item.tempId}`;
                  return key;
                }}
                onEndReachedThreshold={0.3}
                onStartReachedThreshold={0.5}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                }}
                onMomentumScrollEnd={handleScrollUpdate}
                windowSize={21}
                keyboardShouldPersistTaps="handled"
                refreshing={refresh}
                decelerationRate="fast"
                removeClippedSubviews={false}
              />
            )}
          </TouchableOpacity>
          {bottomView && (
            <View style={styles.bottomViewBox}>
              <LatestMessage />
              <View style={styles.bottomBtn}>
                <TouchableOpacity onPress={handlePageInit}>
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
