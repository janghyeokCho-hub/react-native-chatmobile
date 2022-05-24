import React, { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Channel from './Channel';
import { FlatList, View, Alert } from 'react-native';
import { openModal, changeModal } from '@/modules/modal';
import { getDic, getConfig } from '@/config';
import EnterChannelBox from '@/components/channel/channelroom/controls/EnterChannelBox';
import { isJSONStr } from '@/lib/common';
import { modifyChannelSetting } from '@/modules/channel';

const isEmptyObj = obj => {
  if (obj && obj.constructor === Object && Object.keys(obj).length === 0) {
    return true;
  }

  return false;
};

const getRoomSettings = (room = {}) => {
  let setting = {};

  if (typeof room.settingJSON === 'object') {
    setting = { ...room.settingJSON };
  } else if (isJSONStr(room.settingJSON)) {
    setting = JSON.parse(room.settingJSON);
  }
  return setting;
};

const ChannelItems = ({
  rooms,
  loading,
  onRoomChange,
  navigation,
  onChannelJoin,
  chineseWall = [],
}) => {
  const { id, selectId } = useSelector(({ login, channel }) => ({
    id: login.id,
    selectId: channel.selectId,
  }));

  const pageSize = 13;
  const [pageNum, setPageNum] = useState(1);
  const [pageEnd, setPageEnd] = useState(false);
  const [pinnedRooms, setPinnedRooms] = useState([]);
  const pinToTopLimit = useMemo(
    () => getConfig('PinToTop_Limit_Channel', -1),
    [],
  );

  const dispatch = useDispatch();

  const sortedChannels = useMemo(() => {
    const pinned = [];
    const unpinned = [];
    const result = [];

    if (pinToTopLimit >= 0) {
      rooms.forEach(r => {
        const setting = getRoomSettings(r);
        if (setting && !isEmptyObj(setting) && !!setting.pinTop) {
          pinned.push(r);
        } else {
          unpinned.push(r);
        }
      });
      setPinnedRooms(pinned);

      pinned.sort((a, b) => {
        const aSetting = getRoomSettings(a);
        const bSetting = getRoomSettings(b);
        return bSetting.pinTop - aSetting.pinTop;
      });
      return result.concat([...pinned, ...unpinned]);
    } else {
      return result.concat(rooms).sort((a, b) => {
        return b.lastMessageDate - a.lastMessageDate;
      });
    }
  }, [rooms, pinToTopLimit]);

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

  const handleChangeSetting = useCallback(
    ({ room, key, type }) => {
      let setting = getRoomSettings(room);
      let value = '';
      if (type === 'ADD') {
        if (
          pinToTopLimit > -1 &&
          pinToTopLimit !== 0 &&
          pinnedRooms?.length >= pinToTopLimit
        ) {
          Alert.alert(
            null,
            getDic('Msg_PinToTop_LimitExceeded', '더 이상 고정할 수 없습니다.'),
          );
          return;
        }

        const today = new Date();
        value = `${today.getTime()}`;
        setting[key] = value;
      } else {
        if (isEmptyObj(setting)) {
          setting = {};
        } else {
          setting[key] = value;
        }
      }

      dispatch(
        modifyChannelSetting({
          roomID: room.roomId,
          key: key,
          value: value,
          setting: JSON.stringify(setting),
        }),
      );
    },
    [pinnedRooms, dispatch, pinToTopLimit],
  );

  const showModalMenu = useCallback(
    room => {
      const pinToTop = {
        title: getDic('PinToTop', '상단고정'),
        onPress: () => {
          handleChangeSetting({ room, key: 'pinTop', type: 'ADD' });
        },
      };
      const unpinToTop = {
        title: getDic('UnpinToTop', '상단고정 해제'),
        onPress: () => {
          handleChangeSetting({ room, key: 'pinTop', type: 'DEL' });
        },
      };

      const setting = getRoomSettings(room);
      let isPinTop = false;
      if (setting && !isEmptyObj(setting) && !!setting.pinTop) {
        isPinTop = true;
      }

      const modalBtn = [
        pinToTopLimit >= 0 && (isPinTop ? unpinToTop : pinToTop),
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
    [dispatch, onRoomChange, pinToTopLimit, handleChangeSetting],
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
              const isSelect = item.roomId === selectId;

              if (item?.isJoin) {
                return (
                  <EnterChannelBox
                    navigation={navigation}
                    channelInfo={item}
                    onChannelJoin={onChannelJoin}
                  />
                );
              } else {
                return (
                  <Channel
                    room={item}
                    onRoomChange={onRoomChange}
                    isSelect={isSelect}
                    showModalMenu={showModalMenu}
                    getRoomSettings={getRoomSettings}
                    isEmptyObj={isEmptyObj}
                    chineseWall={chineseWall}
                  />
                );
              }
            }}
          />
        </View>
      )}
    </>
  );
};

export default ChannelItems;
