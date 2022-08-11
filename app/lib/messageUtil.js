import * as dbAction from '@/lib/appData/action';
import * as messageApi from '@API/message';
import { openModal, changeModal } from '@/modules/modal';

export const getMessage = async (
  roomID,
  startId,
  dist,
  unreadCntCallback,
  isNotice,
  loadCnt,
) => {
  const param = {
    roomID,
    startId,
    loadCnt: loadCnt ? loadCnt : 100,
    dist,
    isNotice,
  };

  const resultObj = await dbAction.getMessages(param);

  let messages = resultObj.data.result;

  if (messages.length > 0) {
    unreadCntCallback({
      roomId: roomID,
      startId: messages[0].messageID,
      endId: messages[messages.length - 1].messageID,
      isNotice,
    });
  }

  return resultObj;
};

/**
 * Reply 본문 메시지 ID + 10 부터 해당 방의 마지막 메시지까지
 * @param {*} roomID 대화방 OR 채널 ID
 * @param {*} startId replyID
 * @param {*} cnt 위로 더 불러올 갯수
 * @param {*} roomType CHAT / CHANNEL
 * @returns [...messages]
 */
export const getMessageBetween = async (
  roomID,
  startId,
  cnt = 10,
  roomType = 'CHAT',
) => {
  const param = {
    roomID,
    startId,
    cnt,
  };

  if (roomType === 'CHAT') {
    return await dbAction.selectBetweenMessagesByIDs(param);
  } else {
    // CHANNEL
    return await messageApi.getMessageBetween(param);
  }
};

export const getChannelMessage = (roomID, startId, dist) => {
  let resultObj;
  const param = {
    roomId: roomID,
    startId,
    loadCnt: 100,
    dist,
  };
  resultObj = messageApi.getChannelMessages(param);
  return resultObj;
};

export const getChannelSyncMessage = (roomID, startId) => {
  let resultObj;
  const param = {
    roomId: roomID,
    startId,
    loadCnt: 1000,
    dist: 'BEFORE',
  };

  resultObj = messageApi.getChannelMessages(param);
  return resultObj;
};

export const getNotice = (roomID, startId, dist) => {
  let resultObj;
  const param = {
    roomID,
    startId,
    loadCnt: 100,
    dist,
    isNotice: true,
  };

  // TODO: 서버가 아닌 AppData 에서 조회하도록 변경 필요
  // TODO: AppData 저장 여부값 조건 추가 필요
  /*if (DEVICE_TYPE == 'd') {
    resultObj = evalConnector({
      method: 'sendSync',
      channel: 'req-get-messages',
      message: param,
    });
  } else {*/
  resultObj = messageApi.getNotice(param);
  /*}*/

  return resultObj;
};

export const openMsgUtilBox = (messageData, dispatch) => {
  if (messageData === null || messageData === undefined) return null;

  dispatch(
    changeModal({
      modalData: {
        closeOnTouchOutside: true,
        type: 'msgExtension',
        messageData: messageData,
      },
    }),
  );

  dispatch(openModal());
};

export const getAttribute = tag => {
  const attrPattern = new RegExp(
    /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/,
    'gi',
  );
  let attrs = {};
  const match = tag.match(attrPattern);

  if (match?.length) {
    match.forEach(item => {
      try {
        const key = item.split('=')[0];
        let value = decodeURIComponent(item.split('=')[1]);

        if (
          (value[0] === '"' && value[value.length - 1] === '"') ||
          (value[0] === "'" && value[value.length - 1] === "'")
        ) {
          value = value.substring(1, value.length - 1);
        }
        attrs[key] = value;
      } catch (e) {}
    });
  }
  return attrs;
};
