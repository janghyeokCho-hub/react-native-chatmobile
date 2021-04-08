import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';

const CHANGE_MODAL = 'modal/CHANGE_MODAL';
const OPEN_MODAL = 'modal/OPEN_MODAL';
const CLOSE_MODAL = 'modal/CLOSE_MODAL';

export const changeModal = createAction(CHANGE_MODAL);
export const openModal = createAction(OPEN_MODAL);
export const closeModal = createAction(CLOSE_MODAL);

const initialState = {
  open: false,
  modalData: {
    title: null,
    closeOnTouchOutside: true,
    type: 'normal',
    buttonList: [],
  },
};

const modal = handleActions(
  {
    [CHANGE_MODAL]: (state, action) => {
      return produce(state, draft => {
        draft.modalData = action.payload.modalData;
      });
    },
    [OPEN_MODAL]: (state, action) => {
      return produce(state, draft => {
        draft.modalData = state.modalData;
        draft.open = true;
      });
    },
    [CLOSE_MODAL]: (state, action) => {
      return produce(state, draft => {
        draft.modalData = {
          title: null,
          disableBackPress: false,
          buttonList: [],
        };
        draft.open = false;
      });
    },
  },
  initialState,
);

export default modal;
