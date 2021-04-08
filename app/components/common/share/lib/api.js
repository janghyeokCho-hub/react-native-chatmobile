import axios from 'axios';

let serverUtilInstance = null;

class ServerUtil {
  constructor(id, host, token, userInfo) {
    this.host = host;
    this.token = token;
    this.userInfo = userInfo;
    this.id = id;
    this.chatAxios = makeAxios(`${host}/server`, token, id);
    this.restfulAxios = makeAxios(`${host}/restful`, token, id);
  }

  getChat(url, headers) {
    // getMethod body null
    return this.chatAxios('get', url, null, headers);
  }

  postChat(url, params, headers) {
    return this.chatAxios('post', url, params, headers);
  }

  getRestful(url, headers) {
    // getMethod body null
    return this.restfulAxios('get', url, null, headers);
  }

  postRestful(url, params, headers) {
    return this.restfulAxios('post', url, params, headers);
  }

  getUserInfo(key) {
    if (key in this.userInfo) return this.userInfo[key];
    else return '';
  }
}

const makeAxios = (makeHost, makeToken, makeID) => {
  const host = makeHost;
  const token = makeToken;
  const accessid = makeID;

  return (method, url, params, headers) => {
    const reqOptions = {
      method: method,
      url: `${host}${url}`,
      data: params,
      responseType: 'json',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Covi-User-Access-Token': token,
        'Covi-User-Access-ID': accessid,
        'Covi-User-Device-Type': 'covision.mobile.app',
        ...headers,
      },
    };

    return axios(reqOptions);
  };
};

export const makeServerUtil = ({ host, token, id, userInfo }) => {
  if (serverUtilInstance === null) {
    serverUtilInstance = new ServerUtil(id, host, token, userInfo);
  }
};

export const getServerUtil = () => {
  return serverUtilInstance;
};
