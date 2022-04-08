import React, { useCallback, useState, useMemo } from 'react';
import ChannelItem from '@C/share/channel/ChannelItem';
import { FlatList, View } from 'react-native';
import { isJSONStr } from '@/lib/common'

const isEmptyObj = obj => {
  if (obj.constructor === Object && Object.keys(obj).length === 0) {
    return true;
  }
  return false;
};

const getChannelSettings = channel => {
  let setting = null;

  if (channel.settingJSON === null) {
    setting = {};
  } else if (typeof channel.settingJSON === 'object') {
    setting = { ...channel.settingJSON };
  } else if (isJSONStr(channel.settingJSON)) {
    setting = JSON.parse(channel.settingJSON);
  }
  return setting;
};

const ChannelItems = ({ channelList, checkObj }) => {
  const pageSize = 13;
  const [pageNum, setPageNum] = useState(1);
  const [pageEnd, setPageEnd] = useState(false);

  const sortedChannels = useMemo(() => {
    const pinned = [];
    const unpinned = [];

    channelList.forEach(r => {
      const setting = getChannelSettings(r);
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
      const aSetting = getChannelSettings(a);
      const bSetting = getChannelSettings(b);
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
              const setting = getChannelSettings(item);
              let isPinTop = false;
              if (!isEmptyObj(setting) && !!setting.pinTop) {
                isPinTop = true;
              }
              return <ChannelItem channel={item} checkObj={checkObj} pinnedTop={isPinTop} />;
            }}
          />
        </View>
      )}
    </>
  );
};

export default ChannelItems;
