import { call, put, fork } from 'redux-saga/effects';
import * as messageApi from '@API/message';
import * as roomApi from '@API/room';
import {
  removeTempMessage,
  setMoveView,
  sendMessage,
  setTempMessage,
} from '@/modules/message';
import { setCurrentRoom } from '@/modules/app';
import { startLoading, finishLoading } from '@/modules/loading';
import { changeOpenChannel } from '@/modules/channel'; // 채널
import { addFixedUsers } from '@/modules/presence';
import {
  readMessage,
  changeOpenRoom,
  roomMessageAdd,
  readMessageFocus,
  resetUnreadCount,
  setUnreadCountForSync,
} from '@/modules/room';
import * as dbAction from '@/lib/appData/action';
import { exceptionHandler } from './createRequestSaga';

export function createGetRoomsSaga() {
  return function*(action) {
    yield put(startLoading('room/GET_ROOMS'));
    try {
      let data = {};

      // 채팅방 정보 불러오기
      const rooms = yield call(dbAction.getRooms);

      yield put({
        type: 'room/GET_ROOMS_SUCCESS',
        payload: data,
      });
    } catch (e) {
      yield fork(exceptionHandler, { e: e, redirectError: false });
      yield put({
        type: 'room/GET_ROOMS_FAILURE',
        payload: e,
        error: true,
      });
    }
    yield put(finishLoading('room/GET_ROOMS'));
  };
}

export function createGetRoomInfoSaga() {
  return function*(action) {
    yield put(startLoading('room/GET_ROOM_INFO'));
    try {
      let data = yield call(dbAction.getRoomInfo, {
        roomId: action.payload.roomID,
      });

      yield put({
        type: 'room/GET_ROOM_INFO_SUCCESS',
        payload: data,
      });

      if (data.room.reserved && data.room.reserved != '') {
        const reserved = JSON.parse(data.room.reserved);

        if (reserved.failMsg) yield put(setTempMessage(reserved.failMsg));
      }

      if (data.messages.length > 0) {
        yield put(
          setUnreadCountForSync({
            roomId: action.payload.roomID,
            startId: data.messages[0].messageID,
            endId: data.messages[data.messages.length - 1].messageID,
            isNotice: data.room.roomType == 'A',
          }),
        );

        yield put(
          readMessage({
            roomID: action.payload.roomID,
            messageID: data.messages[data.messages.length - 1].messageID,
            isNotice: data.room.roomType == 'A',
          }),
        );
      }
    } catch (e) {
      yield fork(exceptionHandler, { e: e, redirectError: false });
      yield put({
        type: 'room/GET_ROOM_INFO_FAILURE',
        payload: e,
        error: true,
      });
    }
    yield put(finishLoading('room/GET_ROOM_INFO'));
  };
}

export function createOpenRoomSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        // 자기자신이 보낸경우 tempMessage에 있는 데이터 먼저 삭제
        if (action.payload.roomID) {
          yield put(setCurrentRoom(action.payload.roomID));
        }
        // move view 초기화
        yield put(setMoveView({ roomID: -1, moveId: -1, visible: false }));
        yield put(changeOpenRoom(action.payload));
        // mjseo
        yield put(changeOpenChannel({ newChatRoom: true }));
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
      }
    }
  };
}

export function createReceiveMessageSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        // 자기자신이 보낸경우 tempMessage에 있는 데이터 먼저 삭제
        if (action.payload.isMine == 'Y') {
          yield put(removeTempMessage(action.payload.tempId));
        }

        yield put(roomMessageAdd(action.payload));

        //window.document.hasFocus() &&
        if (action.payload.isCurrentRoom && action.payload.isMine != 'Y') {
          // 자기가 보낸 메시지가 아닌경우 창의 focus 를 체크하여 읽음처리
          /*
            const response = yield call(messageApi.readMessage, {
              roomID: action.payload.roomID,
            });
            if (response.data.status == 'SUCCESS') {
              if (response.data.result) {
                yield put({
                  type: MESSAGE_READ_COUNT_CHANGED,
                  payload: response.data.result,
                });
              }
            }
            */

          yield put(
            readMessageFocus({
              roomID: action.payload.roomID,
              messageID: action.payload.messageID,
              isNotice: action.payload.isNotice,
            }),
          );
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'room/RECEIVE_MESSAGE_FAILURE',
          payload: action.payload,
          error: true,
        });
      }
    }
  };
}

export function createCheckRoomMoveSaga() {
  return function*(action) {
    if (action.payload) {
      yield put(
        setMoveView({
          roomID: action.payload.roomId,
          moveId: action.payload.moveId,
          visible: true,
        }),
      );
    }
  };
}

export function createUpdateRoomsSaga() {
  return function*(action) {
    yield put(startLoading('room/UPDATE_ROOMS'));
    if (action.payload) {
      try {
        const response = yield call(roomApi.getRoomList, action.payload);

        if (response.data.status == 'SUCCESS') {
          yield put({
            type: 'room/UPDATE_ROOMS_SUCCESS',
            payload: response.data,
          });
          let members = [];
          response.data.rooms.forEach(item => {
            members = members.concat(
              item.members.map(member => {
                return { id: member.id, presence: member.presence };
              }),
            );
          });
          yield put(addFixedUsers(members));

          yield fork(dbAction.addRooms, response.data.rooms);
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'room/UPDATE_ROOMS_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
    yield put(finishLoading('room/UPDATE_ROOMS'));
  };
}

export function createLeaveRoomsSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const response = yield call(roomApi.leaveRoom, action.payload);

        if (response.data.status == 'SUCCESS') {
          yield put({
            type: 'room/LEAVE_ROOM_SUCCESS',
            payload: response.data,
          });

          yield fork(dbAction.delRoom, action.payload.roomID);
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'room/LEAVE_ROOM_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export function createModifyRoomNameSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const response = yield call(roomApi.modifyRoomName, action.payload);

        if (response.data.status == 'SUCCESS') {
          yield put({
            type: 'room/MODIFY_ROOMNAME_SUCCESS',
            payload: response.data,
          });

          yield fork(dbAction.modifyRoomName, {
            roomId: action.payload.roomId,
            roomName: action.payload.roomName,
          });
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'room/MODIFY_ROOMNAME_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export function createRematchingMemberSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const response = yield call(roomApi.rematchMember, {
          roomID: action.payload.roomID,
        });

        if (response.data.status == 'SUCCESS') {
          yield put({
            type: 'room/REMATCHING_MEMBER_SUCCESS',
            payload: response.data,
          });

          yield fork(dbAction.rematchMembers, {
            roomId: response.data.roomID,
            members: response.data.members,
          });

          yield put(sendMessage(action.payload));
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'room/REMATCHING_MEMBER_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export function createReadMessageSaga() {
  return function*(action) {
    if (action.payload.roomID && action.payload.messageID) {
      try {
        yield put(resetUnreadCount(action.payload.roomID));

        const response = yield call(messageApi.readMessage, {
          roomID: action.payload.roomID,
          messageID: action.payload.messageID,
          isNotice: action.payload.isNotice,
        });

        if (response.data.status == 'SUCCESS') {
          if (response.data.result) {
            // READ_MESSAGE_SUCCESS 에서 화면단 COUNT 감소 처리

            yield put({
              type: 'room/MESSAGE_READ_COUNT_CHANGED',
              payload: response.data.result,
            });

            yield fork(dbAction.setUnreadCnt, response.data.result);
          }
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
      }
    }
  };
}

export function createSetUnreadCountForSyncSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const unreadCnts = yield call(dbAction.syncUnreadCount, action.payload);

        if (unreadCnts.length > 0)
          yield put({
            type: 'room/SET_UNREADCNT_SYNC_SUCCESS',
            payload: { roomID: action.payload.roomId, unreadCnts },
          });

        if (action.payload.isSync) {
          yield put(
            readMessage({
              roomID: action.payload.roomId,
              isNotice: action.payload.isNotice,
            }),
          );
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'room/SET_UNREADCNT_SYNC_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export const createModifyRoomSettingSaga = () => {
  return function*(action) {
    if (action.payload) {
      yield put(startLoading('room/MODIFY_ROOMSETTING'));
      try {
        const response = yield call(roomApi.modifyRoomSetting, {
          roomID: action.payload.roomID,
          key: action.payload.key,
          value: action.payload.value,
        });

        if (response.data.status == 'SUCCESS') {
          yield put({
            type: 'room/MODIFY_ROOMSETTING_SUCCESS',
            payload: {
              roomID: action.payload.roomID,
              setting: action.payload.setting,
            },
          });

          // appData
          yield fork(dbAction.modifyRoomSetting, {
            roomID: action.payload.roomID,
            setting: action.payload.setting,
          });
        }
      } catch (e) {
        console.dir(e);
        yield call(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'room/MODIFY_ROOMSETTING_FAILURE',
          payload: e,
          error: true,
        });
      }

      yield put(finishLoading('room/MODIFY_ROOMSETTING'));
    }
  };
};
