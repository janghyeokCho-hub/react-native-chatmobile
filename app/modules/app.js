import { createAction, handleActions } from 'redux-actions';
//import { getInitTheme } from '@/lib/deviceConnector';
import produce from 'immer';

const INIT = 'app/INIT';
const SET_CURRENT_ROOM = 'app/SET_CURRENT_ROOM';
const SET_CURRENT_CHANNEL = 'app/SET_CURRENT_CHANNEL';
const CHANGE_THEME = 'app/CHANGE_THEME';
const ADD_BACKHANDLER = 'app/ADD_BACKHANDLER';
const DEL_BACKHANDLER = 'app/DEL_BACKHANDLER';
const SET_NETWORK_STATE = 'app/SET_NETWORK_STATE';

export const init = createAction(INIT);
export const setCurrentRoom = createAction(SET_CURRENT_ROOM);
export const setCurrentChannel = createAction(SET_CURRENT_CHANNEL);
export const changeTheme = createAction(CHANGE_THEME);
export const addBackHandler = createAction(ADD_BACKHANDLER);
export const delBackHandler = createAction(DEL_BACKHANDLER);
export const setNetworkState = createAction(SET_NETWORK_STATE);

const initialState = {
  currentRoomID: -1,
  currentChannelId: -1,
  //theme: getInitTheme(), //TODO:
  theme: 'blue',
  backHandler: {},
  networkState: true,
};

const app = handleActions(
  {
    [INIT]: (state, action) => ({
      ...initialState,
    }),
    [SET_CURRENT_ROOM]: (state, action) => {
      return produce(state, draft => {
        draft.currentRoomID = action.payload;
      });
    },
    [SET_CURRENT_CHANNEL]: (state, action) => {
      return produce(state, draft => {
        draft.currentChannelId = action.payload;
      });
    },
    [CHANGE_THEME]: (state, action) => {
      return produce(state, draft => {
        draft.theme = action.payload;
      });
    },
    [ADD_BACKHANDLER]: (state, action) => {
      return produce(state, draft => {
        draft.backHandler[action.payload.name] = true;

        const lockList = action.payload.lockList;
        if (lockList) {
          lockList.forEach(item => {
            if (draft.backHandler[item] != undefined)
              draft.backHandler[item] = false;
          });
        } else {
          Object.keys(draft.backHandler).forEach(item => {
            if (
              item != action.payload.name &&
              draft.backHandler[item] != undefined
            )
              draft.backHandler[item] = false;
          });
        }
      });
    },
    [DEL_BACKHANDLER]: (state, action) => {
      return produce(state, draft => {
        if (draft.backHandler[action.payload.name] != undefined)
          delete draft.backHandler[action.payload.name];

        const unLockList = action.payload.unLockList;
        if (unLockList) {
          unLockList.forEach(item => {
            if (draft.backHandler[item]) draft.backHandler[item] = true;
          });
        } else {
          Object.keys(draft.backHandler).forEach(item => {
            if (
              item != action.payload.name &&
              draft.backHandler[item] != undefined
            )
              draft.backHandler[item] = true;
          });
        }
      });
    },
    [SET_NETWORK_STATE]: (state, action) => ({
      ...state,
      networkState: action.payload,
    }),
  },
  initialState,
);

export default app;
