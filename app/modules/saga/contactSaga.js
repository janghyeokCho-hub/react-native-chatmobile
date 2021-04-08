import { call, put, fork } from 'redux-saga/effects';
import * as contactApi from '@API/contact';
import * as dbAction from '@/lib/appData/action';

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
