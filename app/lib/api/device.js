import { managersvr } from '@API/api';

export const addDevice = params => {
  return managersvr('post', '/na/nf/device/set.do', params);
};
