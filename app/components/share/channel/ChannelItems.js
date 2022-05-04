import React, { useCallback, useState, useMemo } from 'react';
import ChannelItem from '@C/share/channel/ChannelItem';
import { FlatList, View } from 'react-native';
import { isEmptyObj, getSettings } from '@C/share/share';

const ChannelItems = ({ channelList, checkObj }) => {
  const pageSize = 13;
  const [pageNum, setPageNum] = useState(1);
  const [pageEnd, setPageEnd] = useState(false);

  const sortedChannels = useMemo(() => {
    const pinned = [];
    const unpinned = [];

    channelList.forEach(r => {
      const setting = getSettings(r, 'CHANNEL');
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
      const aSetting = getSettings(a, 'CHANNEL');
      const bSetting = getSettings(b, 'CHANNEL');
      return bSetting.pinTop - aSetting.pinTop;
    });
    return [...pinned, ...unpinned];
  }, [channelList]);

  const handleUpdate = useCallback(
    value => {
      const nativeEvent = value.nativeEvent;
      const top =
        (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y) /
        nativeEvent.contentSize.height;

      if (top > 0.8 && !pageEnd && pageNum * pageSize < sortedChannels.length) {
        setPageEnd(true);
        setPageNum(prevState => prevState + 1);
      } else {
        setPageEnd(false);
      }
    },
    [sortedChannels, pageNum, pageEnd, pageSize],
  );

  return (
    <>
      {sortedChannels && (
        <View>
          <FlatList
            onScroll={handleUpdate}
            data={sortedChannels.slice(
              0,
              pageSize * pageNum < sortedChannels.length
                ? pageSize * pageNum - 1
                : sortedChannels.length,
            )}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => {
              const setting = getSettings(item, 'CHANNEL');
              let isPinTop = false;
              if (setting && !isEmptyObj(setting) && !!setting.pinTop) {
                isPinTop = true;
              }
              return (
                <ChannelItem
                  channel={item}
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

export default ChannelItems;
