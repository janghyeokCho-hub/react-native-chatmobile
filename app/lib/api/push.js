import { managesvr } from '@API/api';

export const setPushToken = token => {
  return managesvr('post', '/post/token', token);
};
