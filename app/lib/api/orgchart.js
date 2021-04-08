import { managesvr } from '@API/api';

export const getOrgChart = ({ deptID, companyCode }) => {
  if (companyCode) return managesvr('get', `/org/${deptID}/gr/${companyCode}`);
  else return managesvr('get', `/org/${deptID}/gr/GENERAL`);
};

export const searchOrgChart = ({ userID, value, type }) => {
  let param = `value=${encodeURIComponent(value)}`;
  if (type) {
    param += `&type=${encodeURIComponent(type)}`;
  }
  return managesvr('get', `/org/search/${userID}?${param}`);
};
