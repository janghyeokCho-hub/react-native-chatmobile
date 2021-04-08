import { call, put, fork } from 'redux-saga/effects';
import * as presenceApi from '@API/presence';
import * as dbAction from '@/lib/appData/action';
import { exceptionHandler } from './createRequestSaga';

export function createSetTargetUserSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const response = yield call(
          presenceApi.setPresenceTargetUser,
          action.payload,
        );

        if (response.data.status == 'SUCCESS') {
          yield put({
            type: 'presence/SET_TARGETUSER_SUCCESS',
            payload: response.data.result,
          });

          if (response.data.result)
            yield fork(dbAction.updatePresence, response.data.result);
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: false });
        yield put({
          type: 'presence/SET_TARGETUSER_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}
