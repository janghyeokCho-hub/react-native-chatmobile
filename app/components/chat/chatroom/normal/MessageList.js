import React, {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { differenceInCalendarDays } from 'date-fns';
import MessageBox from '@C/chat/message/MessageBox';
import NoticeBox from '@C/chat/message/NoticeBox';
import TempMessageBox from '@C/chat/message/TempMessageBox';
import SystemMessageBox from '@C/chat/message/SystemMessageBox';
import LatestMessage from '@C/chat/chatroom/normal/LatestMessage';
import {
  initMessages,
  setMessagesForSync,
  readMessage,
  setUnreadCountForSync,
} from '@/modules/room';
import { getMessage } from '@/lib/messageUtil';
import {
  StyleSheet,
  View,
  Keyboard,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import MessageSync from '../controls/MessageSync';
import * as dbAction from '@/lib/appData/action';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';

import { FlatList } from 'react-native-bidirectional-infinite-scroll';
import { getDic } from '@/config';
import { setPostAction } from '@/modules/message';

const ico_chatDown = require('@C/assets/ico_chatdownbtn.png');
const _ = require('lodash');

const MessageList = React.forwardRef(({ onExtension, navigation }, ref) => {
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const postAction = useSelector(({ message }) => message.postAction);
  const { tempMessage, messages, currentRoom } = useSelector(
    ({ message, room }) => ({
      tempMessage: message.tempMessage,
      messages: room.messages,
      currentRoom: room.currentRoom,
    }),
  );

  let _listener = null;
  const [messageData, setMessageData] = useState(null);
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
    // const data = [
    //   ...messages,
    //   ...tempMessage.filter(
    //     item => currentRoom && item.roomID == currentRoom.roomID,
    //   ),
    // ].reverse();

    // setMessageData(data);

    const keyboardListener = 'keyboardDidShow';
    _listener = Keyboard.addListener(keyboardListener, keyboardShowEvt);

    return () => {
      _listener && _listener.remove();
    };
  }, []);

  useEffect(() => {
    syncMessages();
  }, []);

  useEffect(() => {
    const newMessageData = [
      ...messages,
      ...tempMessage.filter(
        item => currentRoom && item.roomID == currentRoom.roomID,
      ),
    ].reverse();
    setMessageData(newMessageData);
  }, [messages, tempMessage, currentRoom]);

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

  useEffect(() => {
    const failMsg = tempMessage.filter(item => item.status === 'fail');

    if (currentRoom.roomID && (failMsg?.length || !tempMessage?.length)) {
      dbAction.saveFailMessages({
        roomId: currentRoom.roomID,
        failMsg,
      });
    }
  }, [currentRoom, tempMessage]);

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

  const keyboardShowEvt = useCallback(() => {
    onExtension('');
  }, [onExtension]);

  const syncMessages = useCallback(() => {
    if (currentRoom?.roomID) {
      const roomID = currentRoom.roomID;
      const isNotice = currentRoom.roomType === 'A';

      const callback = async () => {
        const response = await dbAction.getMessages({
          roomID: roomID,
          startId: null,
          dist: 'SYNC',
          loadCnt: 50,
          isNotice,
        });

        const tempMessages = response.data.result;
        // 비활성(최초 메시지 로딩시 빈화면 이슈)
        // if (tempMessage.length > 0) {
        setTopEnd(false);
        setBottomEnd(true);
        dispatch(setMessagesForSync(tempMessages));
        dispatch(
          setUnreadCountForSync({
            roomId: roomID,
            startId: tempMessages[0].messageID,
            endId: tempMessages[tempMessages.length - 1].messageID,
            isNotice,
            isSync: true,
          }),
        );
        // }
        if (!tempMessages || !messages?.length) {
          dispatch(
            readMessage({
              roomID,
              isNotice,
            }),
          );
        }
      };
      dbAction.unreadCountSync(
        { roomID, roomType: currentRoom.roomType },
        callback,
      );
      dbAction.syncMessages({ roomID, isNotice }, callback);
    }
  }, [currentRoom, messages.length, dispatch]);

  const handleScrollTop = useCallback(async () => {
    if (!topEnd && !refresh && currentRoom) {
      // 본문 메시지를 중앙 기준으로 Total 불러올 갯수
      const LOAD_CNT = 50;
      setRefresh(true);
      const searchMessageID =
        targetMessageData[targetMessageData.length - 1].messageID;

      const response = await getMessage(
        currentRoom.roomID,
        searchMessageID,
        'NEXT',
        param => {
          dispatch(setUnreadCountForSync(param));
        },
        currentRoom.roomType === 'A',
        LOAD_CNT,
      );
      if (response.data.status === 'SUCCESS') {
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
  }, [dispatch, targetMessageData, currentRoom, topEnd, refresh]);

  /**
   * Reply 본문 메시지로 이동시
   * 스크롤 하단 이동시
   * 본문메시지부터 마지막 메시지 도달시까지
   * 정해진 LOAD_CNT 수 만큼 메시지를 불러옴
   */
  const handleScrollBottom = useCallback(async () => {
    if (!bottomEnd && !refresh && currentRoom) {
      // 본문 메시지를 중앙 기준으로 Total 불러올 갯수
      const LOAD_CNT = 50;
      setRefresh(true);
      const searchMessageID = targetMessageData[0].messageID;
      const response = await getMessage(
        currentRoom.roomID,
        searchMessageID,
        'CENTER',
        param => {
          dispatch(setUnreadCountForSync(param));
        },
        currentRoom.roomType === 'A',
        LOAD_CNT,
      );

      if (response.data.status === 'SUCCESS') {
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
  }, [dispatch, targetMessageData, currentRoom, bottomEnd, refresh]);

  const handlePageInit = useCallback(() => {
    // setTargetMessageData(null);
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
      const LOAD_CNT = 50;
      const msgEle = targetMessageData.findIndex(
        item => item.messageID === replyID,
      );

      if (msgEle === -1 || msgEle >= 50) {
        setRefresh(true);

        const { data } = await getMessage(
          currentRoomID,
          replyID,
          'CENTER',
          param => {
            dispatch(setUnreadCountForSync(param));
          },
          currentRoom.roomType === 'A',
          LOAD_CNT,
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
          setBottomView(true);
          setReplyFlag(true);
          current.scrollToIndex({
            index: replyEleIndex,
            viewPosition: 0.5,
          });
        } else {
          Alert.alert(
            getDic('Msg_NotMoveMessage', '원본 메시지로 이동할 수 없습니다.'),
          );
        }
        setBottomEnd(false);
      }, 500);
    },
    [dispatch, ref, currentRoom, targetMessageData, messageData],
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
    if (message.messageType !== 'S') {
      if (message.messageType === 'A') {
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
      } else {
        return (
          <MessageBox
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
            goToOriginMsg={goToOriginMsg}
          />
        );
      }
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
        messageComp = <TempMessageBox message={item} messageType={'room'} />;
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
    [bottomView, ref, targetMessageData, onExtension],
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
        } else if (bottomEnd && useScroll && nativeEvent.contentOffset.y <= 0) {
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
          onPress={() => {
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
      <MessageSync roomID={currentRoom.roomID} syncMessages={syncMessages} />
    </>
  );
});

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

export default MessageList;
