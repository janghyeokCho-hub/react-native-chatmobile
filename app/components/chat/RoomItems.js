import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Room from '@C/chat/Room';
import { FlatList, View } from 'react-native';
import { openRoom } from '@/modules/room';
import { openModal, changeModal, closeModal } from '@/modules/modal';
import { leaveRoomUtil, moveToRoom } from '@/lib/roomUtil';
import messaging from '@react-native-firebase/messaging';
import { getRoomNotification, modifyRoomNotification } from '@/lib/api/setting';
import { getDic } from '@/config';
import { getSysMsgFormatStr } from '@/lib/common';

const RoomItems = ({ rooms, loading, onRoomChange, navigation }) => {
  const { id, selectId } = useSelector(({ login, room }) => ({
    id: login.id,
    selectId: room.selectId,
  }));

  const pageSize = 13;
  const [pageNum, setPageNum] = useState(1);
  const [pageEnd, setPageEnd] = useState(false);
  const [isNotis, setIsNotis] = useState({});

  const dispatch = useDispatch();

  useEffect(() => {
    /* TODO:
    if (DEVICE_TYPE == 'd') {
      const userConfig = evalConnector({
        method: 'getGlobal',
        name: 'USER_SETTING',
      });

      // notiExRooms에 없거나 등록된경우에도 false로 등록됨으로 not 연산자 처리
      if (userConfig && userConfig.config) {
        const notiExRooms = userConfig.config.notiExRooms;
        setIsNotis(notiExRooms);
      }
    }*/
  }, []);

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
    async room => {
      let onNoti = true;
      if (room) {
        const params = { pushID: await messaging().getToken() };

        const notiInfo = await getRoomNotification(room.roomID, params);

        if (notiInfo.status == 200) {
          onNoti = notiInfo.data.result;
        }
        // .then(({ data }) => {
        //   if (data.status === 'SUCCESS') {
        //     console.log(data);
        //     setOnNoti(data.result);
        //   }
        // });
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
        {
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
              alert(
                `${getSysMsgFormatStr(
                  getDic('Tmp_failAlarmOnOff'),
                  onNoti ? getDic('off_low') : getDic('on_low'),
                )}`,
              );
            }

            dispatch(closeModal());
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
