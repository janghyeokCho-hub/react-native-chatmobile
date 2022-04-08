import React, { useCallback, useState } from 'react';
import ChatItem from '@C/share/chat/ChatItem';
import { FlatList, View } from 'react-native';

const RoomItems = ({ rooms, checkObj }) => {
  const pageSize = 13;
  const [pageNum, setPageNum] = useState(1);
  const [pageEnd, setPageEnd] = useState(false);

  const handleUpdate = useCallback(
    value => {
      const nativeEvent = value.nativeEvent;
      const top =
        (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y) /
        nativeEvent.contentSize.height;

      if (top > 0.8 && !pageEnd && pageNum * pageSize < rooms.length) {
        setPageEnd(true);
        setPageNum(prevState => prevState + 1);
      } else {
        setPageEnd(false);
      }
    },
    [rooms, pageNum, pageEnd, pageSize],
  );

  return (
    <>
      {rooms && (
        <View>
          <FlatList
            onScroll={() => handleUpdate()}
            data={rooms.slice(
              0,
              pageSize * pageNum < rooms.length
                ? pageSize * pageNum - 1
                : rooms.length,
            )}
            keyExtractor={item => item.roomID.toString()}
            renderItem={({ item }) => {
              return (
                <ChatItem key={item.roomID} room={item} checkObj={checkObj} />
              );
            }}
          />
        </View>
      )}
    </>
  );
};

export default RoomItems;
