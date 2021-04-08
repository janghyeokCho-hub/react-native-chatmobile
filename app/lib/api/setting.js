import { managesvr } from '@API/api';

export const modifyUserPassword = params => {
  return managesvr('put', '/login/change/password', params);
};

export const modifyUserProfileImage = params => {
  return managesvr('post', '/user/profile/img', params, {
    'Content-Type': 'multipart/form-data',
  });
};

export const modifyUserInfo = params => {
  return managesvr('post', '/user/preferences', params);
};

export const getNotification = params => {
  return managesvr('post', '/user/notification/get', params);
};

export const modifyNotification = params => {
  return managesvr('post', '/user/notification', params);
};

export const getRoomNotification = (roomId, params) => {
  return managesvr('post', `/user/notification/room/${roomId}/get`, params);
};

export const modifyRoomNotification = (roomId, params) => {
  return managesvr('post', `/user/notification/room/${roomId}`, params);
};
