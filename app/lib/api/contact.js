import { chatsvr, managesvr } from '@API/api';

export const getContactList = params => {
  return managesvr('get', `/user/contact?deptCode=${params.DeptCode}`);
};

export const addContactList = params => {
  return managesvr('post', `/user/contact`, params);
};

export const deleteContactList = params => {
  return managesvr('delete', `/user/contact`, params);
};

export const getItemGroupOneDepth = params => {
  return managesvr(
    'get',
    `/user/contact/${params.folderID}/${params.folderType}`,
  );
};
