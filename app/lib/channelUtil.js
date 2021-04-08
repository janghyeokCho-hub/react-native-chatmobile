import {
  openChannel,
  leaveChannel,
  setInitCurrentChannel,
} from '@/modules/channel';
import { Alert } from 'react-native';
import { getAllUserWithGroup } from '@API/room';
import { getDic } from '@/config';

export const openChannelRoomView = (
  dispatch,
  viewType,
  rooms,
  selectId,
  userInfo,
  myInfo,
  navigation,
) => {
  let members = [
    {
      id: myInfo.id,
      name: myInfo.name,
      dept: myInfo.dept,
      presence: myInfo.presence,
      PN: myInfo.PN,
      LN: myInfo.LN,
      TN: myInfo.TN,
      photoPath: myInfo.photoPath,
    },
  ];

  if (userInfo.type == 'G') {
    getAllUserWithGroup(userInfo.id).then(({ data }) => {
      members = members.concat(data.result);

      openChatRoomViewCallback(
        dispatch,
        myInfo.id,
        viewType,
        rooms,
        selectId,
        userInfo.id,
        userInfo.type,
        members,
        navigation,
      );
    });
  } else if (userInfo.type == 'F' || userInfo.type == 'C') {
    members = members.concat(userInfo.sub);

    openChatRoomViewCallback(
      dispatch,
      myInfo.id,
      viewType,
      rooms,
      selectId,
      userInfo.id,
      userInfo.type,
      members,
      navigation,
    );
  } else {
    members.push({
      id: userInfo.id,
      name: userInfo.name,
      presence: userInfo.presence,
      PN: userInfo.PN,
      LN: userInfo.LN,
      TN: userInfo.TN,
      photoPath: userInfo.photoPath,
    });

    openChatRoomViewCallback(
      dispatch,
      myInfo.id,
      viewType,
      rooms,
      selectId,
      userInfo.id,
      userInfo.type,
      members,
      navigation,
    );
  }
};

export const openChannelRoomViewCallback = (
  dispatch,
  userId,
  viewType,
  rooms,
  selectId,
  targetId,
  targetType,
  members,
  navigation,
) => {
  let roomId;
  if (userId != targetId) {
    const room = rooms.find(
      item =>
        item.roomType == 'M' &&
        (item.ownerCode == targetId || item.targetCode == targetId),
    );
    if (room) roomId = room.roomID;
  }

  const makeInfoObj = {
    roomName: '',
    roomType: targetType === 'U' ? 'M' : 'G',
    members: members,
    memberType: targetType,
  };

  if (viewType == 'S') {
    // Room이 있는 사용자는 기존 대화방 Open
    const roomID = parseInt(roomId);

    if (targetType === 'U' && roomID) {
      dispatch(
        openChannel({
          roomID: roomID,
        }),
      );

      moveToRoom(navigation, 'ChatRoom', { roomID: roomID });
    } else {
      if (targetId != userId) {
        const makeData = {
          newRoom: true,
          makeInfo: makeInfoObj,
        };

        moveToRoom(navigation, 'MakeRoom', { makeData: makeData });
      }
    }
  } else if (viewType == 'M') {
    //TODO: 패드 확장형

    let openRoomParam;
    if (targetType === 'U' && roomId) {
      if (selectId != roomId) {
        openRoomParam = {
          roomID: roomId,
        };
      }
    } else {
      if (targetId != userId) {
        openRoomParam = {
          newRoom: true,
          makeInfo: makeInfoObj,
        };
      } else {
        dispatch(setInitCurrentChannel());
      }
    }

    if (openRoomParam) {
      dispatch(openRoom(openRoomParam));
    }
  }
};

export const moveToChannelRoom = (navigation, routeName, param) => {
  Promise.all([navigation.navigate('Channel')]).then(() =>
    navigation.navigate(routeName, param),
  );
};

export const leaveChannelUtil = (dispatch, channel, userId, callbackFun) => {
  Alert.alert(
    null,
    getDic('Msg_ChannelLeaveConfirm'),
    [
      { text: getDic('Cancel') },
      {
        text: getDic('Ok'),
        onPress: () => {
          dispatch(
            leaveChannel({
              roomId: channel.roomId,
              userId: userId,
              roomType: channel.roomType,
            }),
          );
          if (callbackFun) callbackFun();
        },
      },
    ],
    { cancelable: true },
  );
};
