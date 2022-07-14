import React, { useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Room from '@C/chat/Room';
import { FlatList, View, Alert } from 'react-native';
import { openRoom } from '@/modules/room';
import { openModal, changeModal, closeModal } from '@/modules/modal';
import { leaveRoomUtil, moveToRoom } from '@/lib/roomUtil';
import messaging from '@react-native-firebase/messaging';
import { getRoomNotification, modifyRoomNotification } from '@/lib/api/setting';
import { getDic, getConfig } from '@/config';
import { getSysMsgFormatStr, isJSONStr } from '@/lib/common';
import { modifyRoomSetting } from '@/modules/room';

const isEmptyObj = obj => {
  if (obj && obj.constructor === Object && Object.keys(obj).length === 0) {
    return true;
  }

  return false;
};

const getRoomSettings = (room = {}) => {
  let setting = {};

  if (typeof room.setting === 'object') {
    setting = { ...room.setting };
  } else if (isJSONStr(room.setting)) {
    setting = JSON.parse(room.setting);
  }
  return setting;
};

const RoomItems = ({ rooms, loading, onRoomChange, navigation }) => {
  const { id, selectId } = useSelector(({ login, room }) => ({
    id: login.id,
    selectId: room.selectId,
  }));

  const pageSize = 13;
  const [pageNum, setPageNum] = useState(1);
  const [pageEnd, setPageEnd] = useState(false);
  const [pinnedRooms, setPinnedRooms] = useState([]);
  const pinToTopLimit = useMemo(() => getConfig('PinToTop_Limit_Chat', -1), []);

  const dispatch = useDispatch();

  const sortedRooms = useMemo(() => {
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

      if (top > 0.8 && !pageEnd && pageNum * pageSize < sortedRooms.length) {
        setPageEnd(true);
        setPageNum(prevState => prevState + 1);
      } else {
        setPageEnd(false);
      }
    },
    [sortedRooms, pageNum, pageEnd, pageSize],
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
        if (room.setting === null) {
          setting = {};
        } else {
          if (isEmptyObj(setting)) {
            setting = {};
          } else {
            setting[key] = value;
          }
        }
      }

      dispatch(
        modifyRoomSetting({
          roomID: room.roomID,
          key: key,
          value: value,
          setting: JSON.stringify(setting),
        }),
      );
    },
    [pinnedRooms, dispatch, pinToTopLimit],
  );

  const showModalMenu = useCallback(
    async room => {
      let onNoti = true;
      if (room) {
        const params = { pushID: await messaging().getToken() };

        const notiInfo = await getRoomNotification(room.roomID, params);

        if (notiInfo.status == 200) {
          onNoti = notiInfo.data.result;
        }
      }

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
        {
          title: getDic('OpenChat'),
          onPress: () => {
            dispatch(openRoom({ roomID: room.roomID }));
            moveToRoom(navigation, 'ChatRoom', { roomID: room.roomID });
            dispatch(closeModal());
          },
        },
        {
          title: getDic('LeaveChat'),
          onPress: () => {
            dispatch(closeModal());
            leaveRoomUtil(dispatch, room, id);
          },
        },
      ];
      // 상단고정 설정
      if (pinToTopLimit >= 0) {
        modalBtn.unshift(isPinTop ? unpinToTop : pinToTop);
      }
      // 알림끄기/켜기 설정
      if (getDic('Tmp_failAlarmOnOff')) {
        modalBtn.push({
          title: onNoti ? getDic('roomNotiOff') : getDic('roomNotiOn'),
          onPress: async () => {
            const params = {
              pushID: await messaging().getToken(),
              value: !onNoti,
            };
            const resultModify = await modifyRoomNotification(
              room.roomID,
              params,
            );
            if (resultModify.status !== 200) {
              Alert.alert(
                `${getSysMsgFormatStr(
                  getDic('Tmp_failAlarmOnOff'),
                  onNoti ? getDic('off_low') : getDic('on_low'),
                )}`,
              );
            }

            dispatch(closeModal());
          },
        });
      }

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
    [dispatch, id, navigation, pinToTopLimit, handleChangeSetting],
  );

  return (
    <>
      {sortedRooms && (
        <View>
          <FlatList
            onScroll={handleUpdate}
            data={sortedRooms.slice(
              0,
              pageSize * pageNum < sortedRooms.length
                ? pageSize * pageNum - 1
                : sortedRooms.length,
            )}
            keyExtractor={item => item.roomID.toString()}
            renderItem={({ item }) => {
              const isSelect = item.roomID === selectId;
              return (
                <Room
                  key={item.roomID}
                  room={item}
                  onRoomChange={onRoomChange}
                  isSelect={isSelect}
                  showModalMenu={showModalMenu}
                  getRoomSettings={getRoomSettings}
                  isEmptyObj={isEmptyObj}
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
