import { call, put, fork } from 'redux-saga/effects';
import * as contactApi from '@API/contact';
import * as dbAction from '@/lib/appData/action';
import { startLoading, finishLoading } from '@/modules/loading';

export function createAddContactSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const response = yield call(contactApi.addContactList, action.payload);

        if (response.data.status == 'SUCCESS') {
          yield put({
            type: 'contact/ADD_CONTACTS_SUCCESS',
            payload: response.data,
          });

          yield call(contactApi.getContactList, action.payload);

          yield fork(dbAction.addContacts, response.data);
        }
      } catch (e) {
        console.log(e);
        yield put({
          type: 'contact/ADD_CONTACTS_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export function createDelContactSaga() {
  return function*(action) {
    if (action.payload) {
      try {
        const response = yield call(
          contactApi.deleteContactList,
          action.payload,
        );

        if (response.data.status == 'SUCCESS') {
          yield put({
            type: 'contact/DELETE_CONTACTS_SUCCESS',
            payload: response.data,
          });

          yield fork(dbAction.delContact, response.data);
        }
      } catch (e) {
        console.log(e);
        yield put({
          type: 'contact/DELETE_CONTACTS_FAILURE',
          payload: e,
          error: true,
        });
      }
    }
  };
}

export function createAddCustomGroupSaga(type) {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;

  return function* (action) {
    if (!action.payload) return;

    try {
      const response = yield call(contactApi.addContactList, action.payload);
      const success = response.data.status === 'SUCCESS';
      // 대화상대 성공 추가
      if (success === true) {
        const group = response.data.result[0];

        /* 추가한 그룹 사용자 불러오기 */
        const data = yield call(contactApi.getItemGroupOneDepth, {
          folderID: group.folderId,
          folderType: group.folderType
        });
        
        if(data.data.status == 'SUCCESS'){
          yield call(dbAction.addCustomGroup, data.data.result[0]);
          
          yield put({
            type: SUCCESS,
            payload: data.data.result[0]
          });
        }
      }

      //대화상대 추가 피드백 (팝업창)
    } catch (err) {
      yield console.log(err);
      // request 에러
      yield put({
        type: FAILURE,
        payload: action.payload,
        error: true,
        errMessage: err
      });
    }
  }
}

export function createModifyGroupMemberSaga(type){
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;

  return function* (action){
    if (!action.payload) return;

    try {
      const response = yield call(contactApi.modifyContactList, action.payload);
      const success = response.data.status === 'SUCCESS';
      
      // 대화상대 성공 추가
      if (success === true) {
        const group = response.data.result[0];

        /* 추가한 그룹 사용자 불러오기 */
        const data = yield call(contactApi.getItemGroupOneDepth, {
          folderID: group.folderId,
          folderType: group.folderType
        });

        if(data.data.status == 'SUCCESS'){
          yield call(dbAction.modifyGroupMember, data.data.result[0]);

          yield put({
            type: SUCCESS,
            payload: data.data.result[0]
          });
        }
      }

    } catch (err) {
      // request 에러
      yield put({
        type: FAILURE,
        payload: action.payload,
        error: true,
        errMessage: err
      });
    }
  }
}

export function createRemoveCustomGroupSaga(type){
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;

  return function* (action){
    if (!action.payload) return;

    yield put(startLoading(type));
    try {
      const response = yield call(contactApi.deleteContactList, action.payload);
      const success = response.data.status === 'SUCCESS';
      if (success === true) {
        yield put({
          type: SUCCESS,
          payload: response.data,
        });
        
        //dbaction
        yield fork(dbAction.removeCustomGroup, response.data);
      }
    } catch (e) {
      yield fork(exceptionHandler, { e: e, redirectError: redirectError });

      yield put({
        type: FAILURE,
        payload: e,
        error: true,
      });
    }
    yield put(finishLoading(type));
  }
}

export function createModifyCustomGroupNameSaga(type){
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;

  return function* (action){
    if (!action.payload) return;

    yield put(startLoading(type));
    try {
      const response = yield call(contactApi.modiftyCustomGroupName, action.payload);
      const success = response.data.status === 'SUCCESS';
      if (success === true) {
        yield put({
          type: SUCCESS,
          payload: response.data,
        });

        //dbaction
        yield fork(dbAction.modifyCustomGroupName, response.data);
      }
    } catch (e) {
      yield fork(exceptionHandler, { e: e, redirectError: redirectError });

      yield put({
        type: FAILURE,
        payload: e,
        error: true,
      });
    }
    yield put(finishLoading(type));
  }
}