import React, { useCallback, useState } from 'react';
import ChannelItem from '@C/share/channel/ChannelItem';
import { FlatList, View } from 'react-native';

const ChannelItems = ({ channelList, checkObj }) => {
  const pageSize = 13;
  const [pageNum, setPageNum] = useState(1);
  const [pageEnd, setPageEnd] = useState(false);

  const handleUpdate = useCallback(
    value => {
      const nativeEvent = value.nativeEvent;
      const top =
        (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y) /
        nativeEvent.contentSize.height;

      if (top > 0.8 && !pageEnd && pageNum * pageSize < channelList.length) {
        setPageEnd(true);
        setPageNum(prevState => prevState + 1);
      } else {
        setPageEnd(false);
      }
    },
    [channelList, pageNum, pageEnd, pageSize],
  );

  return (
    <>
      {channelList && (
        <View>
          <FlatList
            onScroll={handleUpdate}
            data={channelList.slice(
              0,
              pageSize * pageNum < channelList.length
                ? pageSize * pageNum - 1
                : channelList.length,
            )}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => {
              return <ChannelItem channel={item} checkObj={checkObj} />;
            }}
          />
        </View>
      )}
    </>
  );
};

export default ChannelItems;
