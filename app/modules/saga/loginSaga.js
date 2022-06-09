import { call, put, fork } from 'redux-saga/effects';
import AsyncStorage from '@react-native-community/async-storage';
import { startLoading, finishLoading } from '@/modules/loading';
import {
  logout,
  loginTokenAuth,
  authCheckComplate,
  sync,
  preLoginSuccess,
  setChineseWall,
} from '@/modules/login';
import * as loginApi from '@API/login';
import * as channelApi from '@API/channel';
import { setFixedUsers, addFixedUsers } from '@/modules/presence';
import { setContacts } from '@/modules/contact';
import { setRooms } from '@/modules/room';
import { setChannels } from '@/modules/channel';
import { getAbsence } from '@/modules/absence';
import { getFixedUserData } from '@/lib/presenceUtil';
import { closeSocket } from '@/lib/socket/socketConnect';
import * as dbAction from '@/lib/appData/action';
import * as LoginInfo from '@/lib/class/LoginInfo';
import { Alert } from 'react-native';
import { exceptionHandler } from './createRequestSaga';
import { getConfig, initConfig } from '@/config';
// ChineseWall
import { getChineseWall } from '@/lib/api/orgchart';

export function createLoginRequestSaga(loginType, syncType) {
  const SUCCESS = `${loginType}_SUCCESS`;
  const FAILURE = `${loginType}_FAILURE`;

  return function*(action) {
    if (action.payload) {
      try {
        yield put(startLoading(loginType));
        const response = yield call(loginApi.loginRequest, action.payload);
        const resData = response.data;
        if (resData.status === 'SUCCESS') {
          if (resData.result && resData.token) {
            // localStorage에 token 세팅
            yield loginApi.saveLocalStorage({
              token: resData.token,
              accessid: resData.result.id,
            });
            LoginInfo.setData(resData.result.id, resData.token, resData.result);

            yield put(preLoginSuccess(resData.result));

            // login 후처리 시작
            yield call(dbAction.initSyncAppData, {
              token: resData.token,
              accessid: resData.result.id,
              id: resData.result.id,
              createDate: resData.createDate,
              userInfo: resData.result,
            });

            yield put(
              addFixedUsers([
                {
                  id: resData.result.id,
                  presence: resData.result.presence,
                },
              ]),
            );

            // 채팅방 정보 불러오기
            const rooms = yield call(dbAction.getRooms);
            yield put(setRooms(rooms));

            const users = yield call(getFixedUserData, {
              array: rooms.rooms,
              key: 'members',
            });
            yield put(setFixedUsers(users));

            // 연락처 정보 불러오기
            const contacts = yield call(dbAction.getContacts);
            yield put(setContacts(contacts));

            const contactUsers = yield call(getFixedUserData, {
              array: contacts.result,
              key: 'sub',
            });
            yield put(setFixedUsers(contactUsers));

            yield put(sync({ showLoading: true }));

            // 부재 정보 불러오기
            yield console.log('call absence user');
            yield call(getAbsence);

            // 로그인 완료처리
            yield put({
              type: SUCCESS,
              payload: response.data,
            });
            yield put(finishLoading(loginType));

            // 채널
            const channels = yield call(channelApi.getChannelList, {
              userId: response.data.result.id,
              members: [response.data.result.id],
            });
            if (channels.data.status == 'SUCCESS') {
              yield put(setChannels(channels.data));
            }

            // 차이니즈 월
            const useChineseWall = getConfig('UseChineseWall', false);
            if (useChineseWall) {
              const chineseWall = yield call(getChineseWall, {
                userId: response.data.result.id,
              });

              if (chineseWall.status === 'SUCCESS') {
                yield put(setChineseWall(chineseWall.result));
              }
            }
          } else {
            yield put({
              type: FAILURE,
              payload: action.payload,
            });
          }
        } else {
          // status !== SUCCESS
          yield put({
            type: FAILURE,
            errMessage: response.data.result,
            errStatus: response.data.status,
            payload: action.payload,
          });
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: true });
        yield put({
          type: FAILURE,
          payload: action.payload,
          error: true,
          errMessage: e,
        });
      } finally {
        // loading state가 해제되지 않는 현상 수정
        yield put(finishLoading(loginType));
        yield put(finishLoading(syncType));
      }
    }
  };
}

export function createExtLoginRequestSaga(loginType, syncType) {
  const SUCCESS = `${loginType}_SUCCESS`;
  const FAILURE = `${loginType}_FAILURE`;

  return function*(action) {
    if (action.payload) {
      try {
        yield put(startLoading(loginType));
        const response = yield call(loginApi.extLoginRequest, action.payload);

        const resData = response.data;
        if (resData.status === 'SUCCESS') {
          if (resData.result && resData.token) {
            // localStorage에 token 세팅
            yield loginApi.saveLocalStorage({
              token: resData.token,
              accessid: resData.result.id,
            });

            LoginInfo.setData(resData.result.id, resData.token, resData.result);

            yield put(preLoginSuccess(resData.result));

            // login 후처리 시작
            const syncResult = yield call(dbAction.initSyncAppData, {
              token: resData.token,
              id: resData.result.id,
              createDate: resData.createDate,
              userInfo: resData.result,
            });

            yield put(
              addFixedUsers([
                {
                  id: resData.result.id,
                  presence: resData.result.presence,
                },
              ]),
            );

            // 채팅방 정보 불러오기
            const rooms = yield call(dbAction.getRooms);
            yield put(setRooms(rooms));

            const users = yield call(getFixedUserData, {
              array: rooms.rooms,
              key: 'members',
            });
            yield put(setFixedUsers(users));

            yield put(sync({ showLoading: true, isExtUser: true }));

            // 로그인 완료처리
            yield put({
              type: SUCCESS,
              payload: response.data,
            });
            yield put(finishLoading(loginType));

            // 부재 정보 불러오기
            yield console.log('call absence ext user');
            yield call(getAbsence);

            // 채널
            const channels = yield call(channelApi.getChannelList, {
              userId: response.data.result.id,
              members: [response.data.result.id],
            });
            if (channels.data.status == 'SUCCESS') {
              yield put(setChannels(channels.data));
            }

            // 차이니즈 월
            const useChineseWall = getConfig('UseChineseWall', false);
            if (useChineseWall) {
              const chineseWall = yield call(getChineseWall, {
                userId: response.data.result.id,
              });
              if (chineseWall.status === 'SUCCESS') {
                yield put(setChineseWall(chineseWall.result));
              }
            }
          } else {
            yield put({
              type: FAILURE,
              payload: action.payload,
            });
          }
        } else {
          yield put({
            type: FAILURE,
            payload: action.payload,
          });
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: true });

        yield put({
          type: FAILURE,
          payload: action.payload,
          error: true,
          errMessage: e,
        });
      } finally {
        // loading state가 해제되지 않는 현상 수정
        yield put(finishLoading(loginType));
        yield put(finishLoading(syncType));
      }
    }
  };
}

export function createSyncSaga(type) {
  return function*(action) {
    try {
      // 동기화 시작
      if (action.payload.showLoading) yield put(startLoading(type));

      // 동기화
      const result = yield call(dbAction.syncAppData, {
        userList: action.payload.userList,
      });

      if (result) {
        // 채팅방 정보 불러오기
        const rooms = yield call(dbAction.getRooms);
        yield put(setRooms(rooms));

        const users = yield call(getFixedUserData, {
          array: rooms.rooms,
          key: 'members',
        });
        yield put(setFixedUsers(users));

        if (!action.payload.isExtUser) {
          // 연락처 정보 불러오기
          const contacts = yield call(dbAction.getContacts);
          yield put(setContacts(contacts));

          const contactUsers = yield call(getFixedUserData, {
            array: contacts.result,
            key: 'sub',
          });
          yield put(setFixedUsers(contactUsers));
        }
      } else {
        Alert.alert(
          null,
          '동기화 중 오류가 발생하였습니다. 관리자에게 문의 부탁드립니다.',
          [{ text: '확인' }],
          { cancelable: true },
        );
      }

      // 동기화 끝
      if (action.payload.showLoading) yield put(finishLoading(type));
    } catch (error) {
      console.log(error);
    }
  };
}

export function createLogoutRequestSaga(type, api) {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;

  return function*(action) {
    if (action.payload) {
      try {
        yield dbAction.logout();

        const response = yield call(api, action.payload);

        yield LoginInfo.clearData();

        yield closeSocket(true);

        yield put(logout());
      } catch (e) {
        console.log(e);
        yield fork(exceptionHandler, { e: e, redirectError: false });

        yield put({
          type: FAILURE,
          payload: action.payload,
          error: true,
        });
      }
    }
  };
}

export function createSyncTokenRequestSaga(type) {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;

  return function*(action) {
    if (action.payload.result) {
      try {
        const result = action.payload.result;

        if (result.status === 'SUCCESS') {
          const authData = result.userInfo;

          yield put(preLoginSuccess(authData));

          // login 후처리 시작
          LoginInfo.setData(authData.id, result.token, authData);
          yield call(dbAction.initSyncAppData, {
            token: result.token,
            id: authData.id,
            createDate: result.createDate,
            userInfo: authData,
          });

          yield put(startLoading(type));
          yield put(
            addFixedUsers([
              {
                id: authData.id,
                presence: authData.presence,
              },
            ]),
          );

          // 채팅방 정보 불러오기
          const rooms = yield call(dbAction.getRooms);
          yield put(setRooms(rooms));

          const users = yield call(getFixedUserData, {
            array: rooms.rooms,
            key: 'members',
          });
          yield put(setFixedUsers(users));

          // 연락처 정보 불러오기
          const contacts = yield call(dbAction.getContacts);
          yield put(setContacts(contacts));

          const contactUsers = yield call(getFixedUserData, {
            array: contacts.result,
            key: 'sub',
          });
          yield put(setFixedUsers(contactUsers));

          yield put(loginTokenAuth(result));
          yield put(authCheckComplate());
          yield put(finishLoading(type));

          yield put(sync({ showLoading: true }));

          // 채널
          const channels = yield call(channelApi.getChannelList, {
            userId: authData.id,
            members: [authData.id],
          });
          if (channels.data.status == 'SUCCESS') {
            yield put(setChannels(channels.data));
          }

          // 차이니즈 월
          const useChineseWall = getConfig('UseChineseWall', false);
          if (useChineseWall) {
            const chineseWall = yield call(getChineseWall, {
              userId: authData.id,
            });
            if (chineseWall.status === 'SUCCESS') {
              yield put(setChineseWall(chineseWall.result));
            }
          }
        } else {
          yield put(loginTokenAuth(result));
        }
      } catch (e) {
        yield fork(exceptionHandler, { e: e, redirectError: true });

        yield put({
          type: FAILURE,
          payload: action.payload.result,
          error: true,
        });
      }
    }
  };
}

export function createSyncTokenOfflineSaga(type) {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;

  return function*(action) {
    try {
      const id = action.payload.id;
      const result = yield call(dbAction.getLoginInfo, id);

      if (result.status === 'SUCCESS') {
        const authData = result.userInfo;

        // login 후처리 시작
        LoginInfo.setData(authData.id, result.token, authData);

        yield put(startLoading(type));
        yield put(
          addFixedUsers([
            {
              id: authData.id,
              presence: authData.presence,
            },
          ]),
        );

        // 채팅방 정보 불러오기
        const rooms = yield call(dbAction.getRooms);
        yield put(setRooms(rooms));

        const users = yield call(getFixedUserData, {
          array: rooms.rooms,
          key: 'members',
        });
        yield put(setFixedUsers(users));

        // 연락처 정보 불러오기
        const contacts = yield call(dbAction.getContacts);
        yield put(setContacts(contacts));

        const contactUsers = yield call(getFixedUserData, {
          array: contacts.result,
          key: 'sub',
        });
        yield put(setFixedUsers(contactUsers));

        yield put(loginTokenAuth(result));
        yield put(authCheckComplate());
        yield put(finishLoading(type));
      } else {
        yield put(loginTokenAuth(result));
      }
    } catch (e) {
      yield fork(exceptionHandler, { e: e, redirectError: true });

      yield put({
        type: FAILURE,
        payload: action.payload.result,
        error: true,
      });
    }
  };
}

export function* preLoginSuccessSaga(action) {
  const isSaaSClient = getConfig('IsSaaSClient', 'N') === 'Y';
  /**
   * 2022.05.23
   * SaaS버전 클라이언트인 경우 유저의 CompanyCode를 사용해서 사별 시스템설정 가져오기
   */
  if (isSaaSClient && action?.payload?.CompanyCode) {
    console.log('PRE_LOGIN_SUCCESS SAGA ::', isSaaSClient, action.payload);
    try {
      const response = yield call(loginApi.getSystemConfigSaaS, {
        companyCode: action.payload.CompanyCode,
      });
      // localStorage의 서버설정 값을 사별 설정값으로 업데이트
      if (response?.data?.result?.config) {
        const hostInfo = yield call(AsyncStorage.getItem, 'EHINF');
        const config = response.data.result;
        AsyncStorage.setItem('ESETINF', JSON.stringify(config));
        yield call(initConfig, hostInfo, config);
      }
    } catch (err) {
      console.log('preLoginSuccessSaga occured an error: ', err);
    }
  }
}
