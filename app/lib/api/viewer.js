import axios from 'axios';
import { getServer } from '@/config';
import cheerio from 'cheerio-without-node-native';
import VersionCheck from 'react-native-version-check';

import * as LoginInfo from '@/lib/class/LoginInfo';
import * as dbAction from '@/lib/appData/action';

import AsyncStorage from '@react-native-community/async-storage';

const APP_VERSION = VersionCheck.getCurrentVersion();

export const sendViewerServer = async (method, url, params, headers) => {
  let token = await AsyncStorage.getItem('covi_user_access_token');
  token = token.replace(/\^/gi, '-');
  const VIEWER_SERVER = getServer('MANAGE');
  let filePath = `${VIEWER_SERVER}/na/nf/synabDownload/${
    params.token
  }/${token}`;

  const tempurl = `?fileType=URL&filePath=${filePath}&fid=${params.token}`;

  const reqOption = {
    method: method,
    url: `${url}${tempurl}`,
    responseType: 'json',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'Covi-User-Access-Version': APP_VERSION,
      'Covi-User-Access-Token': LoginInfo.getLoginInfo().getToken(),
      'Covi-User-Access-ID': LoginInfo.getLoginInfo().getAccessID(),
      'Covi-User-Device-Type': 'covision.mobile.app',
      ...headers,
    },
  };
  return axios(reqOption);
};
