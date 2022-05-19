import axios from 'axios';
import VersionCheck from 'react-native-version-check';
import { getConfig, getServer } from '@/config';
import * as LoginInfo from '@/lib/class/LoginInfo';

const APP_VERSION = VersionCheck.getCurrentVersion();

export const sendViewerServer = async ({
  fileType = 'URL',
  filePath,
  fileId,
}) => {
  const synapURL = getConfig('SynapDocViewServer', null);
  if (synapURL === null) {
    return;
  }
  const reqOption = {
    method: 'get',
    url: synapURL,
    params: {
      fileType,
      filePath,
      fid: fileId,
    },
    responseType: 'json',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json; charset=utf-8',
      'Covi-User-Access-Version': APP_VERSION,
      'Covi-User-Access-Token': LoginInfo.getLoginInfo().getToken(),
      'Covi-User-Access-ID': LoginInfo.getLoginInfo().getAccessID(),
      'Covi-User-Device-Type': 'covision.mobile.app',
    },
  };
  return axios(reqOption);
};
