import { chatsvr, managesvr } from '@API/api';
import { getJobInfo } from '@/lib/userSettingUtil';

export const getContactList = async params => {
  const jobInfo = await getJobInfo();

  return managesvr(
    'get',
    `/user/contact?deptCode=${params.DeptCode}&st=${jobInfo}`,
  );
};

export const addContactList = params => {
  return managesvr('post', `/user/contact`, params);
};

export const modifyContactList = params => {
  return managesvr('put', `/user/contact`, params);
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

export const modiftyCustomGroupName = params => {
  return managesvr('put', '/user/contact/name', params);
};
