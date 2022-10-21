import { call, put } from 'redux-saga/effects';
import { getDocList, getDocItem, updateDocument } from '@/lib/api/document';
import { getRoomInfo } from '@/modules/room';
import { getChannelInfo } from '@/modules/channel';

export function createGetDocumentsSaga(type) {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;
  return function*(action) {
    if (!action.payload) {
      return;
    }
    try {
      const response = yield call(getDocList, action.payload);
      const isSuccess = response.data.status === 'SUCCESS';
      if (isSuccess) {
        console.log('type : ', SUCCESS);
        yield put({
          type: SUCCESS,
          payload: response.data,
        });
      }
    } catch (err) {
      yield put({
        type: FAILURE,
        payload: action.payload,
        error: true,
        errMessage: err,
      });
    }
  };
}

export function createSetCurrnetDocumentSaga(type) {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;
  return function*(action) {
    if (!action.payload) {
      return;
    }
    try {
      const response = yield call(getDocItem, action.payload);
      const isSuccess = response.data.status === 'SUCCESS';
      if (isSuccess) {
        const { result } = response?.data;
        const isChannel = result.roomType === 'C';
        let room;
        if (isChannel) {
          const channel = yield call(getChannelInfo, {
            roomId: result.roomID,
          });
          room = channel;
        } else {
          const chatRoom = yield call(getRoomInfo, {
            roomID: result.roomID,
          });
          room = chatRoom;
        }
        yield put({
          type: SUCCESS,
          payload: { ...result, room: room },
        });
      }
    } catch (err) {
      yield put({
        type: FAILURE,
        payload: action.payload,
        error: true,
        errMessage: err,
      });
    }
  };
}

export function createModifyDocumentSettingSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const response = yield call(updateDocument, action.payload);

        if (response?.data?.status === 'SUCCESS') {
          yield put({
            type: 'document/MODIFY_DOCUMENTSETTING_SUCCESS',
            payload: response.data,
          });
        }
      } catch (e) {
        console.dir(e);
        yield put({
          type: 'document/MODIFY_DOCUMENTSETTING_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}
