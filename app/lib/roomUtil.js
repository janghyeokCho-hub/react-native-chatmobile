import { openRoom, setInitCurrentRoom, leaveRoom } from '@/modules/room';
import { leaveChannel } from '@/modules/channel';
import { mappingUserChatRoom } from '@/modules/contact';
import { getAllUserWithGroup } from '@API/room';
import { getDic } from '@/config';
import { Alert } from 'react-native';

export const openChatRoomView = (
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

  if (userInfo.type === 'U' && myInfo.id === userInfo.id) {
    openMemoViewCallback(
      dispatch,
      myInfo.id,
      viewType,
      rooms,
      selectId,
      members,
      navigation,
    );
  } else if (userInfo.type == 'G') {
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

export const openChatRoomViewCallback = (
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
        openRoom({
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
        dispatch(setInitCurrentRoom());
      }
    }

    if (openRoomParam) {
      dispatch(openRoom(openRoomParam));
    }
  }
};

export const moveToRoom = (navigation, routeName, param) => {
  Promise.all([navigation.navigate('Chat')]).then(() =>
    navigation.navigate(routeName, param),
  );
};

export const leaveRoomUtil = (dispatch, room, userId, callbackFun) => {
  Alert.alert(
    null,
    getDic('Msg_ConfirmLeave'),
    [
      { text: getDic('Cancel') },
      {
        text: getDic('Ok'),
        onPress: () => {
          leaveRoomUtilAfter(dispatch, room, userId);
          if (callbackFun) callbackFun();
        },
      },
    ],
    { cancelable: true },
  );
};

export const leaveRoomUtilAfter = (dispatch, room, userId) => {
  dispatch(
    leaveRoom({
      roomID: room.roomID,
      userID: userId,
      roomType: room.roomType,
    }),
  );

  // target과의 연락처 맵핑 해제
  if (room.roomType == 'M') {
    const filterMember = room.members.filter(item => {
      if (item.id === userId) return false;
      return true;
    });
    const target = filterMember[0];

    dispatch(
      mappingUserChatRoom({
        id: target.id,
        roomID: null,
      }),
    );
  }
};

const openMemoViewCallback = (
  dispatch,
  userId,
  viewType,
  rooms,
  selectId,
  members,
  navigation,
) => {
  let roomId;

  const room = rooms.find(
    item => item.roomType == 'O' && item.ownerCode == userId,
  );
  if (room) roomId = room.roomID;

  const makeInfoObj = {
    roomName: '',
    roomType: 'O',
    members: members,
    memberType: 'U',
  };

  if (viewType == 'S') {
    // Room이 있는 사용자는 기존 대화방 Open
    const roomID = parseInt(roomId);

    if (roomID) {
      dispatch(
        openRoom({
          roomID: roomID,
        }),
      );

      moveToRoom(navigation, 'ChatRoom', { roomID: roomID });
    } else {
      const makeData = {
        newRoom: true,
        makeInfo: makeInfoObj,
      };

      moveToRoom(navigation, 'MakeRoom', { makeData: makeData });
    }
  } else if (viewType == 'M') {
    //TODO: 패드 확장형

    let openRoomParam;
    if (roomId) {
      if (selectId != roomId) {
        openRoomParam = {
          roomID: roomId,
        };
      }
    } else {
      openRoomParam = {
        newRoom: true,
        makeInfo: makeInfoObj,
      };
    }

    if (openRoomParam) {
      dispatch(openRoom(openRoomParam));
    }
  }
};
