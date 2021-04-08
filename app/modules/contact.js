import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';
import { takeLatest } from 'redux-saga/effects';
import * as contactApi from '@API/contact';
import createRequestSaga, {
  createRequestActionTypes,
} from '@/modules/saga/createRequestSaga';
import * as saga from '@/modules/saga/contactSaga';

const [
  GET_CONTACTS,
  GET_CONTACTS_SUCCESS,
  GET_CONTACTS_FAILURE,
] = createRequestActionTypes('contact/GET_CONTACTS');

const [
  ADD_CONTACTS,
  ADD_CONTACTS_SUCCESS,
  ADD_CONTACTS_FAILURE,
] = createRequestActionTypes('contact/ADD_CONTACTS');

const [
  DELETE_CONTACTS,
  DELETE_CONTACTS_SUCCESS,
  DELETE_CONTACTS_FAILURE,
] = createRequestActionTypes('contact/DELETE_CONTACTS');

const [
  GET_ITEMGROUP,
  GET_ITEMGROUP_SUCCESS,
  GET_ITEMGROUP_FAILURE,
] = createRequestActionTypes('contact/GET_ITEMGROUP');

const SET_CONTACTS = 'contact/SET_CONTACTS';

const MAPPING_USER_CHAT_ROOM = 'contact/MAPPING_USER_CHAT_ROOM';

const INIT = 'contact/INIT';

export const getContacts = createAction(GET_CONTACTS);
export const addContacts = createAction(ADD_CONTACTS);
export const deleteContacts = createAction(DELETE_CONTACTS);
export const getItemGroup = createAction(GET_ITEMGROUP);
export const mappingUserChatRoom = createAction(MAPPING_USER_CHAT_ROOM);
export const setContacts = createAction(SET_CONTACTS);
export const init = createAction(INIT);

const getContactsSaga = createRequestSaga(
  GET_CONTACTS,
  contactApi.getContactList,
  false,
);

const addContactsSaga = saga.createAddContactSaga();

const deleteContactsSaga = saga.createDelContactSaga(
  DELETE_CONTACTS,
  contactApi.deleteContactList,
);

const getItemGroupSaga = createRequestSaga(
  GET_ITEMGROUP,
  contactApi.getItemGroupOneDepth,
  false,
);

export function* contactSaga() {
  yield takeLatest(GET_CONTACTS, getContactsSaga);
  yield takeLatest(ADD_CONTACTS, addContactsSaga);
  yield takeLatest(DELETE_CONTACTS, deleteContactsSaga);
  yield takeLatest(GET_ITEMGROUP, getItemGroupSaga);
}

const initialState = {
  contacts: [],
};

const contact = handleActions(
  {
    [INIT]: (state, action) => {
      return {
        ...initialState,
      };
    },
    [GET_CONTACTS_SUCCESS]: (state, action) => {
      return {
        ...state,
        contacts: action.payload.result,
      };
    },
    [ADD_CONTACTS_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        action.payload.result.forEach(item => {
          const folderType = item.folderType;
          const userInfo = item.userInfo;
          const orgFolderType = item.orgFolderType;

          if (folderType == 'G') {
            draft.contacts.push({
              folderID: item.folderId,
              folderName: userInfo.name,
              folderType: folderType,
              folderSortKey: item.folderSortKey,
              groupCode: userInfo.id,
              pChat: userInfo.pChat,
            });
          } else {
            const parent = draft.contacts.find(
              contact => contact.folderType == folderType,
            );

            if (!parent.sub) parent.sub = [];

            parent.sub.push(userInfo);

            if (folderType == 'F' && orgFolderType == 'C') {
              const contact = draft.contacts.find(
                contact => contact.folderType == 'C',
              );
              if (contact)
                contact.sub = contact.sub.filter(sub => sub.id != userInfo.id);
            }
          }
        });
      });
    },
    [DELETE_CONTACTS_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        const id = action.payload.result.contactId;
        const folderType = action.payload.result.folderType;

        if (folderType == 'G') {
          draft.contacts = draft.contacts.filter(
            item => item.folderID != action.payload.result.folderId,
          );
        } else {
          if (folderType == 'F') {
            let contactList = draft.contacts.find(
              contact => contact.folderType == 'C',
            );
            let favoriteList = draft.contacts.find(
              contact => contact.folderType == 'F',
            );
            if (contactList) {
              if (favoriteList.sub) {
                const addItem = favoriteList.sub.find(item => item.id == id);
                if (contactList.sub) contactList.sub.push(addItem);
                else contactList.sub = [addItem];
              } else contactList.sub = [];
            }
          }

          const parent = draft.contacts.find(
            contact => contact.folderType == folderType,
          );

          parent.sub = parent.sub.filter(item => item.id != id);
        }
      });
    },
    [SET_CONTACTS]: (state, action) => {
      // login시에만 사용
      return {
        ...state,
        contacts: action.payload.result,
        //reload: false,
      };
    },
    [GET_ITEMGROUP_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        if (action.payload.result.groupCode) {
          const groupCode = action.payload.result.groupCode;
          const contact = draft.contacts.find(
            contact => contact.groupCode == groupCode,
          );

          contact.sub = action.payload.result.sub;
        }
      });
    },
    [MAPPING_USER_CHAT_ROOM]: (state, action) => {
      return produce(state, draft => {
        for (let i = 0; i < draft.contacts.length; i++) {
          if (draft.contacts[i].sub && draft.contacts[i].sub.length > 0) {
            const target = draft.contacts[i].sub.find(
              t => t.id == action.payload.id,
            );
            if (target) target.roomID = action.payload.roomID;
          }
        }
      });
    },
  },
  initialState,
);

export default contact;
