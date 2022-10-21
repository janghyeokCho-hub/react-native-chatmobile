import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';
import { takeLatest } from 'redux-saga/effects';
import { createRequestActionTypes } from '@/modules/saga/createRequestSaga';
import { isJSONStr } from '@/lib/common';
import * as saga from '@/modules/saga/documentSaga';

const [
  GET_DOCUMENTS,
  GET_DOCUMENTS_SUCCESS,
  GET_DOCUMENTS_FAILURE,
] = createRequestActionTypes('document/GET_DOCUMENTS');

const [
  SET_CURRENT_DOCUMENT,
  SET_CURRENT_DOCUMENT_SUCCESS,
  SET_CURRENT_DOCUMENT_FAILURE,
] = createRequestActionTypes('document/SET_CURRENT_DOCUMENT');

const [
  MODIFY_DOCUMENTSETTING,
  MODIFY_DOCUMENTSETTING_SUCCESS,
  MODIFY_DOCUMENTSETTING_FAILURE,
] = createRequestActionTypes('document/MODIFY_DOCUMENTSETTING');

const SET_CURRENT_DOCUMENT_INIT = 'document/SET_CURRENT_DOCUMENT_INIT';

const INIT = 'document/INIT';

const RECEIVE_DOCUMENT = 'document/RECEIVE_DOCUMENT';
const getDocumentsSaga = saga.createGetDocumentsSaga(GET_DOCUMENTS);

const setCurrentDocumentSaga = saga.createSetCurrnetDocumentSaga(
  SET_CURRENT_DOCUMENT,
);
const modifyDocumentSettingSaga = saga.createModifyDocumentSettingSaga();

export const getDocuments = createAction(GET_DOCUMENTS);
export const setCurrentDocument = createAction(SET_CURRENT_DOCUMENT);
export const setCurrentDocumentInit = createAction(SET_CURRENT_DOCUMENT_INIT);
export const modifyDocumentSetting = createAction(MODIFY_DOCUMENTSETTING);
export const receiveDocument = createAction(RECEIVE_DOCUMENT);
export const init = createAction(INIT);

export function* documentSaga() {
  yield takeLatest(GET_DOCUMENTS, getDocumentsSaga);
  yield takeLatest(SET_CURRENT_DOCUMENT, setCurrentDocumentSaga);
  yield takeLatest(MODIFY_DOCUMENTSETTING, modifyDocumentSettingSaga);
}

const initialState = {
  documents: [],
  currentDocument: null,
};

const document = handleActions(
  {
    [INIT]: (state, action) => {
      return {
        ...initialState,
      };
    },
    [GET_DOCUMENTS_SUCCESS]: (state, action) => {
      return {
        ...state,
        documents: action.payload?.result || [],
      };
    },
    [SET_CURRENT_DOCUMENT_SUCCESS]: (state, action) => {
      return {
        ...state,
        currentDocument: action.payload || null,
      };
    },
    [SET_CURRENT_DOCUMENT_INIT]: (state, action) => {
      return produce(state, draft => {
        draft.currentDocument = null;
      });
    },
    [MODIFY_DOCUMENTSETTING_SUCCESS]: (state, action) => {
      // setting 만 변경한 경우
      return produce(state, draft => {
        const result = action.payload.result;
        const document = draft.documents.find(
          item => item.docID === result.docID,
        );
        document.setting = isJSONStr(result.setting)
          ? JSON.parse(result.setting)
          : result.setting;
        document.pinTop = result.pinTop;
        document.category = result.category;
      });
    },
    [RECEIVE_DOCUMENT]: (state, action) => {
      // docTitle 또는 description 이 변경 될 때에만 사용됨.
      return produce(state, draft => {
        draft.documents.push(action.payload);
      });
    },
  },
  initialState,
);
export default document;
