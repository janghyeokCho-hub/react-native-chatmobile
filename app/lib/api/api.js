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
  // console.log(`chatsvr ${method} ${CHAT_SERVER}${url} 1'${LoginInfo.getLoginInfo().getToken()}' 2'${LoginInfo.getLoginInfo().getAccessID()}'`)

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

        if(typeof onSubmitCancelToken === 'function')
          onSubmitCancelToken(cancelTokenSource);

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

export const filesvr = (method, url, params, headers) => {
  const MANAGE_SERVER = getServer('MANAGE');
  return axios({
    method: method,
    url: `${MANAGE_SERVER}${url}`,
    data: params,
    responseType: 'blob',
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
  return `${MANAGE_SERVER}/na/nf/thumbnail/${token}?catk=${catk}`;
};

export const reqImage = token => {
  const MANAGE_SERVER = getServer('MANAGE');
  return `${MANAGE_SERVER}/na/nf/image/${token}?catk=${LoginInfo.getLoginInfo().getToken()}`;
};

export const linkPreview = (url, callback, messageId) => {
  axios
    .head(url)
    .then(({ headers }) => {
      // response type 이 html 일 경우에만 link 해석
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
              // title이 없을 시 페이지의 title 입력
              graphObj.title = $('title').text();
            }

            if (
              !Object.prototype.hasOwnProperty.call(graphObj, 'description')
            ) {
              // description 없을 시 페이지의 description 입력
              const desc = $('[name="description"]');
              if (desc != null && desc.length > 0) {
                graphObj.description = desc.first().attr('content');
              } else {
                graphObj.description = '여기를 눌러 링크를 확인하세요';
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
