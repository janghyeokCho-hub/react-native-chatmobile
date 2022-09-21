import { createAction, handleActions } from 'redux-actions';
import { takeLatest, takeEvery } from 'redux-saga/effects';
import * as messageApi from '@API/message';
import * as saga from '@/modules/saga/messageSaga';
import { createRequestActionTypes } from '@/modules/saga/createRequestSaga';
import produce from 'immer';

const [
  SEND_MESSAGE,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_FAILURE,
] = createRequestActionTypes('message/SEND_MESSAGE');

const RESEND_MESSAGE = 'message/RESEND_MESSAGE';
const RESEND_CHANNEL_MESSAGE = 'message/RESEND_CHANNEL_MESSAGE';

const REMOVE_TEMPMESSAGE = 'message/REMOVE_TEMPMESSAGE';

// FILE 부분 시작
const CHANGE_FILES = 'message/CHANGE_FILES';
const CLEAR_FILES = 'message/CLEAR_FILES';
const DELETE_FILE = 'message/DELETE_FILE';

const INIT = 'message/INIT';
const SET_MOVE_VIEW = 'message/SET_MOVE_VIEW';

// 채널
const [
  SEND_CHANNEL_MESSAGE,
  SEND_CHANNEL_MESSAGE_SUCCESS,
  SEND_CHANNEL_MESSAGE_FAILURE,
] = createRequestActionTypes('message/SEND_CHANNEL_MESSAGE');

const REMOVE_CHANNEL_TEMPMESSAGE = 'message/REMOVE_CHANNEL_TEMPMESSAGE';

// 답장 할 본문 메시지 내용
const SET_POST_REPLY_MESSAGE = 'message/SET_POST_REPLY_MESSAGE';
const SET_TEMP_MESSAGE = 'message/SET_TEMP_MESSAGE';

const SET_POST_ACTION = 'message/SET_POST_ACTION';

export const init = createAction(INIT);
export const sendMessage = createAction(SEND_MESSAGE);
export const reSendMessage = createAction(RESEND_MESSAGE);
export const removeTempMessage = createAction(REMOVE_TEMPMESSAGE);
export const changeFiles = createAction(CHANGE_FILES);
export const clearFiles = createAction(CLEAR_FILES);
export const deleteFile = createAction(DELETE_FILE);
export const setMoveView = createAction(SET_MOVE_VIEW);

// 채널
export const sendChannelMessage = createAction(SEND_CHANNEL_MESSAGE);
export const reSendChannelMessage = createAction(RESEND_CHANNEL_MESSAGE);
export const removeChannelTempMessage = createAction(
  REMOVE_CHANNEL_TEMPMESSAGE,
);

export const setPostReplyMessage = createAction(SET_POST_REPLY_MESSAGE);

export const setTempMessage = createAction(SET_TEMP_MESSAGE);

export const setPostAction = createAction(SET_POST_ACTION);

const sendMessageSaga = saga.createSendMessageSaga(
  messageApi.sendMessage,
  messageApi.uploadFile,
  messageApi.getURLThumbnail,
);
const reSendMessageSaga = saga.createSendMessageSaga(
  messageApi.sendMessage,
  messageApi.uploadFile,
  messageApi.getURLThumbnail,
);

// 채널
const sendChannelMessageSaga = saga.createSendChannelMessageSaga(
  messageApi.sendChannelMessage,
  messageApi.uploadFile,
  messageApi.getURLThumbnail,
);

const reSendChannelMessageSaga = saga.createSendChannelMessageSaga(
  messageApi.sendChannelMessage,
  messageApi.uploadFile,
  messageApi.getURLThumbnail,
);

export function* messageSaga() {
  yield takeEvery(SEND_CHANNEL_MESSAGE, sendChannelMessageSaga);
  yield takeEvery(SEND_MESSAGE, sendMessageSaga);
  yield takeLatest(RESEND_MESSAGE, reSendMessageSaga);
  yield takeLatest(RESEND_CHANNEL_MESSAGE, reSendChannelMessageSaga);
}

const initialState = {
  tempMessage: [],
  tempFiles: [],
  moveId: -1,
  moveRoomID: -1,
  moveVisible: false,
  // 답글 보낼 본문 메시지
  postReplyMessage: null,
  // 채널
  tempChannelMessage: [],
  // 메시지 보낸 Action check
  postAction: false,
};

let tempId = 0;

const message = handleActions(
  {
    [INIT]: (state, action) => ({
      ...initialState,
    }),
    [SEND_MESSAGE]: (state, action) => {
      return produce(state, draft => {
        // 해당 메시지를 tempMessage에 넣고 상태를 send으로 지정

        const sendData = action.payload;
        sendData.status = 'send';
        sendData.tempId = tempId++;
        draft.tempMessage.push(sendData);
      });
    },
    [SEND_MESSAGE_SUCCESS]: (state, action) => {
      return produce(state, draft => {});
    },
    [SEND_MESSAGE_FAILURE]: (state, action) => {
      return produce(state, draft => {
        // 해당 메시지의 상태를 fail로 변경
        const sendData = draft.tempMessage.find(
          m => m.tempId === action.payload.tempId,
        );

        if (sendData) sendData.status = 'fail';
      });
    },
    [REMOVE_TEMPMESSAGE]: (state, action) => {
      return produce(state, draft => {
        // const sendData = draft.tempMessage.find(
        //   m => m.tempId === action.payload,
        // );
        // console.log(sendData);
        // if (sendData.sendFileInfo) {
        //   console.log(sendData.sendFileInfo.files);
        //   for (let pair of sendData.sendFileInfo.files.entries()) {
        //     console.log(pair[0] + ', ' + pair[1]);
        //     console.log(pair[1]);
        //   }
        // }
        draft.tempMessage.splice(
          draft.tempMessage.findIndex(m => m.tempId === action.payload),
          1,
        );
      });
    },
    [RESEND_MESSAGE]: (state, action) => {
      return produce(state, draft => {
        // 해당 메시지를 tempMessage에 넣고 상태를 send으로 지정
        const sendData = draft.tempMessage.find(
          m => m.tempId === action.payload.tempId,
        );

        sendData.status = 'send';
      });
    },
    [CHANGE_FILES]: (state, action) => {
      return produce(state, draft => {
        draft.tempFiles = [...action.payload.files];
      });
    },
    [CLEAR_FILES]: (state, action) => {
      return produce(state, draft => {
        draft.tempFiles = [];
      });
    },
    [DELETE_FILE]: (state, action) => {
      return produce(state, draft => {
        const delIndex = draft.tempFiles.findIndex(
          item => item.tempId == action.payload,
        );
        draft.tempFiles.splice(delIndex, 1);
      });
    },
    [SET_MOVE_VIEW]: (state, action) => {
      return produce(state, draft => {
        draft.moveRoomID = action.payload.roomID;
        draft.moveId = action.payload.moveId;
        draft.moveVisible = action.payload.visible;
      });
    },
    // 채널
    [SEND_CHANNEL_MESSAGE]: (state, action) => {
      return produce(state, draft => {
        // 해당 채널 메시지를 tempMessage에 넣고 상태를 send으로 지정
        const sendData = action.payload;
        sendData.status = 'send';
        sendData.tempId = tempId++;
        draft.tempChannelMessage.push(sendData);
      });
    },
    [SEND_CHANNEL_MESSAGE_SUCCESS]: (state, action) => {
      return produce(state, draft => {
        // 해당 채널 메시지 메시지 ID 매핑
        const tempChannelMessage = draft.tempChannelMessage.find(
          m => m.tempId === action.payload.tempId,
        );
      });
    },
    [SEND_CHANNEL_MESSAGE_FAILURE]: (state, action) => {
      return produce(state, draft => {
        // 해당 채널 메시지의 상태를 fail로 변경
        const sendData = draft.tempChannelMessage.find(
          m => m.tempId === action.payload.tempId,
        );

        sendData.status = 'fail';
      });
    },
    [RESEND_CHANNEL_MESSAGE]: (state, action) => {
      return produce(state, draft => {
        // 해당 메시지를 tempChannelMessage에 넣고 상태를 send으로 지정
        const sendData = draft.tempChannelMessage.find(
          m => m.tempId === action.payload.tempId,
        );

        sendData.status = 'send';
      });
    },
    [REMOVE_CHANNEL_TEMPMESSAGE]: (state, action) => {
      return produce(state, draft => {
        // const sendData = draft.tempMessage.find(
        //   m => m.tempId === action.payload,
        // );
        // console.log(sendData);
        // if (sendData.sendFileInfo) {
        //   console.log(sendData.sendFileInfo.files);
        //   for (let pair of sendData.sendFileInfo.files.entries()) {
        //     console.log(pair[0] + ', ' + pair[1]);
        //     console.log(pair[1]);
        //   }
        // }
        draft.tempChannelMessage.splice(
          draft.tempChannelMessage.findIndex(m => m.tempId === action.payload),
          1,
        );
      });
    },
    [SET_TEMP_MESSAGE]: (state, action) => {
      return produce(state, draft => {
        draft.tempMessage = action.payload;

        if (action.payload && action.payload.length > 0)
          tempId = action.payload[action.payload.length - 1].tempId + 1;
      });
    },
    [SET_POST_REPLY_MESSAGE]: (state, action) => {
      return produce(state, draft => {
        draft.postReplyMessage = action.payload;
      });
    },
    [SET_POST_ACTION]: (state, action) => {
      return produce(state, draft => {
        console.log('SET_POST_ACTION : ', action.payload);
        draft.postAction = action.payload;
      });
    },
  },
  initialState,
);

export default message;
