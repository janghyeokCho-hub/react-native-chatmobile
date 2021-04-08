import { chatsvr, managesvr } from '@API/api';

export const getProfileInfo = targetId => {
  return managesvr('get', `/profile/${targetId}`);
};
