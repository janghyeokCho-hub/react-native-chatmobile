import React, { useCallback, useState, useMemo } from 'react';
import ChatItem from '@C/share/chat/ChatItem';
import { FlatList, View } from 'react-native';
import { isJSONStr } from '@/lib/common'

const isEmptyObj = obj => {
  if (obj.constructor === Object && Object.keys(obj).length === 0) {
    return true;
  }
  return false;
};

const getRoomSettings = room => {
  let setting = null;

  if (room.setting === null) {
    setting = {};
  } else if (typeof room.setting === 'object') {
    setting = { ...room.setting };
  } else if (isJSONStr(room.setting)) {
    setting = JSON.parse(room.setting);
  }
  return setting;
};

const RoomItems = ({ rooms, checkObj }) => {
  const pageSize = 13;
  const [pageNum, setPageNum] = useState(1);
  const [pageEnd, setPageEnd] = useState(false);

  const sortedRooms = useMemo(() => {
    const pinned = [];
    const unpinned = [];

    rooms.forEach(r => {
      const setting = getRoomSettings(r);
      if (isEmptyObj(setting)) {
        unpinned.push(r);
      } else {
        if (!!setting.pinTop) {
          pinned.push(r);
        } else {
          unpinned.push(r);
        }
      }
    });

    pinned.sort((a, b) => {
      const aSetting = getRoomSettings(a);
      const bSetting = getRoomSettings(b);
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
                const setting = getRoomSettings(item);
                let isPinTop = false;
                if (!isEmptyObj(setting) && !!setting.pinTop) {
                  isPinTop = true;
                }
              return (
                <ChatItem key={item.roomID} room={item} checkObj={checkObj} pinnedTop={isPinTop} />
              );
            }}
          />
        </View>
      )}
    </>
  );
};

export default RoomItems;
