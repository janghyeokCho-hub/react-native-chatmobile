import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useDispatch } from 'react-redux';
import { setUnreadCountForSync } from '@/modules/room';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { getMessage } from '@/lib/messageUtil';
import { format } from 'date-fns';
import SearchMessageWrap from '@C/chat/chatroom/search/SearchMessageWrap';
import MessageBox from '@C/chat/message/MessageBox';
import SystemMessageBox from '@C/chat/message/SystemMessageBox';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';
import { SearchLogo } from './SearchLogo';

const loadingImg = require('@C/assets/loading.gif');

const SearchList = ({
  moveData,
  markingText,
  roomID,
  navigation,
  chineseWall,
  roomInfo,
}) => {
  const [messages, setMessages] = useState([]);
  const [moveId, setMoveId] = useState(null);

  const [offset, setOffset] = useState(-1);

  const [loading, setLoading] = useState(false);

  const [nextId, setNextId] = useState(-1);
  const [nextMessages, setNextMessages] = useState([]);
  const [topEnd, setTopEnd] = useState(false);

  const [beforeId, setBeforeId] = useState(-1);
  const [beforeMessages, setBeforeMessages] = useState([]);
  const [bottomEnd, setBottomEnd] = useState(false);

  const [sizeCheck, setSizeCheck] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const dispatch = useDispatch();
  const scrollBox = useRef(null);

  useEffect(() => {
    if (moveData != null && moveData.firstPage.length > 0) {
      // move 관련
      setTopEnd(false);
      setBottomEnd(false);
      setMessages(moveData.firstPage);
      setMoveId(moveData.moveId);
      setNextId(moveData.firstPage[0].messageID);
      setBeforeId(moveData.firstPage[moveData.firstPage.length - 1].messageID);
      setOffset(-1);
    } else {
      setBottomEnd(true);
      setTopEnd(true);
      setMessages([]);
      setNextMessages([]);
      setBeforeMessages([]);
      setMoveId(null);
    }
  }, [moveData]);

  useEffect(() => {
    if (offset > -1) {
      scrollBox.current.scrollTo({ x: 0, y: offset, animated: false });
    }
  }, [offset]);

  const drawMessage = (messages, moveId) => {
    if (messages.length > 0) {
      let lastDate = format(
        new Date(messages[messages.length - 1].sendDate),
        'yyyyMMdd',
      );

      let currentSender = '';
      let currentTime = Math.floor(
        messages[messages.length - 1].sendDate / 60000,
      );
      let returnJSX = [];
      messages.forEach((message, index) => {
        let isBlock = false;
        if (chineseWall?.length) {
          const senderInfo = isJSONStr(message.senderInfo)
            ? JSON.parse(message.senderInfo)
            : message.senderInfo;
          const targetInfo = {
            ...senderInfo,
            id: senderInfo.sender,
          };
          const { blockChat, blockFile } = isBlockCheck({
            targetInfo,
            chineseWall,
          });
          const isFile = !!message.fileInfos;
          isBlock = isFile ? blockFile : blockChat;
        }
        let nameBox = !(message.sender == currentSender);
        let sendDate = format(new Date(message.sendDate), 'yyyyMMdd');
        let nextSendTime = '';
        let nextSender = '';
        let dateBox = !(lastDate == sendDate);

        if (message.sender != currentSender) currentSender = message.sender;
        if (message.messageType == 'S') currentSender = '';
        if (dateBox) nameBox = true;

        if (messages.length > index + 1) {
          nextSendTime = Math.floor(messages[index + 1].sendDate / 60000);
          nextSender = messages[index + 1].sender;
        }

        let timeBox = !(nextSendTime == currentTime);
        if (!timeBox) {
          // time은 같지만 다른사용자의 채팅으로 넘어가는경우
          timeBox = !(currentSender == nextSender);
        }

        currentTime = nextSendTime;

        if (dateBox) {
          lastDate = sendDate;
        }

        if (message.messageType != 'S') {
          if (message.messageID == moveId) {
            returnJSX.push(
              <SearchMessageWrap
                onLayout={event => {
                  setOffset(event.nativeEvent.layout.y);
                }}
              >
                <MessageBox
                  dateBox={
                    (dateBox && (
                      <SystemMessageBox
                        key={`date_${lastDate}`}
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
                  marking={markingText}
                  isBlock={isBlock}
                />
              </SearchMessageWrap>,
            );
          } else {
            returnJSX.push(
              <View>
                <MessageBox
                  dateBox={
                    (dateBox && (
                      <SystemMessageBox
                        key={`date_${lastDate}`}
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
                  marking={markingText}
                  isBlock={isBlock}
                />
              </View>,
            );
          }
        } else {
          // System Message

          returnJSX.push(
            <SystemMessageBox key={message.messageID} message={message} />,
          );
        }
      });

      return returnJSX;
    }
  };

  const renderMessage = useMemo(() => {
    return drawMessage(messages, moveId);
  }, [messages, moveId, offset]);

  const renderNextMessage = useMemo(() => {
    return drawMessage(sizeCheck, -1);
  }, [sizeCheck]);

  useEffect(() => {
    if (!loading && !topEnd && nextId > -1) {
      setLoading(true);
      const getNextMessage = async () => {
        try {
          const response = await getMessage(
            roomID,
            nextId,
            'NEXT',
            unreadCountForSync,
            false,
            100,
          );

          if (response.data.status == 'SUCCESS') {
            const data = response.data.result;

            if (data.length > 0) {
              setNextMessages(data);
            } else {
              setTopEnd(true);
              setNextId(-1);
            }
          } else {
            setTopEnd(true);
            setNextId(-1);
          }

          setLoading(false);
        } catch (e) {
          setTopEnd(true);
          setNextId(-1);
          setLoading(false);
        }
      };
      getNextMessage();
    }
  }, [nextId]);

  useEffect(() => {
    if (!loading && !bottomEnd && beforeId > -1) {
      setLoading(true);
      const getBeforeMessage = async () => {
        try {
          const response = await getMessage(
            roomID,
            beforeId,
            'BEFORE',
            unreadCountForSync,
            false,
            100,
          );

          if (response.data.status == 'SUCCESS') {
            const data = response.data.result;
            if (data.length > 0) {
              setBeforeMessages(data);
            } else {
              setBottomEnd(true);
              setBeforeId(-1);
            }
          } else {
            setBottomEnd(true);
            setBeforeId(-1);
          }

          setLoading(false);
        } catch (e) {
          setBottomEnd(true);
          setBeforeId(-1);
          setLoading(false);
        }
      };
      getBeforeMessage();
    }
  }, [beforeId]);

  const unreadCountForSync = useCallback(
    param => {
      dispatch(setUnreadCountForSync(param));
    },
    [dispatch],
  );

  const handleScrollTop = useCallback(() => {
    if (nextMessages.length > 0 && !topEnd) {
      setRefresh(true);
      setSizeCheck(nextMessages);
    }
  }, [nextMessages, topEnd]);

  const handleScrollBottom = useCallback(() => {
    if (beforeMessages.length > 0 && !bottomEnd) {
      setBeforeId(beforeMessages[beforeMessages.length - 1].messageID);
      setMessages([...messages, ...beforeMessages]);
    }
  }, [beforeMessages, messages, bottomEnd]);

  const handleScroll = useCallback(
    e => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const pageHeight = e.nativeEvent.layoutMeasurement.height;
      const totalHeight = e.nativeEvent.contentSize.height;

      const currentPositionRate = offsetY / (totalHeight - pageHeight);

      if (currentPositionRate > 0.8) {
        !loading && handleScrollBottom();
      }
    },
    [loading, beforeMessages, bottomEnd, messages],
  );

  const handleNextPageSize = useCallback(
    (contentWidth, contentHeight) => {
      //setSizeCheck([]);
      if (contentHeight > 0) {
        scrollBox.current.scrollTo({
          x: 0,
          y: contentHeight,
          animated: false,
        });

        setNextId(nextMessages[0].messageID);
        setMessages([...nextMessages, ...messages]);
      }
    },
    [nextMessages, messages],
  );

  const handleSizeChange = useCallback(() => {
    setRefresh(false);
  }, []);

  const handleRefresh = useCallback(() => {
    !loading && handleScrollTop();
  }, [refresh, loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.moveLoadingBoxWrap}>
          <Image source={loadingImg} style={{ width: 100, height: 100 }} />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {(moveData &&
          (messages && messages.length > 0 && (
            <>
              <View style={{ flex: 1, zIndex: 10 }}>
                <ScrollView
                  ref={scrollBox}
                  automaticallyAdjustContentInsets={false}
                  style={[styles.messageBoxWrap, { flex: 1 }]}
                  scrollEventThrottle={500}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleScroll}
                  refreshControl={
                    <RefreshControl
                      refreshing={refresh}
                      onRefresh={handleRefresh}
                    />
                  }
                  onContentSizeChange={handleSizeChange}
                >
                  {renderMessage}
                </ScrollView>
              </View>
            </>
          ))) || <SearchLogo />}
        <View
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: -1,
            opacity: 0,
            top: 0,
            left: 0,
          }}
        >
          {sizeCheck && sizeCheck.length > 0 && (
            <ScrollView
              style={[styles.messageBoxWrap, { flex: 1 }]}
              onContentSizeChange={handleNextPageSize}
            >
              {renderNextMessage}
            </ScrollView>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageBoxWrap: {
    marginBottom: 10,
  },
  moveLoadingBoxWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF',
  },
});

export default SearchList;
