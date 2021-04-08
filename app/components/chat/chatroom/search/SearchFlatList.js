// import 하지않는 샘플파일입니다. 업무상 참고하시기 바랍니다.

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useDispatch } from 'react-redux';
import { setUnreadCountForSync } from '@/modules/room';
import { View, StyleSheet, Image, FlatList } from 'react-native';
import { getMessage } from '@/lib/messageUtil';
import Svg, { Path, G } from 'react-native-svg';

import MessageBox from '@C/chat/message/MessageBox';
import SystemMessageBox from '@C/chat/message/SystemMessageBox';

const loadingImg = require('@C/assets/loading.gif');

const SearchFlatList = ({ moveData, markingText, roomID, navigation }) => {
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

  const dispatch = useDispatch();
  const scrollBox = useRef(null);

  useEffect(() => {
    if (moveData != null && moveData.firstPage.length > 0) {
      // move 관련
      setMessages(moveData.firstPage);
      setMoveId(moveData.moveId);
      setNextId(moveData.firstPage[0].messageID);
      setBeforeId(moveData.firstPage[moveData.firstPage.length - 1].messageID);
      setOffset(-1);
    } else {
      setMessages([]);
      setNextMessages([]);
      setBeforeMessages([]);
      setMoveId(null);
    }
  }, [moveData]);

  useEffect(() => {
    if (offset > -1) {
      scrollBox.current.scrollToOffset({ x: 0, y: offset, animated: false });
    }
  }, [offset]);

  const drawMessage = useCallback(
    (item, index) => {
      const message = item;
      const beforeMessage = index > 0 ? messages[index - 1] : null;
      const nextMessage =
        index < messages.length - 1 ? messages[index + 1] : null;

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

      if (dateBox) nameBox = true;

      let timeBox = !(beforeSendTime == currentTime);
      if (!timeBox) {
        // time은 같지만 다른사용자의 채팅으로 넘어가는경우
        timeBox = !(message.sender == beforeSender);
      }

      if (message.messageType != 'S') {
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
            marking={markingText}
          />
        );
      } else {
        // System Message

        return <SystemMessageBox key={message.messageID} message={message} />;
      }
    },
    [messages],
  );

  const renderMessage = useCallback(
    (item, index) => {
      // status key 가 존재하면 tempMessage
      if (item.messageID == moveId) {
        return (
          <View
            onLayout={event => {
              if (offset == -1) setOffset(event.nativeEvent.layout.y);
            }}
          >
            {drawMessage(item, index)}
          </View>
        );
      } else {
        return <View>{drawMessage(item, index)}</View>;
      }
    },
    [messages, moveId, offset],
  );

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
      setNextId(nextMessages[0].messageID);
      setMessages([...nextMessages, ...messages]);
    }
  }, [nextMessages, messages, topEnd]);

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

      if (currentPositionRate > 0.9) {
        !loading && handleScrollBottom();
      } else if (currentPositionRate < 0.1) {
        !loading && handleScrollTop();
      }
    },
    [loading],
  );

  return (
    <View style={styles.container}>
      {(moveData &&
        ((messages && messages.length > 0 && (
          <>
            <View style={{ flex: 1 }}>
              <FlatList
                inverted
                ref={scrollBox}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                }}
                style={[styles.messageBoxWrap, { flex: 1 }]}
                data={messages}
                keyExtractor={item => item.messageID}
                windowSize={50}
                initialNumToRender={50}
                renderItem={({ item, index }) => renderMessage(item, index)}
                keyboardShouldPersistTaps="handled"
                scrollEventThrottle={100}
                decelerationRate="fast"
                onScroll={handleScroll}
              />
            </View>
          </>
        )) || (
          <View style={styles.moveLoadingBoxWrap}>
            <Image source={loadingImg} style={{ width: 100, height: 100 }} />
          </View>
        ))) || (
        <View style={styles.emptyBoxWrap}>
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            width="97"
            height="92.509"
            viewBox="0 0 97 92.509"
          >
            <G transform="translate(-532 -235)">
              <Path
                d="M45.778,91.672c.094-2.438,1.173-5.979,1.517-8.685C21.066,82.441,0,64.076,0,41.5,0,18.58,21.714,0,48.5,0S97,18.58,97,41.5c0,11.116-5.107,21.211-13.423,28.66C69.6,83.866,52,92.51,47.1,92.509,46.227,92.509,45.757,92.237,45.778,91.672Z"
                transform="translate(532 235)"
                fill="#ebecf0"
              />
              <G transform="translate(546 267)" style="isolation:isolate">
                <G transform="translate(0 0)" style="isolation:isolate">
                  <Path
                    d="M46.789,48.149a6.549,6.549,0,0,0,2.284,3.238,6.27,6.27,0,0,0,3.845,1.272,8.132,8.132,0,0,0,3.412-.781,6.075,6.075,0,0,0,2.631-2.052l3.151,2.139a9.614,9.614,0,0,1-3.961,3.267,11.915,11.915,0,0,1-5.234,1.244A10.266,10.266,0,0,1,42.654,46.24a10.243,10.243,0,0,1,17.493-7.257,9.89,9.89,0,0,1,3.007,7.257,10.176,10.176,0,0,1-.173,1.88Zm6.13-8.356a6.267,6.267,0,0,0-3.845,1.272,6.54,6.54,0,0,0-2.284,3.267h12.23a6.543,6.543,0,0,0-2.284-3.267A6.228,6.228,0,0,0,52.918,39.793Z"
                    transform="translate(-42.654 -35.976)"
                    fill="#f9f9f9"
                  />
                </G>
                <G transform="translate(19.983 0)" style="isolation:isolate">
                  <Path
                    d="M99.937,35.976V46.24a10.25,10.25,0,0,1-20.5,0V35.976h3.816V46.24a6.185,6.185,0,0,0,1.879,4.54A6.28,6.28,0,0,0,89.7,52.659,6.416,6.416,0,0,0,96.12,46.24V35.976Z"
                    transform="translate(-79.437 -35.976)"
                    fill="#f9f9f9"
                  />
                </G>
                <G transform="translate(40.23 0)" style="isolation:isolate">
                  <Path
                    d="M116.706,56.476V44.129a8.144,8.144,0,0,1,8.153-8.153A7.755,7.755,0,0,1,131.1,38.9a8.175,8.175,0,0,1,14.429,5.233V56.476h-3.817V44.129a4.344,4.344,0,0,0-4.337-4.336,4.272,4.272,0,0,0-3.094,1.272,4.175,4.175,0,0,0-1.272,3.064V56.476H129.2V44.129a4.337,4.337,0,0,0-8.674,0V56.476Z"
                    transform="translate(-116.706 -35.976)"
                    fill="#f9f9f9"
                  />
                </G>
              </G>
            </G>
          </Svg>
        </View>
      )}
    </View>
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
  emptyBoxWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
});

export default SearchFlatList;
