import { createAction, handleActions } from 'redux-actions';
import { takeLatest, throttle } from 'redux-saga/effects';
import * as roomApi from '@API/room';
import * as saga from '@/modules/saga/roomSaga';
import createRequestSaga, {
  createRequestActionTypes,
} from '@/modules/saga/createRequestSaga';
import produce from 'immer';

var _ = require('lodash');

const [
  GET_ROOMS,
  GET_ROOMS_SUCCESS,
  GET_ROOMS_FAILURE,
] = createRequestActionTypes('room/GET_ROOMS');

const [
  GET_ROOM_INFO,
  GET_ROOM_INFO_SUCCESS,
  GET_ROOM_INFO_FAILURE,
] = createRequestActionTypes('room/GET_ROOM_INFO');

const [
  UPDATE_ROOMS,
  UPDATE_ROOMS_SUCCESS,
  UPDATE_ROOMS_FAILURE,
] = createRequestActionTypes('room/UPDATE_ROOMS');

const ROOM_MESSAGE_ADD = 'room/ROOM_MESSAGE_ADD';
const ROOM_MESSAGE_DELETE = 'room/ROOM_MESSAGE_DELETE';

const OPEN_ROOM = 'room/OPEN_ROOM';
const CHANGE_OPEN_ROOM = 'room/CHANGE_OPEN_ROOM';

const CHANGE_VIEW_TYPE = 'room/CHANGE_VIEW_TYPE';
const MAKE_ROOM_VIEW = 'room/MAKE_ROOM_VIEW';
const RESET_UNREAD_COUNT = 'room/RESET_UNREAD_COUNT';

const ROOM_INVITE_MESSAGE_ADD = 'room/ROOM_INVITE_MESSAGE_ADD';
const ROOM_LEAVE_MESSAGE_ADD = 'room/ROOM_LEAVE_MESSAGE_ADD';

const READ_MESSAGE = 'room/READ_MESSAGE';
const READ_MESSAGE_FOCUS = 'room/READ_MESSAGE_FOCUS';
const MESSAGE_READ_COUNT_CHANGED = 'room/MESSAGE_READ_COUNT_CHANGED';
const MESSAGE_READ_OTHER_DEVICE = 'room/MESSAGE_READ_OTHER_DEVICE';

const [
  REMATCHING_MEMBER,
  REMATCHING_MEMBER_SUCCESS,
  REMATCHING_MEMBER_FAILURE,
] = createRequestActionTypes('room/REMATCHING_MEMBER');

const [
  INVITE_MEMBER,
  INVITE_MEMBER_SUCCESS,
  INVITE_MEMBER_FAILURE,
] = createRequestActionTypes('room/INVITE_MEMBER');

const [
  LEAVE_ROOM,
  LEAVE_ROOM_SUCCESS,
  LEAVE_ROOM_FAILURE,
] = createRequestActionTypes('room/LEAVE_ROOM');

const RECEIVE_MESSAGE = 'room/RECEIVE_MESSAGE';

const SET_MESSAGE_LINKINFO = 'room/SET_MESSAGE_LINKINFO';

const SET_ROOMS = 'room/SET_ROOMS';
const INIT = 'room/INIT';

const SET_INIT_CURRENTROOM = 'room/SET_CURRENT_INIT';

const MODIFY_ROOMNAME_LIST = 'room/MODIFY_ROOMNAME_LIST';
const [
  MODIFY_ROOMNAME,
  MODIFY_ROOMNAME_SUCCESS,
  MODIFY_ROOMNAME_FAILURE,
] = createRequestActionTypes('room/MODIFY_ROOMNAME');

const SET_MESSAGES = 'room/SET_MESSAGES';
const SET_MESSAGES_SYNC = 'room/SET_MESSAGES_SYNC';

const INIT_MESSAGES = 'room/INIT_MESSAGES';

const CHECK_ROOM_MOVE = 'room/CHECK_ROOM_MOVE';
const [
  SET_UNREADCNT_SYNC,
  SET_UNREADCNT_SYNC_SUCCESS,
  SET_UNREADCNT_SYNC_FAILURE,
] = createRequestActionTypes('room/SET_UNREADCNT_SYNC');

const ROOM_LEAVE_OTHER_DEVICE = 'room/ROOM_LEAVE_OTHER_DEVICE';
const ROOM_LEAVE_TARGET_USER = 'room/ROOM_LEAVE_TARGET_USER';

const CLOSE_ROOM = 'room/CLOSE_ROOM';

const [
  MODIFY_ROOMSETTING,
  MODIFY_ROOMSETTING_SUCCESS,
  MODIFY_ROOMSETTING_FAILURE,
] = createRequestActionTypes('room/MODIFY_ROOMSETTING');

const SET_SEARCH_KEYWORD_ROOM = 'room/SET_SEARCH_KEYWORD_ROOM';

const RECEIVE_ROOMSETTING = 'room/RECEIVE_ROOMSETTING';

export const getRooms = createAction(GET_ROOMS);
export const updateRooms = createAction(UPDATE_ROOMS);
export const getRoomInfo = createAction(GET_ROOM_INFO);
export const roomMessageAdd = createAction(ROOM_MESSAGE_ADD);
export const roomMessageDel = createAction(ROOM_MESSAGE_DELETE);
export const changeOpenRoom = createAction(CHANGE_OPEN_ROOM);
export const changeViewType = createAction(CHANGE_VIEW_TYPE);
export const makeRoomView = createAction(MAKE_ROOM_VIEW);
export const resetUnreadCount = createAction(RESET_UNREAD_COUNT);
export const rematchingMember = createAction(REMATCHING_MEMBER);
export const inviteMember = createAction(INVITE_MEMBER);
export const leaveRoom = createAction(LEAVE_ROOM);
export const roomInviteMessageAdd = createAction(ROOM_INVITE_MESSAGE_ADD);
export const roomLeaveMessageAdd = createAction(ROOM_LEAVE_MESSAGE_ADD);

export const readMessage = createAction(READ_MESSAGE);
export const readMessageFocus = createAction(READ_MESSAGE_FOCUS);
export const messageReadCountChanged = createAction(MESSAGE_READ_COUNT_CHANGED);
export const messageReadOtherDevice = createAction(MESSAGE_READ_OTHER_DEVICE);

export const receiveMessage = createAction(RECEIVE_MESSAGE);
export const openRoom = createAction(OPEN_ROOM);

export const setMessageLinkInfo = createAction(SET_MESSAGE_LINKINFO);
export const setRooms = createAction(SET_ROOMS);
export const init = createAction(INIT);
export const setInitCurrentRoom = createAction(SET_INIT_CURRENTROOM);
export const modifyRoomNameList = createAction(MODIFY_ROOMNAME_LIST);
export const modifyRoomName = createAction(MODIFY_ROOMNAME);

export const setMessages = createAction(SET_MESSAGES);
export const setMessagesForSync = createAction(SET_MESSAGES_SYNC);
export const initMessages = createAction(INIT_MESSAGES);

export const checkRoomMove = createAction(CHECK_ROOM_MOVE);
export const setUnreadCountForSync = createAction(SET_UNREADCNT_SYNC);

export const roomLeaveOtherDevice = createAction(ROOM_LEAVE_OTHER_DEVICE);
export const roomLeaveTargetUser = createAction(ROOM_LEAVE_TARGET_USER);

export const closeRoom = createAction(CLOSE_ROOM);

export const modifyRoomSetting = createAction(MODIFY_ROOMSETTING);

export const setSearchKeywordRoom = createAction(SET_SEARCH_KEYWORD_ROOM);

export const receiveRoomSetting = createAction(RECEIVE_ROOMSETTING);

const inviteMemberSaga = createRequestSaga(INVITE_MEMBER, roomApi.inviteMember);

const getRoomsSaga = saga.createGetRoomsSaga();
const getRoomInfoSaga = saga.createGetRoomInfoSaga();
const openRoomSaga = saga.createOpenRoomSaga();
const receiveMessageSaga = saga.createReceiveMessageSaga();
const checkRoomMoveSaga = saga.createCheckRoomMoveSaga();
const updateRoomsSaga = saga.createUpdateRoomsSaga();
const leaveRoomSaga = saga.createLeaveRoomsSaga();
const modifyRoomNameSaga = saga.createModifyRoomNameSaga();
const rematchingMemberSaga = saga.createRematchingMemberSaga();
const readMessageSaga = saga.createReadMessageSaga();
const readMessageFocusSaga = saga.createReadMessageSaga();
const setUnreadCountForSyncSaga = saga.createSetUnreadCountForSyncSaga();
const modifyRoomSettingSaga = saga.createModifyRoomSettingSaga();

export function* roomSaga() {
  yield takeLatest(GET_ROOMS, getRoomsSaga);
  yield takeLatest(UPDATE_ROOMS, updateRoomsSaga);
  yield takeLatest(GET_ROOM_INFO, getRoomInfoSaga);
  yield takeLatest(REMATCHING_MEMBER, rematchingMemberSaga);
  yield takeLatest(INVITE_MEMBER, inviteMemberSaga);
  yield takeLatest(LEAVE_ROOM, leaveRoomSaga);
  yield takeLatest(RECEIVE_MESSAGE, receiveMessageSaga);
  yield takeLatest(OPEN_ROOM, openRoomSaga);
  yield takeLatest(MODIFY_ROOMNAME, modifyRoomNameSaga);
  yield takeLatest(CHECK_ROOM_MOVE, checkRoomMoveSaga);
  yield takeLatest(READ_MESSAGE, readMessageSaga);
  yield takeLatest(SET_UNREADCNT_SYNC, setUnreadCountForSyncSaga);
  yield takeLatest(MODIFY_ROOMSETTING, modifyRoomSettingSaga);
  yield throttle(1000, READ_MESSAGE_FOCUS, readMessageFocusSaga);
}

const initialState = {
  viewType: 'S',
  selectId: -1,
  currentRoom: null,
  rooms: [],
  messages: [],
  makeRoom: false,
  makeInfo: null,
};

const room = handleActions(
  {
    [INIT]: (state, action) => ({
      ...initialState,
    }),
    [SET_ROOMS]: (state, action) => {
      return produce(state, draft => {
        if (draft.currentRoom) {
          const currRoom = action.payload.rooms.find(
            room => room.roomID == draft.currentRoom.roomID,
          );

          currRoom.unreadCnt = draft.currentRoom.unreadCnt;
          draft.currentRoom = currRoom;
        }
        draft.rooms = action.payload.rooms.filter(room => {
          if (typeof room.lastMessageDate === 'string') {
            return room.lastMessageDate.trim().length;
          }
          return room.lastMessageDate !== null;
        });
      });
    },
    [GET_ROOMS_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        /*if (draft.rooms.length > 0) {
          // ?????? ????????? ?????? action??? ?????? ????????? ?????? ???????????? ?????? update???????????? ??????
          action.payload.rooms.forEach(item => {
            const room = draft.rooms.find(r => r.roomID == item.roomID);

            // ?????? room ?????? ??????
            if (room) {
              item.newWin = room.newWin;
              item.winObj = room.winObj;
              item.winName = room.winName;
            }
          });
        }*/

        if (action.payload.rooms.length > 0)
          draft.rooms = action.payload.rooms.filter(
            room => room.lastMessageDate,
          );
      });
    },
    [UPDATE_ROOMS_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (draft.rooms.length > 0) {
          // ?????? ????????? ?????? action??? ?????? ????????? ?????? ???????????? ?????? update???????????? ??????
          action.payload.rooms.forEach(item => {
            const idx = draft.rooms.findIndex(r => r.roomID == item.roomID);
            if (idx > -1) {
              draft.rooms[idx] = item;
            }
          });
        }
      });
    },
    [SET_SEARCH_KEYWORD_ROOM]: (state, action) => {
      return produce(state, draft => {
        if (action.payload) {
          draft.currentRoom.searchKeyword = action.payload.keyword;
        }
      });
    },
    [GET_ROOM_INFO_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        let newRoom = action.payload.room;

        const roomIdx = draft.rooms.findIndex(
          r => r.roomID == action.payload.room.roomID,
        );

        const room = roomIdx > -1 ? draft.rooms[roomIdx] : null;

        if (room) {
          // update ??????????????? ?????? - room member ??????????????? update date ??????
          if (room.updateDate != newRoom.updateDate) {
            /*newRoom.newWin = room.newWin;
            newRoom.winObj = room.winObj;
            newRoom.winName = room.winName;*/

            draft.rooms[roomIdx] = newRoom;

            // ????????? ?????? ????????????
            draft.currentRoom = newRoom;
          } else {
            draft.currentRoom = room;
          }
        } else {
          draft.rooms.push(newRoom);
          draft.currentRoom = newRoom;
        }

        draft.messages = action.payload.messages;

        // current room ?????? setting ??? Object type?????? ??????
        try {
          draft.currentRoom.setting = JSON.parse(newRoom.setting);
        } catch (e) {
          draft.currentRoom.setting = null;
        }
      });
    },
    [ROOM_MESSAGE_ADD]: (state, action) => {
      return produce(state, draft => {
        const room = draft.rooms.find(r => r.roomID == action.payload.roomID);
        // room ?????? ??????
        const lastMessageData = {
          Message: action.payload.context,
          File: action.payload.fileInfos,
          sender: action.payload.sender || '',
          companyCode: action.payload.senderInfo?.companyCode || '',
          deptCode: action.payload.senderInfo?.deptCode || '',
        };

        if (room) {
          room.lastMessage = lastMessageData;
          room.lastMessageDate = action.payload.sendDate;

          draft.rooms.splice(
            draft.rooms.findIndex(r => r.roomID == action.payload.roomID),
            1,
          );
          draft.rooms.unshift(room);

          if (draft.currentRoom && room.roomID == draft.currentRoom.roomID) {
            // ?????? ???????????? ??????????????? ?????? ?????? ??? ??????
            // ????????? ????????? ?????? ????????? ??????????????????.
            const idx = draft.messages.findIndex(
              m => m.messageID == action.payload.messageID,
            );

            const lastMessageID =
              draft.messages.length > 0
                ? draft.messages[draft.messages.length - 1].messageID
                : 0;

            if (idx < 0) {
              // push ????????? sendTime??? ???????????? YYYYMMDDHHmm ??????????????? ???????????? update
              const size = draft.messages.length;
              const checkTimeStamp = Math.floor(
                action.payload.sendDate / 60000,
              );

              for (let i = size - 1; i >= 0; i--) {
                const compMessage = draft.messages[i];
                const compTimeStamp = Math.floor(compMessage.sendDate / 60000);
                // ????????? ?????? ??????????????? update ???????????? ??????
                if (compTimeStamp == checkTimeStamp) {
                  // ?????? state??? ????????? ?????? props??? ????????? ???????????? ??????
                  compMessage.updateIndex = action.payload.messageID;
                } else {
                  break;
                }
              }

              // ????????? ?????? ????????? ??????
              let notReadArr = draft.currentRoom.notReadArr;
              if (notReadArr) {
                const preReadCnt = notReadArr.reduce((acc, current) => {
                  if (acc[current]) {
                    acc[current] = acc[current] + 1;
                  } else {
                    acc[current] = 1;
                  }
                  return acc;
                }, {});

                let filterArray = [];

                Object.keys(preReadCnt).forEach(key => {
                  const message = draft.messages.find(
                    item => item.messageID == key,
                  );

                  if (message) {
                    message.unreadCnt = message.unreadCnt - preReadCnt[key];
                  } else {
                    for (let i = 0; i < preReadCnt[key]; i++) {
                      filterArray.push(key);
                    }
                  }
                });

                draft.currentRoom.notReadArr = filterArray;
              }

              if (action.payload.messageID > lastMessageID) {
                draft.messages.push(action.payload);
              } else {
                const afterMessageIdx = draft.messages.findIndex(
                  item => item > action.payload.messageID,
                );

                let beforeMessages = [];
                let afterMessages = [];
                draft.messages.forEach((item, i) => {
                  if (i < afterMessageIdx) {
                    beforeMessages.push(item);
                  } else {
                    afterMessages.push(item);
                  }
                });
                draft.messages = [
                  ...beforeMessages,
                  action.payload,
                  ...afterMessages,
                ];
              }
            }

            // ?????????????????? ??????????????? --- ????????? focus??? ???????????? unreadCnt??? ??????????????? ??????
            if (action.payload.isMine != 'Y') {
              room.unreadCnt = room.unreadCnt + 1;
            }

            action.payload.isCurrentRoom = true;
          } else {
            if (action.payload.isMine != 'Y')
              room.unreadCnt = room.unreadCnt + 1;
          }
        } else {
          // room ????????? ?????????????????? room ??????
          draft.rooms.unshift({
            roomID: action.payload.roomID,
            updateDate: null,
            lastMessage: lastMessageData,
            lastMessageDate: action.payload.sendDate,
            unreadCnt: action.payload.isMine != 'Y' ? 1 : 0,
          });
        }
      });
    },
    [CHANGE_OPEN_ROOM]: (state, action) => {
      return produce(state, draft => {
        if (!action.payload.newRoom) {
          const room = draft.rooms.find(r => r.roomID == action.payload.roomID);
          let changeRoom = null;

          if (room) {
            // room ???????????? ??? ???????????? ??????
            /*if (room.newWin && room.winObj) {
              if (room.winObj.closed) {
                // ???????????? ??????????????? ?????? ??????????????????
                room.newWin = false;
                room.winObj = null;
                room.winName = '';
              }
            }*/

            changeRoom = room;
          } else {
            changeRoom = {
              roomID: action.payload.roomID,
            };
          }

          if (draft.viewType != 'S') {
            if (
              !draft.currentRoom ||
              draft.currentRoom.roomID != changeRoom.roomID
            ) {
              // MultiView????????? CurrentRoom ?????? ??????
              draft.selectId = action.payload.roomID;
              draft.currentRoom = changeRoom;
              draft.messages = [];
            }

            // currentRoom ??? ?????? setting ????????? object??? ??????????????? ??????
            try {
              draft.currentRoom.setting = JSON.parse(changeRoom.setting);
            } catch (e) {
              draft.currentRoom.setting = null;
            }
          }

          draft.makeInfo = null;
        } else {
          draft.currentRoom = {
            newRoom: action.payload.newRoom,
          };

          draft.makeInfo = action.payload.makeInfo;

          draft.selectId = -1;
          draft.messages = [];
        }

        // mjseo
        if (action.payload.newChannel) {
          // ?????? ??? ?????????
          draft.currentRoom = null;
          draft.makeInfo = null;
          draft.messages = [];
          draft.selectId = -1;
        }
        //

        draft.makeRoom = false;
      });
    },
    [CHANGE_VIEW_TYPE]: (state, action) => {
      return produce(state, draft => {
        draft.viewType = action.payload ? 'M' : 'S';

        // single view??? ??????????????? ????????? ???????????? currentRoom?????? ??????
        if (!action.payload) {
          draft.selectId = -1;
          draft.currentRoom = null;
          draft.messages = [];
          draft.makeRoom = false;
          draft.makeInfo = null;
        }
      });
    },
    [MAKE_ROOM_VIEW]: (state, action) => ({
      ...state,
      makeRoom: true,
      makeInfo: action.payload,
    }),
    [RESET_UNREAD_COUNT]: (state, action) => {
      return produce(state, draft => {
        const room = draft.rooms.find(r => r.roomID == action.payload);
        if (room) room.unreadCnt = 0;
      });
    },
    [REMATCHING_MEMBER_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        // room??? member?????? update
        const room = draft.rooms.find(r => r.roomID == action.payload.roomID);
        room.members = action.payload.members;
      });
    },
    [INVITE_MEMBER_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        // room??? member?????? update
        const room = draft.rooms.find(r => r.roomID == action.payload.roomID);
        action.payload.members.forEach(i => {
          const idx = room.members.findIndex(m => m.id == i.id);
          if (idx == -1) room.members.push(i);
        });
      });
    },
    [LEAVE_ROOM_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        // room??? member?????? update
        draft.rooms.splice(
          draft.rooms.findIndex(r => r.roomID == action.payload.roomID),
          1,
        );

        if (
          draft.currentRoom &&
          draft.currentRoom.roomID == action.payload.roomID
        ) {
          draft.currentRoom = null;
          draft.selectId = -1;
        }
      });
    },
    [ROOM_INVITE_MESSAGE_ADD]: (state, action) => {
      return produce(state, draft => {
        const room = draft.rooms.find(r => r.roomID == action.payload.roomID);

        if (room) {
          // member ??????
          action.payload.inviteMember.forEach(i => {
            const idx = room.members.findIndex(m => m.id == i.id);
            if (idx == -1) room.members.push(i);
          });

          // ???????????? ???????????? ?????? ????????? ??????
          if (
            draft.currentRoom &&
            action.payload.roomID == draft.currentRoom.roomID
          ) {
            // ?????? ???????????? ??????????????? ??????
            const idx = draft.messages.findIndex(
              m => m.messageID == action.payload.messageID,
            );

            // ????????? ???????????????
            const lastMessageID =
              draft.messages.length > 0
                ? draft.messages[draft.messages.length - 1].messageID
                : 0;

            if (idx < 0 && action.payload.messageID > lastMessageID)
              draft.messages.push(action.payload);

            const members = room.members;
            draft.currentRoom.members = members;
          }
        } else {
          // room ????????? ?????????????????? room ??????
          draft.rooms.push({
            roomID: action.payload.roomID,
            updateDate: null,
            unreadCnt: 0,
          });
        }
      });
    },
    [ROOM_LEAVE_MESSAGE_ADD]: (state, action) => {
      return produce(state, draft => {
        const room = draft.rooms.find(r => r.roomID == action.payload.roomID);

        if (room) {
          // ????????? ??????
          room.members.splice(
            room.members.findIndex(m => m.id == action.payload.leaveMember),
            1,
          );

          // ???????????? ???????????? ????????? ?????? ??????
          if (
            draft.currentRoom &&
            action.payload.roomID == draft.currentRoom.roomID
          ) {
            // ?????? ???????????? ??????????????? ??????
            const idx = draft.messages.findIndex(
              m => m.messageID == action.payload.messageID,
            );

            // ????????? ???????????????
            const lastMessageID =
              draft.messages.length > 0
                ? draft.messages[draft.messages.length - 1].messageID
                : 0;

            if (idx < 0 && action.payload.messageID > lastMessageID)
              draft.messages.push(action.payload);

            const members = room.members;
            draft.currentRoom.members = members;
          }
        } else {
          // room ????????? ?????????????????? room ??????
          draft.rooms.unshift({
            roomID: action.payload.roomID,
            updateDate: null,
            unreadCnt: 0,
          });
        }
      });
    },
    [MESSAGE_READ_COUNT_CHANGED]: (state, action) => {
      return produce(state, draft => {
        if (
          draft.currentRoom &&
          draft.currentRoom.roomID == action.payload.roomID
        ) {
          action.payload.messageIDs.forEach(id => {
            const message = draft.messages.find(m => m.messageID == id);
            if (message) {
              message.unreadCnt = message.unreadCnt - 1;
            } else {
              if (!draft.currentRoom.notReadArr)
                draft.currentRoom.notReadArr = [];
              draft.currentRoom.notReadArr = [
                ...draft.currentRoom.notReadArr,
                id,
              ];
            }
          });
        }
      });
    },
    [SET_UNREADCNT_SYNC_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (
          draft.currentRoom &&
          draft.currentRoom.roomID == action.payload.roomID
        ) {
          action.payload.unreadCnts.forEach(item => {
            const messageIds = item.messageId.split(',');
            messageIds.forEach(id => {
              const message = draft.messages.find(m => id == m.messageID);
              if (message) {
                message.unreadCnt = item.unreadCnt;
              }
            });
          });
        }
      });
    },
    [SET_MESSAGE_LINKINFO]: (state, action) => {
      return produce(state, draft => {
        if (
          draft.currentRoom &&
          draft.currentRoom.roomID == action.payload.roomId
        ) {
          const message = draft.messages.find(
            m => m.messageID == action.payload.messageId,
          );
          if (message) {
            message.linkInfo = action.payload.linkInfo;
          }
        }
      });
    },
    [SET_INIT_CURRENTROOM]: (state, action) => ({
      ...state,
      selectId: initialState.selectId,
      currentRoom: initialState.currentRoom,
    }),
    [MODIFY_ROOMNAME_LIST]: (state, action) => {
      return produce(state, draft => {
        const room = draft.rooms.find(
          r => r.roomID == parseInt(action.payload.roomId),
        );

        if (room) room.roomName = action.payload.roomName;
      });
    },
    [MODIFY_ROOMNAME_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        const roomId = parseInt(action.payload.result.roomId);
        const room = draft.rooms.find(r => r.roomID == roomId);

        if (room) {
          room.roomName = action.payload.result.roomName;

          if (draft.currentRoom && draft.currentRoom.roomID == roomId) {
            draft.currentRoom.roomName = action.payload.result.roomName;
          }
        }
      });
    },
    [SET_MESSAGES]: (state, action) => {
      return produce(state, draft => {
        const actionMessages = action.payload.messages;
        const messages = [...draft.messages, ...actionMessages].sort(
          (a, b) => a.messageID - b.messageID,
        );
        draft.messages = _.uniqBy(messages, 'messageID');
      });
    },
    [SET_MESSAGES_SYNC]: (state, action) => {
      return produce(state, draft => {
        draft.messages = action.payload;
      });
    },
    [INIT_MESSAGES]: (state, action) => {
      return produce(state, draft => {
        const startIdx =
          draft.messages.length - 50 >= 0 ? draft.messages.length - 50 : 0;
        // ?????? 100?????? ???????????? ??????
        draft.messages = draft.messages.splice(startIdx, 50);
      });
    },
    [ROOM_LEAVE_OTHER_DEVICE]: (state, action) => {
      return produce(state, draft => {
        // room??? member?????? update
        draft.rooms.splice(
          draft.rooms.findIndex(r => r.roomID == action.payload.roomID),
          1,
        );

        if (
          draft.currentRoom &&
          draft.currentRoom.roomID == action.payload.roomID
        ) {
          draft.currentRoom = null;
          draft.selectId = -1;
        }
      });
    },
    [ROOM_LEAVE_TARGET_USER]: (state, action) => {
      return produce(state, draft => {
        // room??? member?????? update
        const room = draft.rooms.find(r => r.roomID == action.payload.roomID);
        if (room) {
          room.realMemberCnt = 1;

          if (
            draft.currentRoom &&
            action.payload.roomID == draft.currentRoom.roomID
          ) {
            draft.currentRoom.realMemberCnt = 1;
          }
        }
      });
    },
    [MESSAGE_READ_OTHER_DEVICE]: (state, action) => {
      return produce(state, draft => {
        // room??? member?????? update
        const room = draft.rooms.find(r => r.roomID == action.payload.roomID);
        if (room) {
          room.unreadCnt = 0;

          if (
            draft.currentRoom &&
            action.payload.roomID == draft.currentRoom.roomID
          ) {
            draft.currentRoom.unreadCnt = 0;
          }
        }
      });
    },
    [READ_MESSAGE]: (state, action) => {
      return produce(state, draft => {
        if (!action.payload.messageID) {
          action.payload.messageID =
            draft.messages.length > 0
              ? draft.messages[draft.messages.length - 1].messageID
              : 0;
        }
      });
    },
    [CLOSE_ROOM]: (state, action) => {
      return produce(state, draft => {
        //if (draft.currentRoom && action.payload == draft.currentRoom.roomID) {
        draft.selectId = -1;
        draft.currentRoom = null;
        draft.messages = [];
        draft.makeRoom = false;
        draft.makeInfo = null;
        //}
      });
    },
    [MODIFY_ROOMSETTING_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.roomID) {
          const room = draft.rooms.find(
            item => item.roomID === action.payload.roomID,
          );
          room.setting = action.payload.setting;

          if (
            !!draft.currentRoom &&
            draft.currentRoom.roomID === action.payload.roomID
          ) {
            // currentRoom ??? ?????? setting ????????? object??? ??????????????? ??????
            try {
              draft.currentRoom.setting = JSON.parse(action.payload.setting);
            } catch (e) {
              draft.currentRoom.setting = null;
            }
          }
        }
      });
    },
    [ROOM_MESSAGE_DELETE]: (state, action) => {
      /**
       * 2022.02.04 ????????? ????????????
       */
      return produce(state, draft => {
        const { payload } = action;
        console.log('ROOM_MESSAGE_DELETE', payload);
        if (!payload || Array.isArray(payload?.deletedMessageIds) === false) {
          return;
        }
        const room = draft.rooms.find(
          r => `${r.roomID}` === `${payload.roomID}`,
        );
        /* Redux store?????? message ?????? */
        payload.deletedMessageIds.forEach(mid => {
          const idx = draft.messages.findIndex(msg => msg.messageID === mid);
          if (idx !== -1) {
            draft.messages.splice(idx, 1);
          }
        });

        /* Update unreadCnt */
        // if (Number(room?.unreadCnt) > 0) {
        //   room.unreadCnt -= 1;
        // }
        /* */

        /* lastMessage ?????? */
        if (payload.lastMessage) {
          console.log('Update LastMessage  ', payload.lastMessage);
          if (!room) {
            return;
          }
          const lastMessage = {
            Message: payload.lastMessage.context,
            File: payload.lastMessage.fileInfos,
          };
          if (draft.currentRoom && room.roomID === draft.currentRoom.roomID) {
            draft.currentRoom.lastMessage = lastMessage;
          }
          room.lastMessage = lastMessage;
        }
        /* */
      });
    },
    [RECEIVE_ROOMSETTING]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.roomID) {
          const getSetting = item => {
            if (!item) {
              return {};
            } else {
              if (typeof item === 'object') {
                return item;
              } else {
                return JSON.parse(item);
              }
            }
          };
          const roomID = Number(action.payload.roomID);
          const room = draft.rooms.find(item => item.roomID === roomID);
          let originSetting = getSetting(room.setting);
          let setting = getSetting(action.payload.setting);

          for (const [_, key] of Object.keys(setting).entries()) {
            originSetting[key] = setting[key];
          }
          room.setting = originSetting;

          if (!!draft.currentRoom && draft.currentRoom.roomID === roomID) {
            try {
              for (const [_, key] of Object.keys(setting).entries()) {
                draft.currentRoom.setting[key] = setting[key];
              }
            } catch (e) {
              draft.currentRoom.setting = null;
            }
          }
        }
      });
    },
  },
  initialState,
);

export default room;
