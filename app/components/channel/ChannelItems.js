import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Channel from './Channel';
import { FlatList, View } from 'react-native';
import { openModal, changeModal, closeModal } from '@/modules/modal';
import { getDic } from '@/config';

const ChannelItems = ({ rooms, loading, onRoomChange, navigation }) => {
  const { id, selectId } = useSelector(({ login, channel }) => ({
    id: login.id,
    selectId: channel.selectId,
  }));

  const pageSize = 13;
  const [pageNum, setPageNum] = useState(1);
  const [pageEnd, setPageEnd] = useState(false);
  const [isNotis, setIsNotis] = useState({});

  const dispatch = useDispatch();

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

  const showModalMenu = useCallback(
    room => {
      const modalBtn = [
        {
          title: getDic('OpenChannel'),
          onPress: () => {
            onRoomChange(room);
          },
        },
      ];
      dispatch(
        changeModal({
          modalData: {
            closeOnTouchOutside: true,
            type: 'normal',
            buttonList: modalBtn,
          },
        }),
      );
      dispatch(openModal());
    },
    [dispatch, id, navigation],
  );

  return (
    <>
      {rooms && (
        <View>
          <FlatList
            onScroll={handleUpdate}
            data={rooms.slice(
              0,
              pageSize * pageNum < rooms.length
                ? pageSize * pageNum - 1
                : rooms.length,
            )}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => {
              const isSelect = item.roomId === selectId;
              return (
                <Channel
                  room={item}
                  onRoomChange={onRoomChange}
                  isSelect={isSelect}
                  showModalMenu={showModalMenu}
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
