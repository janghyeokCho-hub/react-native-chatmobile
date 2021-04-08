import {
  receiveMessage,
  roomInviteMessageAdd,
  roomLeaveMessageAdd,
  messageReadCountChanged,
  setMessageLinkInfo,
  roomLeaveOtherDevice,
  roomLeaveTargetUser,
  messageReadOtherDevice,
} from '@/modules/room';

import {
  receiveMessage as receiveChannelMessage,
  receiveDeletedMessage as receiveDeletedChannelMessage,
  receiveNotice as receiveChannelNotice,
  receiveDeletedNotice as receiveDeletedChannelNotice,
  channelInviteMessageAdd,
  channelLeaveMessageAdd,
  messageReadCountChanged as messageChannelReadCountChanged,
  channelClosure,
  receiveDeletedNotice,
  getChannels,
  resetUnreadCount,
  channelLeaveOtherDevice,
  changeChannelAuth,
} from '@/modules/channel';

import { setUsersPresence, addFixedUsers } from '@/modules/presence';
import { changeSocketConnect, sync } from '@/modules/login';
import AsyncStorage from '@react-native-community/async-storage';
import * as LoginInfo from '@/lib/class/LoginInfo';
import * as RoomList from '@/lib/class/RoomList';
import * as dbAction from '@/lib/appData/action';
import { Alert } from 'react-native';
import { restartApp } from '@/lib/device/common';
import { getDic } from '@/config';

// 새메시지 도착
export const handleNewMessage = (dispatch, userInfo) => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);

    json_data.senderInfo = JSON.parse(json_data.senderInfo);

    if (json_data.sender == userInfo.id) json_data.isMine = 'Y';
    json_data.isNotice = false;

    dispatch(receiveMessage(json_data));
    dbAction.saveMessage(json_data);
  };
};

export const handleChatRoomInvite = dispatch => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);

    // 차후 삭제 필요
    // console.log(json_data);

    dispatch(roomInviteMessageAdd(json_data));

    const members = json_data.inviteMember.map(item => {
      return { id: item.id, presence: item.presense };
    });
    dispatch(addFixedUsers(members));

    dbAction.addMembers(json_data);
    const messageParam = {
      messageID: json_data.messageID,
      context: json_data.context,
      sender: json_data.sender,
      sendDate: json_data.sendDate,
      roomID: json_data.roomID,
      receiver: json_data.receiver,
      messageType: json_data.messageType,
      unreadCnt: 0,
      isMine: 'N',
      isSyncUnRead: 'Y',
      tempId: 0,
    };
    dbAction.saveMessage(messageParam);
  };
};

export const handleChatRoomExit = (dispatch, userInfo) => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);

    // 차후 삭제 필요
    // console.log(json_data);

    if (userInfo.id == json_data.leaveMember) {
      // 다른기기에서 자기자신이 퇴장한 경우 store에서 삭제함
      dispatch(roomLeaveOtherDevice(json_data));

      dbAction.delRoom(json_data.roomID);
    } else {
      if (json_data.roomType != 'M') {
        // 다른 사용자가 퇴장한 경우 퇴장 메시지 추가
        dispatch(roomLeaveMessageAdd(json_data));

        dbAction.delMember(json_data);
        const messageParam = {
          messageID: json_data.messageID,
          context: json_data.context,
          sender: json_data.sender,
          sendDate: json_data.sendDate,
          roomID: json_data.roomID,
          receiver: json_data.receiver,
          messageType: json_data.messageType,
          unreadCnt: 0,
          isSyncUnRead: 'Y',
          isMine: 'N',
          tempId: 0,
        };
        dbAction.saveMessage(messageParam);
      } else {
        // 개인채팅방에서 target 사용자가 퇴장한 경우 store 업데이트
        dispatch(roomLeaveTargetUser(json_data));

        dbAction.delTargetUser(json_data);
      }
    }
  };
};

export const handleReadCountChanged = (dispatch, userInfo) => {
  return data => {
    if (data == null || data == undefined) return;
    // browser 버전에서는 current room에 대한 처리만 있음.
    const json_data = JSON.parse(data);

    if (json_data.reader == userInfo.id) {
      json_data.isMine = 'Y';
    } else {
      json_data.isMine = 'N';
    }

    // 차후 삭제 필요
    // console.log(json_data);

    dispatch(messageReadCountChanged(json_data));

    json_data.isMine == 'Y' && dispatch(messageReadOtherDevice(json_data));

    dbAction.setUnreadCnt(json_data);
  };
};

export const handleReadChannel = dispatch => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);

    // 차후 삭제 필요
    //console.log(json_data);

    dispatch(resetUnreadCount(json_data.roomID));
  };
};

export const handlePresenceChanged = dispatch => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);

    // 차후 삭제 필요
    //console.log(json_data);

    dispatch(setUsersPresence(json_data));
    dbAction.updatePresence([json_data]);
  };
};

/*
export const handleNewLinkThumbnail = dispatch => {
  return data => {
    const json_data = JSON.parse(data);

    // 차후 삭제 필요
    console.log(json_data);

    dispatch(setMessageLinkInfo(json_data));
  };
};
*/

export const handleForceToLogout = dispatch => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);
    // 차후 삭제 필요
    // console.log(json_data);

    // 연결끊기
    AsyncStorage.removeItem('covi_user_access_token');
    AsyncStorage.removeItem('covi_user_access_id');

    Alert.alert(null, getDic('Msg_LoginOtherDevice'), [
      {
        text: getDic('Ok'),
        onPress: () => {
          restartApp();
        },
      },
    ]);
  };
};

export const handleChannelClosure = dispatch => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);
    dispatch(channelClosure(json_data));
  };
};

export const handleConnect = dispatch => {
  return data => {
    dispatch(changeSocketConnect('CC'));
  };
};

export const handleDisconnect = dispatch => {
  return data => {
    dispatch(changeSocketConnect('DC'));
  };
};

export const handleReconnect = (dispatch, userList) => {
  return data => {
    const loginInfo = LoginInfo.getLoginInfo();
    if (loginInfo.getData() && loginInfo.getID()) {
      dispatch(sync({ showLoading: false, userList }));
      dispatch(getChannels({ userId: loginInfo.getID() }));

      RoomList.clearData();
    }
  };
};

// 채널
export const handleNewChannelMessage = (dispatch, userInfo) => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);
    json_data.senderInfo = JSON.parse(json_data.senderInfo);

    if (json_data.sender == userInfo.id) json_data.isMine = 'Y';

    json_data.isNotice = false;

    // 차후 삭제 필요
    //console.log('handleNewChannelMessage => ', json_data);

    dispatch(receiveChannelMessage(json_data));
  };
};

export const handleChannelInvite = dispatch => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);

    console.log('json_data', json_data);

    // 차후 삭제 필요
    //console.log('handleChannelInvite => ', json_data);

    dispatch(channelInviteMessageAdd(json_data));

    // const members = json_data.inviteMember.map(item => {
    //   return { id: item.id, presence: item.presense };
    // });
    // dispatch(addFixedUsers(members));
  };
};

export const handleChannelExit = (dispatch, userInfo) => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);
    console.log('json_data', json_data);

    // 차후 삭제 필요
    console.log('handleChannelExit => ', json_data);

    if (userInfo.id == json_data.leaveMember) {
      dispatch(channelLeaveOtherDevice(json_data));
    } else {
      dispatch(channelLeaveMessageAdd(json_data));
    }
  };
};

export const handleChannelReadCountChanged = dispatch => {
  return data => {
    if (data == null || data == undefined) return;
    // browser 버전에서는 current channel 대한 처리만 있음.
    const json_data = JSON.parse(data);
    console.log('json_data', json_data);

    // 차후 삭제 필요
    // console.log(json_data);

    dispatch(messageChannelReadCountChanged(json_data));
  };
};

// 새메시지 도착
export const handleNewNotice = dispatch => {
  return data => {
    if (data == null || data == undefined) return;
    if (data != null) {
      const json_data = JSON.parse(data);

      console.log('json_data', json_data);
      // 차후 삭제 필요
      // console.log('handleNewNotice => ', data);
      // console.log(json_data);

      json_data.isNotice = true;
      json_data.isMine = 'N';

      dispatch(receiveMessage(json_data));
      dbAction.saveMessage(json_data);
    }
  };
};

// 채널 메시지 삭제
export const handleDelChannelMessage = dispatch => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);

    console.log('json_data', json_data);
    // 차후 삭제 필요
    console.log('handleDelChannelMessage => ', json_data);
    if (json_data.messageType === 'I') {
      dispatch(receiveDeletedChannelNotice(json_data));
    } else {
      dispatch(receiveDeletedChannelMessage(json_data));
    }
  };
};

// 채널 메시지 삭제
export const handleDelChannelNotice = dispatch => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);
    console.log('json_data', json_data);

    // 차후 삭제 필요
    console.log('handleDelChannelNotice => ', json_data);

    dispatch(receiveDeletedNotice(json_data));
  };
};

// 채널 공지
export const handleNewChannelNotice = (dispatch, userInfo) => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);
    console.log('json_data', json_data);

    // 차후 삭제 필요
    // console.log(json_data);

    dispatch(receiveChannelMessage(json_data));
    dispatch(receiveChannelNotice(json_data));
  };
};

// 채널 관리자 변경
export const handleAuthChanged = (dispatch, userInfo) => {
  return data => {
    if (data == null || data == undefined) return;
    const json_data = JSON.parse(data);
    dispatch(changeChannelAuth(json_data));
  };
};
