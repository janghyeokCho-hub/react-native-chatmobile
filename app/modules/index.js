import { combineReducers } from 'redux';
import { all } from 'redux-saga/effects';
import app from '@/modules/app';
import login, { loginSaga } from '@/modules/login';
import loading from '@/modules/loading';
import AsyncStorage from '@react-native-community/async-storage';
import contact, { contactSaga } from '@/modules/contact';
import room, { roomSaga } from '@/modules/room';
import channel, { channelSaga } from '@/modules/channel';
import message, { messageSaga } from '@/modules/message';
import presence, { presenceSaga } from '@/modules/presence';
import absence, { absenceSaga } from '@/modules/absence';
import modal from '@/modules/modal';

const appReducer = combineReducers({
  app,
  login,
  loading,
  contact,
  room,
  channel,
  message,
  presence,
  modal,
  absence,
});

const rootReducer = (state, action) => {
  if (action.type === 'login/LOGOUT') {
    AsyncStorage.removeItem('covi_user_access_token');
    AsyncStorage.removeItem('covi_user_access_id');
    state = undefined;
  }
  return appReducer(state, action);
};

export function* rootSaga() {
  // all 함수는 여러 사가를 합쳐 주는 역할을 함.
  yield all([
    loginSaga(),
    contactSaga(),
    roomSaga(),
    channelSaga(),
    messageSaga(),
    presenceSaga(),
    absenceSaga(),
  ]);
}

export default rootReducer;
