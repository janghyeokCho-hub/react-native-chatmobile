import { managesvr } from '@API/api';
import { getJobInfo } from '@/lib/userSettingUtil';

export const getOrgChart = ({ deptID, companyCode }) => {
  if (companyCode) return managesvr('get', `/org/${deptID}/gr/${companyCode}`);
  else return managesvr('get', `/org/${deptID}/gr/GENERAL`);
};

export const searchOrgChart = async ({ userID, value, type }) => {
  const jobInfo = await getJobInfo();

  let param = `value=${encodeURIComponent(value)}&st=${jobInfo}`;
  if (type) {
    param += `&type=${encodeURIComponent(type)}`;
  }
  return managesvr('get', `/org/search/${userID}?${param}`);
};
