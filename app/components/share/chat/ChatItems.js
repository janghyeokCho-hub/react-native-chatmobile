import React, { useCallback, useState, useMemo } from 'react';
import ChatItem from '@C/share/chat/ChatItem';
import { FlatList, View } from 'react-native';
import { isEmptyObj, getSettings } from '@C/share/share';

const RoomItems = ({ rooms, checkObj }) => {
  const pageSize = 13;
  const [pageNum, setPageNum] = useState(1);
  const [pageEnd, setPageEnd] = useState(false);

  const sortedRooms = useMemo(() => {
    const pinned = [];
    const unpinned = [];

    rooms.forEach(r => {
      const setting = getSettings(r, 'CHAT');
      if (setting) {
        if (isEmptyObj(setting)) {
          unpinned.push(r);
        } else {
          if (!!setting.pinTop) {
            pinned.push(r);
          } else {
            unpinned.push(r);
          }
        }
      }
    });

    pinned.sort((a, b) => {
      const aSetting = getSettings(a, 'CHAT');
      const bSetting = getSettings(b, 'CHAT');
      return bSetting.pinTop - aSetting.pinTop;
    });
    return [...pinned, ...unpinned];
  }, [rooms]);

  const handleUpdate = useCallback(
    value => {
      const nativeEvent = value.nativeEvent;
      const top =
        (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y) /
        nativeEvent.contentSize.height;

      if (top > 0.8 && !pageEnd && pageNum * pageSize < sortedRooms.length) {
        setPageEnd(true);
        setPageNum(prevState => prevState + 1);
      } else {
        setPageEnd(false);
      }
    },
    [sortedRooms, pageNum, pageEnd, pageSize],
  );

  return (
    <>
      {sortedRooms && (
        <View>
          <FlatList
            onScroll={() => handleUpdate()}
            data={sortedRooms.slice(
              0,
              pageSize * pageNum < sortedRooms.length
                ? pageSize * pageNum - 1
                : sortedRooms.length,
            )}
            keyExtractor={item => item.roomID.toString()}
            renderItem={({ item }) => {
              const setting = getSettings(item, 'CHAT');
              let isPinTop = false;
              if (setting && !isEmptyObj(setting) && !!setting.pinTop) {
                isPinTop = true;
              }
              return (
                <ChatItem
                  key={item.roomID}
                  room={item}
                  checkObj={checkObj}
                  pinnedTop={isPinTop}
                />
              );
            }}
          />
        </View>
      )}
    </>
  );
};

export default RoomItems;
