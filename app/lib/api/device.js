import { managersvr } from '@API/api';

export const addDevice = params => {
  return managersvr('post', '/na/device/set.do', params);
};
