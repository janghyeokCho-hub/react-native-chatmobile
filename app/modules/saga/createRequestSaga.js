import { call, put, fork } from 'redux-saga/effects';
import { startLoading, finishLoading } from '@/modules/loading';
import { Alert } from 'react-native';
import { restartApp } from '@/lib/device/common';
import { getDic } from '@/config';

export const createRequestActionTypes = type => {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;
  return [type, SUCCESS, FAILURE];
};

export default function createRequestSaga(type, request, redirectError) {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;

  return function*(action) {
    yield put(startLoading(type));
    try {
      const response = yield call(request, action.payload);
      yield put({
        type: SUCCESS,
        payload: response.data,
      });
    } catch (e) {
      yield fork(exceptionHandler, { e: e, redirectError: redirectError });

      yield put({
        type: FAILURE,
        payload: e,
        error: true,
      });
    }
    yield put(finishLoading(type));
  };
}

export const exceptionHandler = function*({ e, redirectError }) {
  if (redirectError) {
    if (e && e.message && e.message.indexOf('Network') > -1) {
      Alert.alert(
        null,
        getDic('Msg_NetworkConnect'),
        [
          { text: getDic('Cancel'), onPress: () => {} },
          {
            text: getDic('Refresh'),
            onPress: () => {
              restartApp();
            },
          },
        ],
        { cancelable: true },
      );
    } else {
      Alert.alert(
        null,
        getDic('Msg_Error') +
          `\r\nError Code : ${e && e.message ? e.message : 'empty message'}`,
        [
          { text: getDic('Cancel') },
          {
            text: getDic('Refresh'),
            onPress: () => {
              restartApp();
            },
          },
        ],
        { cancelable: true },
      );
    }
  }
  if (__DEV__) console.log(e);
};
