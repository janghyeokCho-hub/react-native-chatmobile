import axios from 'axios';
import { getServer } from '@/config';
import cheerio from 'cheerio-without-node-native';
import VersionCheck from 'react-native-version-check';

import * as LoginInfo from '@/lib/class/LoginInfo';
import * as dbAction from '@/lib/appData/action';
import { cancel } from '@redux-saga/core/effects';

const APP_VERSION = VersionCheck.getCurrentVersion();

export const chatsvr = (method, url, params, headers) => {
  const CHAT_SERVER = getServer('CHAT');

  return axios({
    method: method,
    url: `${CHAT_SERVER}${url}`,
    data: params,
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
  });
};

export const managesvr = (
  method,
  url,
  params,
  headers,
  onSubmitCancelToken,
) => {
  const MANAGE_SERVER = getServer('MANAGE');

  if (method == 'post') {
    if (headers && 'Content-Type' in headers) {
      if (headers['Content-Type'] == 'multipart/form-data') {
        let cancelTokenSource = axios.CancelToken.source();

        onSubmitCancelToken?.(cancelTokenSource);

        return axios.post(`${MANAGE_SERVER}${url}`, params, {
          headers: {
            responseType: 'json',
            Accept: 'application/json',
            'Covi-User-Access-Version': APP_VERSION,
            'Covi-User-Access-Token': LoginInfo.getLoginInfo().getToken(),
            'Covi-User-Access-ID': LoginInfo.getLoginInfo().getAccessID(),
            'Covi-User-Device-Type': 'covision.mobile.app',
            ...headers,
          },
          cancelToken: cancelTokenSource.token,
        });
      }
    }
    return axios.post(`${MANAGE_SERVER}${url}`, params, {
      headers: {
        responseType: 'json',
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Covi-User-Access-Version': APP_VERSION,
        'Covi-User-Access-Token': LoginInfo.getLoginInfo().getToken(),
        'Covi-User-Access-ID': LoginInfo.getLoginInfo().getAccessID(),
        'Covi-User-Device-Type': 'covision.mobile.app',
        ...headers,
      },
    });
  }
  return axios({
    method: method,
    url: `${MANAGE_SERVER}${url}`,
    data: params,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'Covi-User-Access-Version': APP_VERSION,
      'Covi-User-Access-Token': LoginInfo.getLoginInfo().getToken(),
      'Covi-User-Access-ID': LoginInfo.getLoginInfo().getAccessID(),
      'Covi-User-Device-Type': 'covision.mobile.app',
      ...headers,
    },
  });
};

export const managersvr = (method, url, params, headers) => {
  const MANAGER_SERVER = getServer('MANAGER');

  return axios({
    method: method,
    url: `${MANAGER_SERVER}${url}`,
    data: params,
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
  });
};

export const filesvr = (
  method,
  url,
  params,
  headers,
  responseType = 'blob',
) => {
  const MANAGE_SERVER = getServer('MANAGE');
  return axios({
    method: method,
    url: `${MANAGE_SERVER}${url}`,
    data: params,
    responseType,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Covi-User-Access-Version': APP_VERSION,
      'Covi-User-Access-Token': LoginInfo.getLoginInfo().getToken(),
      'Covi-User-Access-ID': LoginInfo.getLoginInfo().getAccessID(),
      'Covi-User-Device-Type': 'covision.mobile.app',
      ...headers,
    },
  });
};

export const imgsvr = (method, url, params, headers) => {
  const MANAGE_SERVER = getServer('MANAGE');
  return axios({
    method: method,
    url: `${MANAGE_SERVER}${url}`,
    data: params,
    responseType: 'arraybuffer',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Covi-User-Access-Version': APP_VERSION,
      'Covi-User-Access-Token': LoginInfo.getLoginInfo().getToken(),
      'Covi-User-Access-ID': LoginInfo.getLoginInfo().getAccessID(),
      'Covi-User-Device-Type': 'covision.mobile.app',
      ...headers,
    },
  });
};

export const reqThumbnail = token => {
  const MANAGE_SERVER = getServer('MANAGE');
  const catk = encodeURIComponent(LoginInfo.getLoginInfo().getToken());
  // const catk = LoginInfo.getLoginInfo().getToken();
  return `${MANAGE_SERVER}/na/nf/thumbnail/${token}`;
};

export const reqImage = token => {
  const MANAGE_SERVER = getServer('MANAGE');
  return `${MANAGE_SERVER}/na/nf/image/${token}`;
};

export const linkPreview = (url, callback, messageId) => {
  axios
    .head(url)
    .then(({ headers }) => {
      // response type ??? html ??? ???????????? link ??????
      if (headers['content-type'].indexOf('text/html') > -1) {
        axios
          .get(url)
          .then(response => {
            const $ = cheerio.load(response.data);
            const hostPattern = /^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/i;
            const graphData = $('head>meta[property^="og:"]');
            let returnObj = null;
            let graphObj = {};

            if (graphData != null && graphData.length > 0) {
              graphData.each((i, elm) => {
                let key = $(elm)
                  .attr('property')
                  .replace('og:', '');
                let content = $(elm).attr('content');
                graphObj[key] = content;
              });
            }

            graphObj.domain = url.replace(hostPattern, '$2://$3');

            if (!Object.prototype.hasOwnProperty.call(graphObj, 'title')) {
              // title??? ?????? ??? ???????????? title ??????
              graphObj.title = $('title').text();
            }

            if (
              !Object.prototype.hasOwnProperty.call(graphObj, 'description')
            ) {
              // description ?????? ??? ???????????? description ??????
              const desc = $('[name="description"]');
              if (desc != null && desc.length > 0) {
                graphObj.description = desc.first().attr('content');
              } else {
                graphObj.description = '????????? ?????? ????????? ???????????????';
              }
            }

            if (Object.prototype.hasOwnProperty.call(graphObj, 'title')) {
              returnObj = {
                link: url,
                thumbNailInfo: graphObj,
              };

              // link info
              callback(returnObj);

              dbAction.updateLinkInfo(messageId, returnObj);
            } else {
              callback(null);
              dbAction.updateLinkInfo(messageId, {});
            }
          })
          .catch(() => {
            callback(null);
            dbAction.updateLinkInfo(messageId, {});
          });
      } else {
        callback(null);
        dbAction.updateLinkInfo(messageId, {});
      }
    })
    .catch(e => {
      callback(null);
      dbAction.updateLinkInfo(messageId, {});
    });
};
