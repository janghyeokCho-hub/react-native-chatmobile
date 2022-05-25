import { call, put, fork } from 'redux-saga/effects';
import { startLoading, finishLoading } from '@/modules/loading';
import * as channelApi from '@API/channel';
import { modifyRoomSetting } from '@API/room';
import * as messageApi from '@API/message';
import {
  channelMessageAdd,
  newChannel,
  changeOpenChannel,
  resetUnreadCount,
  readMessageFocus,
} from '@/modules/channel';
import { changeOpenRoom } from '@/modules/room';
import { removeChannelTempMessage, setMoveView } from '@/modules/message';
import { setCurrentChannel } from '@/modules/app';
import { exceptionHandler } from './createRequestSaga';

export function createGetChannelsSaga() {
  return function*(action) {
    yield put(startLoading('channel/GET_CHANNELS'));
    if (action.payload) {
      try {
        let data = {};

        const response = yield call(channelApi.getChannelList, action.payload);
        data = response.data;
        if (data.status == 'SUCCESS') {
          yield put({
            type: 'channel/GET_CHANNELS_SUCCESS',
            payload: data,
          });
        }
      } catch (e) {
        console.log(e);
        yield put({
          type: 'channel/GET_CHANNELS_FAIL',
          payload: e,
          error: true,
        });
      }
    }
    yield put(finishLoading('channel/GET_CHANNELS'));
  };
}

export function createUpdateChannelsSaga() {
  return function*(action) {
    yield put(startLoading('channel/UPDATE_CHANNELS'));

    if (action.payload) {
      try {
        const response = yield call(channelApi.getUChannelList, action.payload);

        yield put({
          type: 'channel/UPDATE_CHANNELS_SUCCESS',
          payload: response.data,
        });
      } catch (e) {
        yield put({
          type: 'channel/UPDATE_CHANNELS_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
    yield put(finishLoading('channel/UPDATE_CHANNELS'));
  };
}

export function createGetChannelCategoriesSaga() {
  return function*(action) {
    yield put(startLoading('channel/GET_CHANNEL_CATEGORIES'));
    try {
      let data = {};
      let response = {};

      if(action.payload){
        response = yield call(channelApi.getChannelCategoryListForSaaS,{companyCode:action.payload.companyCode});
      }else{
        response = yield call(channelApi.getChannelCategoryList);
      }
      
      data = response.data;

      yield put({
        type: 'channel/GET_CHANNEL_CATEGORIES_SUCCESS',
        payload: data,
      });
    } catch (e) {
      console.log(e);
      yield put({
        type: 'channel/GET_CHANNEL_CATEGORIES_FAIL',
        payload: e,
        error: true,
      });
    }
    yield put(finishLoading('channel/GET_CHANNEL_CATEGORIES'));
  };
}

export function createReceiveMessageSaga() {
  // roomID
  return function*(action) {
    if (action.payload) {
      try {
        // 자기자신이 보낸경우 tempMessage에 있는 데이터 먼저 삭제
        if (action.payload.isMine == 'Y') {
          yield put(removeChannelTempMessage(action.payload.tempId));
        }
        // TODO: Current Room 에 발생한 메시지의 경우 newMark 발생하지 않도록 처리

        yield put(channelMessageAdd(action.payload));

        if (action.payload.isCurrentChannel && action.payload.isMine !== 'Y') {
          // 자기가 보낸 메시지가 아닌경우 창의 focus 를 체크하여 읽음처리
          /*
            const response = yield call(messageApi.readChannelMessage, {
              roomID: action.payload.roomID,
              messageID: action.payload.messageID,
            });
            if (response.data.status == 'SUCCESS') {
              if (response.data.result) {
                // 사용 안 함.
                yield put({
                  type: MESSAGE_READ_COUNT_CHANGED,
                  payload: response.data.result,
                });
              }
            }
            */
          yield put(readMessageFocus(action.payload));
        }
      } catch (e) {
        yield put({
          type: 'channel/RECEIVE_MESSAGE_FAILURE',
          payload: action.payload,
          error: true,
        });
      }
    }
  };
}

export function createOpenChannelSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        // 자기자신이 보낸경우 tempMessage에 있는 데이터 먼저 삭제
        if (action.payload.roomId) {
          yield put(setCurrentChannel(action.payload.roomId));
          // mjseo
          yield put(newChannel(action.payload));
        }
        // move view 초기화
        yield put(
          setMoveView({
            roomID: -1,
            moveId: -1,
            visible: false,
          }),
        );
        yield put(changeOpenChannel(action.payload));

        // mjseo
        yield put(changeOpenRoom({ newChannel: true }));
      } catch (e) {
        console.log(e);
      }
    }
  };
}

export function createGetChannelInfoSaga() {
  return function*(action) {
    yield put(startLoading('channel/GET_CHANNEL_INFO'));
    try {
      let data = {};

      const response = yield call(channelApi.getChannelInfo, action.payload);
      data = response.data;

      let type = 'channel/GET_CHANNEL_INFO_SUCCESS';
      if (data.status != 'SUCCESS') {
        type = 'channel/GET_CHANNEL_INFO_FAILURE';
      }

      yield put({
        type,
        payload: data,
      });
      yield put(finishLoading('channel/GET_CHANNEL_INFO'));
    } catch (e) {
      console.log(e);
      yield put({
        type: 'channel/GET_CHANNEL_INFO_FAILURE',
        payload: e,
        error: true,
      });
      yield put(finishLoading('channel/GET_CHANNEL_INFO'));
    }
  };
}

export function createReadMessageSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        // READ_MESSAGE_SUCCESS 에서 화면단 COUNT 감소 처리
        const response = yield call(messageApi.readChannelMessage, {
          roomID: action.payload.roomID,
          messageID: action.payload.messageID,
        });

        if (response.data.status == 'SUCCESS') {
          if (response.data.result) {
            yield put({
              type: 'channel/MESSAGE_READ_COUNT_CHANGED',
              payload: response.data.result,
            });
          }

          // 새창인경우 본창 전파
          if (
            window.opener &&
            typeof window.opener.parent.newWinReadMessageCallback == 'function'
          ) {
            window.opener.parent.newWinReadMessageCallback(
              response.action.payload,
            );
          }
          yield put(resetUnreadCount(action.payload.roomID));
        }
      } catch (e) {
        console.log(e);
      }
    }
  };
}

export function createLeaveChannelsSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const response = yield call(channelApi.leaveChannel, action.payload);
        yield put({
          type: 'channel/LEAVE_CHANNEL_SUCCESS',
          payload: {
            ...response.data,
            leave: action.payload.leave ? action.payload.leave : '',
          },
        });
      } catch (e) {
        console.log(e);
        yield put({
          type: 'channel/LEAVE_CHANNEL_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export function createInviteMemberSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        let targetArr = [];

        action.payload.members.forEach(item => {
          targetArr.push({
            targetCode: item.id,
            targetType: 'UR',
          });
        });

        const data = {
          roomId: action.payload.roomId,
          members: action.payload.members.map(member => member.id),
          targetArr,
        };

        const response = yield call(channelApi.inviteMember, data);
        yield put({
          type: 'channel/INVITE_MEMBER_SUCCESS',
          payload: action.payload,
        });
      } catch (e) {
        console.log(e);
        yield put({
          type: 'channel/INVITE_MEMBER_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export function createModifyChannelInfoSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        console.log('createModifyChannelInfoSaga => ', action.payload);
        const response = yield call(
          channelApi.modifyChannelInfo,
          action.payload,
        );
        console.log('createModifyChannelInfoSaga => ', response);
        yield put({
          type: 'channel/MODIFY_CHANNELINFO_SUCCESS',
          payload: {...response.data,iconPath:action.payload.iconPath},
        });
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'channel/MODIFY_CHANNELINFO_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export function createUploadChannelIconSaga() {
  return function*(action) {
    if (action.payload) {
      const roomId = action.payload.get('roomId');
      try {
        const response = yield call(
          channelApi.uploadChannelIcon,
          action.payload,
        );
        yield put({
          type: 'channel/UPLOAD_CHANNELICON_SUCCESS',
          payload: {
            ...response.data,
            roomId,
          },
        });
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'channel/UPLOAD_CHANNELICON_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export function createModifyChannelMemberAuthSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const response = yield call(
          channelApi.modifyMemberAuth,
          action.payload,
        );
        yield put({
          type: 'channel/MODIFY_CHANNEL_MEMBER_AUTH_SUCCESS',
          payload: {
            ...response.data,
            ...action.payload,
          },
        });
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'channel/MODIFY_CHANNEL_MEMBER_AUTH_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export function createGetChannelNoticeSaga() {
  return function*(action) {
    yield put(startLoading('channel/GET_CHANNEL_NOTICE'));
    try {
      const response = yield call(channelApi.getChannelNotice, action.payload);
      const { data } = response;
      let type = 'channel/GET_CHANNEL_NOTICE_SUCCESS';
      if (data.status != 'SUCCESS' || !data.notice) {
        type = 'channel/GET_CHANNEL_NOTICE_FAILURE';
      }
      yield put({
        type,
        payload: data,
      });
      yield put(finishLoading('channel/GET_CHANNEL_NOTICE'));
    } catch (e) {
      yield fork(exceptionHandler, { e: e, redirectError: false });
      yield put({
        type: 'channel/GET_CHANNEL_NOTICE_FAILURE',
        payload: e,
        error: true,
      });
      yield put(finishLoading('channel/GET_CHANNEL_NOTICE'));
    }
  };
}

export function createRemoveChannelNoticeSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const response = yield call(messageApi.removeNotice, action.payload);
        let type = 'channel/REMOVE_CHANNEL_NOTICE_SUCCESS';
        if (response.data.status != 'SUCCESS') {
          type = 'channel/REMOVE_CHANNEL_NOTICE_FAILURE';
        }
        yield put({
          type,
          payload: {
            ...response.data,
            ...action.payload,
          },
        });
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'channel/REMOVE_CHANNEL_NOTICE_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export const createModifyChannelSettingSaga = () => {
  return function*(action) {
    if (action.payload) {
      yield put(startLoading('room/MODIFY_ROOMSETTING'));
      try {
        const response = yield call(modifyRoomSetting, {
          roomID: action.payload.roomID,
          key: action.payload.key,
          value: action.payload.value,
        });

        if (response.data.status == 'SUCCESS') {
          yield put({
            type: 'channel/MODIFY_CHANNELSETTING_SUCCESS',
            payload: {
              roomID: action.payload.roomID,
              setting: action.payload.setting,
            },
          });
        }
      } catch (e) {
        console.dir(e);
        yield call(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'channel/MODIFY_CHANNELSETTING_FAILURE',
          payload: e,
          error: true,
        });
      }

      yield put(finishLoading('room/MODIFY_ROOMSETTING'));
    }
  };
};
