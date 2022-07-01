import { call, put, fork } from 'redux-saga/effects';
import { exceptionHandler } from './createRequestSaga';
import { startLoading, finishLoading } from '@/modules/loading';

import * as socketConnector from '@/lib/socket/socketConnect';

export function createSendMessageSaga(request, fileRequest, linkRequest) {
  const SUCCESS = `message/SEND_MESSAGE_SUCCESS`;
  const FAILURE = `message/SEND_MESSAGE_FAILURE`;

  return function*(action) {
    yield put(startLoading('message/SEND_MESSAGE'));

    // 소켓이 연결 될 떄 까지 대기
    yield socketConnector.WaitForSocketConnection();

    try {
      let messageParams = {
        context: action.payload.context,
        roomID: action.payload.roomID,
        roomType: action.payload.roomType,
        status: action.payload.status,
        tempId: action.payload.tempId,
        blockList: action.payload.blockList,
      };
      if (action.payload.sendFileInfo) {
        const responseFile = yield call(fileRequest, action.payload);

        if (responseFile.data.state == 'SUCCESS') {
          messageParams.fileInfos = JSON.stringify(responseFile.data.result);
        } else {
          yield put({
            type: FAILURE,
            payload: action.payload,
          });
        }
      }

      if (action.payload.linkInfo) {
        messageParams.linkInfo = JSON.stringify(action.payload.linkInfo);
      }
      const response = yield call(request, messageParams);

      if (response.data.status == 'SUCCESS') {
        if (action.payload.linkInfo && action.payload.linkInfo.url != '') {
          const linkParams = {
            roomId: action.payload.roomID,
            messageId: response.data.result.messageID,
            url: action.payload.linkInfo.url,
          };
          yield call(linkRequest, linkParams);
        }
      } else {
        yield put({
          type: FAILURE,
          payload: action.payload,
        });
      }
    } catch (e) {
      yield fork(exceptionHandler, { e: e, redirectError: false });

      yield put({
        type: FAILURE,
        payload: action.payload,
        error: true,
      });
    }
    yield put(finishLoading('message/SEND_MESSAGE'));
  };
}

// 채널
export function createSendChannelMessageSaga(
  request,
  fileRequest,
  linkRequest,
) {
  const SUCCESS = `message/SEND_CHANNEL_MESSAGE_SUCCESS`;
  const FAILURE = `message/SEND_CHANNEL_MESSAGE_FAILURE`;

  return function*(action) {
    yield put(startLoading('message/SEND_CHANNEL_MESSAGE'));
    try {
      let messageParams = {
        context: action.payload.context,
        roomID: action.payload.roomID,
        roomType: action.payload.roomType,
        status: action.payload.status,
        tempId: action.payload.tempId,
        blockList: action.payload.blockList,
      };
      if (action.payload.sendFileInfo) {
        const responseFile = yield call(fileRequest, action.payload);

        if (responseFile.data.state == 'SUCCESS') {
          messageParams.fileInfos = JSON.stringify(responseFile.data.result);
        } else {
          yield put({
            type: FAILURE,
            payload: action.payload,
          });
        }
      }

      if (action.payload.linkInfo) {
        messageParams.linkInfo = JSON.stringify(action.payload.linkInfo);
      }

      if (action.payload.tagInfo) {
        messageParams.tagInfo = JSON.stringify(action.payload.tagInfo);
      }

      if (action.payload.mentionInfo) {
        messageParams.targetArr = action.payload.mentionInfo;
      } else {
        messageParams.targetArr = [];
      }
      const response = yield call(request, messageParams);

      if (response.data.status == 'SUCCESS') {
        /*
        yield put({
          type: SUCCESS,
          payload: action.payload,
        });
        */

        if (action.payload.linkInfo && action.payload.linkInfo.url != '') {
          const linkParams = {
            roomId: action.payload.roomID,
            messageId: response.data.result.messageID,
            url: action.payload.linkInfo.url,
          };
          yield call(linkRequest, linkParams);
        }
      } else {
        yield put({
          type: FAILURE,
          payload: action.payload,
        });
      }
    } catch (e) {
      console.log(e);
      yield call(exceptionHandler, { e: e, redirectError: false });

      yield put({
        type: FAILURE,
        payload: action.payload,
        error: true,
      });
    }
    yield put(finishLoading('message/SEND_CHANNEL_MESSAGE'));
  };
}
