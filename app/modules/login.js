import { createAction, handleActions } from 'redux-actions';
import { takeLatest } from 'redux-saga/effects';
import { createRequestActionTypes } from '@/modules/saga/createRequestSaga';

import * as loginApi from '@API/login';

import produce from 'immer';
import * as saga from '@/modules/saga/loginSaga';

const [
  LOGIN_REQUEST,
  LOGIN_REQUEST_SUCCESS,
  LOGIN_REQUEST_FAILURE,
] = createRequestActionTypes('login/REQUEST');

const [
  EXT_LOGIN_REQUEST,
  EXT_LOGIN_REQUEST_SUCCESS,
  EXT_LOGIN_REQUEST_FAILURE,
] = createRequestActionTypes('login/EXT_REQUEST');

const [
  LOGOUT_REQUEST,
  LOGOUT_REQUEST_SUCCESS,
  LOGOUT_REQUEST_FAILURE,
] = createRequestActionTypes('login/LOGOUT_REQUEST');

const LOGOUT = 'login/LOGOUT';

const LOGIN_INIT = 'login/INITIALIZE';
const LOGIN_TOKENAUTH = 'login/TOKENAUTH';
const SET_MYPRESENCE = 'login/SET_MYPRESENCE';

const CHANGE_MYPHOTOPATH = 'login/CHANGE_MYPHOTOPATH';
const CHANGE_MYINFO = 'login/CHANGE_MYINFO';
const AUTH_INIT = 'login/AUTH_INIT';
const AUTHCHECK_COMPLATE = 'login/AUTHCHECK_COMPLATE';

const SYNC = 'login/SYNC';

const [
  SYNC_TOKEN_REQUEST,
  SYNC_TOKEN_REQUEST_SUCCESS,
  SYNC_TOKEN_REQUEST_FAILURE,
] = createRequestActionTypes('login/SYNC_TOKEN_REQUEST');
const [
  SYNC_TOKEN_OFFLINE,
  SYNC_TOKEN_OFFLINE_SUCCESS,
  SYNC_TOKEN_OFFLINE_FAILURE,
] = createRequestActionTypes('login/SYNC_TOKEN_OFFLINE');

const CHANGE_SOCKETCONNECT = 'login/CHANGE_SOCKETCONNECT';

export const loginRequest = createAction(LOGIN_REQUEST);
export const extLoginRequest = createAction(EXT_LOGIN_REQUEST);
export const loginInit = createAction(LOGIN_INIT);
export const logoutRequest = createAction(LOGOUT_REQUEST);
export const loginTokenAuth = createAction(LOGIN_TOKENAUTH);
export const setMyPresence = createAction(SET_MYPRESENCE);
export const authInit = createAction(AUTH_INIT);
export const authCheckComplate = createAction(AUTHCHECK_COMPLATE);

export const logout = createAction(LOGOUT);
export const syncTokenRequest = createAction(SYNC_TOKEN_REQUEST);
export const syncTokenOffline = createAction(SYNC_TOKEN_OFFLINE);

export const changeSocketConnect = createAction(CHANGE_SOCKETCONNECT);

export const changeMyPhotoPath = createAction(CHANGE_MYPHOTOPATH);
export const changeMyInfo = createAction(CHANGE_MYINFO);

export const sync = createAction(SYNC);

const loginRequestSaga = saga.createLoginRequestSaga(LOGIN_REQUEST);
const extLoginRequestSaga = saga.createExtLoginRequestSaga(
  EXT_LOGIN_REQUEST,
  SYNC,
);
const logoutRequestSaga = saga.createLogoutRequestSaga(
  LOGOUT_REQUEST,
  loginApi.logoutRequest,
);
const syncTokenRequestSaga = saga.createSyncTokenRequestSaga(
  SYNC_TOKEN_REQUEST,
  SYNC,
);
const syncTokenOfflineSaga = saga.createSyncTokenOfflineSaga(
  SYNC_TOKEN_OFFLINE,
  SYNC,
);
const syncSaga = saga.createSyncSaga(SYNC);

export function* loginSaga() {
  yield takeLatest(LOGIN_REQUEST, loginRequestSaga);
  yield takeLatest(EXT_LOGIN_REQUEST, extLoginRequestSaga);
  yield takeLatest(LOGOUT_REQUEST, logoutRequestSaga);
  yield takeLatest(SYNC_TOKEN_REQUEST, syncTokenRequestSaga);
  yield takeLatest(SYNC_TOKEN_OFFLINE, syncTokenOfflineSaga);
  yield takeLatest(SYNC, syncSaga);
}

const initialState = {
  id: '',
  token: null,
  userInfo: null,
  registDate: null,
  authFail: false,
  errMessage: null,
  errStatus: null,
  authCheck: false,
  socketConnect: 'NC',
};

const login = handleActions(
  {
    [LOGIN_REQUEST_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.status === 'SUCCESS') {
          draft.authFail = false;
          draft.userInfo = action.payload.result;
          draft.token = action.payload.token;
          draft.id = action.payload.id;
          draft.registDate = action.payload.createDate;
        } else {
          draft.authFail = true;
          draft.token = initialState.token;
        }
      });
    },
    [EXT_LOGIN_REQUEST_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.status === 'SUCCESS') {
          draft.authFail = false;
          draft.userInfo = action.payload.result;
          draft.token = action.payload.token;
          draft.id = action.payload.id;
          draft.registDate = action.payload.createDate;
        } else {
          draft.authFail = true;
          draft.token = initialState.token;
        }
      });
    },
    [LOGIN_REQUEST_FAILURE]: (state, action) => ({
      ...state,
      authFail: true,
      ...(action.errMessage && { errMessage: action.errMessage }),
      ...(action.errStatus && { errStatus: action.errStatus }),
      token: initialState.token,
    }),
    [EXT_LOGIN_REQUEST_FAILURE]: (state, action) => ({
        ...state,
      authFail: true,
      ...(action.errMessage && { errMessage: action.errMessage }),
      ...(action.errStatus && { errStatus: action.errStatus }),
      token: initialState.token,
    }),
    [LOGIN_INIT]: (state, action) => ({
      ...initialState,
      authCheck: true,
    }),
    [LOGOUT_REQUEST_SUCCESS]: (state, action) => ({
      ...initialState,
    }),
    [LOGOUT_REQUEST_FAILURE]: (state, action) => ({
      ...initialState,
    }),
    [LOGIN_TOKENAUTH]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.status === 'SUCCESS') {
          draft.authFail = false;
          draft.userInfo = action.payload.userInfo;
          draft.token = action.payload.token;
          draft.id = action.payload.userInfo.id;
          draft.registDate = action.payload.createDate;
        } else {
          draft.authFail = true;
          draft.token = '';
        }
      });
    },
    [SET_MYPRESENCE]: (state, action) => ({
      ...state,
      userInfo: {
        ...state.userInfo,
        Presence: action.payload,
      },
    }),
    [CHANGE_SOCKETCONNECT]: (state, action) => {
      return produce(state, draft => {
        draft.socketConnect = action.payload;
      });
    },
    [CHANGE_MYPHOTOPATH]: (state, action) => {
      return produce(state, draft => {
        draft.userInfo.photoPath = action.payload;
      });
    },
    [CHANGE_MYINFO]: (state, action) => {
      return produce(state, draft => {
        draft.userInfo.mailAddress = action.payload.mailAddress;
        draft.userInfo.phoneNumber = action.payload.phoneNumber;
        draft.userInfo.work = action.payload.chargeBusiness;
      });
    },
    [AUTH_INIT]: (state, action) => ({
      ...initialState,
      authCheck: false,
    }),
    [AUTHCHECK_COMPLATE]: (state, action) => ({
      ...state,
      authCheck: true,
    }),
  },
  initialState,
);

export default login;
