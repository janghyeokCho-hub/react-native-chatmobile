import { getAllUserWithGroupList } from '@/lib/api/room';
import { eumTalkRegularExp, convertEumTalkProtocolPreview } from '@/lib/common';
import { getDic } from '@/config';
import { createRoom } from '@API/room';
import { sendMessage, sendChannelMessage, shareFile } from '@API/message';
import { isJSONStr } from '@/lib/common';

const makeMessage = async msg => {
  const flag = eumTalkRegularExp.test(msg);
  if (flag) {
    const convertedMessage = convertEumTalkProtocolPreview(msg);
    if (!convertedMessage?.message) {
      return msg;
    }
    return convertedMessage.message;
  } else {
    return msg;
  }
};

export const makeParams = async ({
  selectTab,
  messageData,
  shareTarget,
  roomList,
  userId,
}) => {
  // type의 정의
  // UR : 유저
  // GR : 부서
  // CR : 채팅방 또는 채널
  try {
    const messageText = await makeMessage(messageData.context);
    let params = {
      name: '',
      messageType: 'N',
      status: 'send',
      type: 'CR',
      message: messageText,
      context: messageText,
      fileInfos: messageData.fileInfos,
      sendFileInfo: null,
      linkInfo: null,
      sender: userId,
    };

    switch (selectTab) {
      case 'orgchart':
        let inviteMembers = [];
        const groupIds = shareTarget
          .filter(item => item.type === 'G')
          .map(item => item.id);
        if (groupIds.length) {
          // 선택한 부서에 해당되는 유저 ID List
          const { data } = await getAllUserWithGroupList(groupIds);
          const { result, status } = data;

          if (status !== 'SUCCESS') {
            return {
              status: 'FAIL',
              message: getDic(
                'Msg_Error',
                '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
              ),
            };
          }

          if (status === 'SUCCESS' && (!result || !result.length)) {
            // 선택한 부서에 사람이 없을 경우
            return {
              status: 'FAIL',
              message: getDic(
                'Msg_NoUsersDepartment',
                '선택된 부서에 사용자가 없습니다.',
              ),
            };
          }

          if (result && result.length) {
            // 부서를 선택할 경우 type = 'GR'
            params.type = 'GR';
            params.groupCode = groupIds[0];
            inviteMembers = inviteMembers.concat(result);
            inviteMembers = inviteMembers.filter(
              (item, idx) =>
                inviteMembers.findIndex(i => i.id === item.id) === idx,
            );
          }
        }

        inviteMembers = inviteMembers.concat(
          shareTarget.filter(item => item.type === 'U' && item.isShow === true),
        );

        // 자기 자신의 ID 추가
        const targetMembers = inviteMembers.map(item => item.id);
        if (!targetMembers.includes(userId)) {
          targetMembers.push(userId);
        }

        if (inviteMembers.length > 1) {
          // 선택한 대상이 2명 이상일 경우 채팅방을 새로 만든다.
          params.targetType = 'NEWROOM';
          params.type = 'UR';
          params.memberType = 'G';
          params.roomType = 'G';
          params.members = targetMembers;
          params.targets = targetMembers.join(';');
        } else {
          const target = roomList.filter(r => {
            if (userId === shareTarget[0].id) {
              return r.roomType === 'O';
            } else {
              return r.roomType === 'M' && r.targetCode === shareTarget[0].id;
            }
          })[0];

          params.targets = targetMembers.join(';');
          if (target) {
            params.targetType = 'CHAT';
            params = {
              ...params,
              ...target,
            };
          } else {
            params.targetType = 'NEWROOM';
            params.type = 'UR';
            params.roomType = userId === shareTarget[0].id ? 'O' : 'M';
            params.members = targetMembers;
          }
        }
        break;
      case 'chat':
        params.roomID = shareTarget[0].roomID;
        params.roomType = shareTarget[0].roomType;
        params.realMemberCnt = shareTarget[0].realMemberCnt;
        params.targetType = 'CHAT';
        break;
      case 'channel':
        params.roomID = shareTarget[0].roomId;
        params.roomType = 'C';
        params.targetArr = [];
        params.tempId = shareTarget[0].roomId * 10000;
        params.targetType = 'CHANNEL';
        break;
    }
    return { status: 'SUCCESS', params };
  } catch (err) {
    console.error(err);

    return {
      status: 'ERROR',
      message: getDic(
        'Msg_Error',
        '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
      ),
    };
  }
};

export const handleMessage = async params => {
  let response;
  let msg = getDic('Msg_ForwardingWasSuccessful', '전달에 성공 하였습니다.');
  try {
    switch (params.targetType) {
      case 'CHAT':
        response = await sendMessage(params);
        break;
      case 'CHANNEL':
        response = await sendChannelMessage(params);
        break;
      case 'NEWROOM':
        response = await createRoom(params);
        break;
    }
    const { status } = response.data;
    if (status !== 'SUCCESS') {
      msg = getDic('Msg_ForwardingWasFailed', '전달에 실패 하였습니다.');
    }
    return { status, message: msg };
  } catch (err) {
    console.error(err);
    return {
      status: 'ERROR',
      message: getDic(
        'Msg_Error',
        '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
      ),
    };
  }
};

export const handleShareFile = async params => {
  let fileInfos = JSON.parse(params.fileInfos);
  let msg = getDic('Msg_ForwardingWasSuccessful', '전달에 성공 하였습니다.');
  if (!Array.isArray(fileInfos)) {
    // 단일 파일일 경우 Array 로 변환 후 전송하기 위함
    fileInfos = new Array(fileInfos);
  }
  params.fileInfos = JSON.stringify(fileInfos);

  try {
    const formData = new FormData();
    formData.append('type', params.type);
    formData.append('groupCode', params.groupCode);
    formData.append('roomID', params.roomID);
    formData.append('roomType', params.roomType);
    formData.append('fileInfos', params.fileInfos);
    formData.append('targets', params.targets);
    const { data } = await shareFile(formData);
    if (data.state !== 'SUCCESS') {
      msg = getDic('Msg_ForwardingWasFailed', '전달에 실패 하였습니다.');
      return { status: data.state, message: msg };
    }
    params.roomID = data.roomID;
    params.roomType = data.roomType;
    params.fileInfos = JSON.stringify(data.fileInfos);
    // 파일 전송의 경우 서버에서 채팅방 생성 후 파일 업로드까지 진행
    params.targetType =
      params.targetType === 'NEWROOM' ? 'CHAT' : params.targetType;
    return await handleMessage(params);
  } catch (err) {
    console.error(err);
    return {
      status: 'ERROR',
      message: getDic(
        'Msg_Error',
        '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
      ),
    };
  }
};

export const isEmptyObj = obj => {
  if (obj?.constructor === Object && Object.keys(obj).length === 0) {
    return true;
  }
  return false;
};

export const getSettings = (item, type) => {
  let setting = {};

  if (!item) {
    return setting;
  }

  const key = type === 'CHANNEL' ? 'settingJSON' : 'setting';
  if (typeof item[key] === 'object') {
    setting = { ...item[key] };
  } else if (isJSONStr(item[key])) {
    setting = JSON.parse(item[key]);
  }
  return setting;
};
