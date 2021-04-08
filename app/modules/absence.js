import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';
import { takeLatest } from 'redux-saga/effects';
import * as contactApi from '@API/contact';
import createRequestSaga, {
  createRequestActionTypes,
} from '@/modules/saga/createRequestSaga';
import * as saga from '@/modules/saga/contactSaga';

const INIT = 'absence/INIT';

const [
  GET_ABSENCE,
  GET_ABSENCE_SUCCESS,
  GET_ABSENCE_FAILURE,
] = createRequestActionTypes('absence/GET_ABSENCE');

export const getAbsence = createAction(GET_ABSENCE);

const getAbsenceSaga = createRequestSaga(
  GET_ABSENCE,
  contactApi.getContactList,
  false,
);

export function* absenceSaga() {
  yield takeLatest(GET_ABSENCE, getAbsenceSaga);
}

const initialState = {
  absence: [],
};

const absence = handleActions(
  {
    [INIT]: (state, action) => {
      return {
        ...initialState,
      };
    },
    [GET_ABSENCE_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        action.payload.result.forEach(folder => {
          if (folder.sub) {
            folder.sub.forEach(target => {
              if (target.absenceInfo) {
                draft.absence.push(target.absenceInfo);
              }
            });
          }
        });
      });
    },
  },
  initialState,
);

export default absence;
