// lib\room.js
import { chatsvr, managesvr } from '@API/api';

export const getChannelList = params => {
  return managesvr('get', `/channel/joinList/${params.userId}`);
};

export const getUChannelList = params => {
  let url = '/channels';
  url = `${url}/${params.updateList.join(',')}`;
  return chatsvr('get', url);
};

export const getChannelCategoryList = () => {
  return managesvr('get', `/channel/categoryList`);
};

export const getChannelCategoryListForSaaS = params => {
  return managesvr('get', `/channel/categoryList/${params.companyCode}`);
};

export const sendChannelMessage = params => {
  return chatsvr('post', 'channel/message', params);
};

export const searchChannel = params => {
  if (!params) {
    return;
  }
  if (params.companyCode) {
    return managesvr(
      'get',
      `/channel/search/${params.type}?value=${params.value}&companyCode=${
        params.companyCode
      }`,
    );
  } else {
    return managesvr(
      'get',
      `/channel/search/${params.type}?value=${params.value}`,
    );
  }
};

export const getChannelInfo = params => {
  return chatsvr('post', `/channel/${params.roomId}`, params);
};

export const getChannelNotice = params => {
  return managesvr(
    'get',
    `/channel/messages/notice/${params.roomId}/${params.method}`,
  );
};

export const createChannel = params => {
  return chatsvr('post', '/channel/room', params);
};

export const uploadChannelIcon = params => {
  return chatsvr('post', `/channel/room/icon`, params, {
    'Content-Type': 'multipart/form-data',
  });
};

export const joinChannel = params => {
  return chatsvr('post', `/channel/join/${params.roomId}`, params);
};

export const leaveChannel = params => {
  return chatsvr(
    'delete',
    `/channel/room/${params.roomId}/${params.userId}`,
    params,
  );
};

export const inviteMember = params => {
  return chatsvr('put', `/channel/room/${params.roomId}`, params);
};

export const modifyChannelName = params => {
  return chatsvr('put', `/channel/${params.roomId}/roomName`, params);
};

export const modifyChannelInfo = params => {
  return managesvr('put', `/channel/${params.roomId}/roomInfo`, params);
};

export const modifyMemberAuth = params => {
  return chatsvr('put', `/channel/roomMember/auth/${params.roomId}`, params);
};

// ??????
export const setChannelNotice = params => {
  return chatsvr('post', '/channel/notice/message', params);
};

// ?????? ????????? ??????????????? ??????
export const getExternalUser = params => {
  return managesvr('get', `/channel/room/${params}/extuser`);
};

// ?????? ????????? ??????????????? ??????
export const delExternalUser = params => {
  return managesvr('delete', `/channel/room/${params.roomId}/extuser`, params);
};

// ??????????????? ????????? ?????? ??? ?????? ??????
export const checkExternalUser = params => {
  return managesvr(
    'post',
    `/channel/room/${params.roomId}/extuser/check`,
    params,
  );
};

// ??????????????? ?????? ?????? ??????
export const sendExternalUser = params => {
  return managesvr(
    'post',
    `/channel/room/${params.roomId}/extuser/send`,
    params,
  );
};
