import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import { logoutRequest } from '@/lib/api/login';
import VersionCheck from 'react-native-version-check';
import { Platform } from 'react-native';

let configInstance = {};

const APP_VERSION = VersionCheck.getCurrentVersion();

export const initConfig = async (domain, configs) => {
  let parseConfigs = null;
  if (typeof configs != 'object') {
    parseConfigs = JSON.parse(configs);
  } else {
    parseConfigs = configs;
  }

  // setting 설정 정보 load
  let lang = await AsyncStorage.getItem('covi_user_lang');
  let theme = await AsyncStorage.getItem('covi_user_theme');
  let jobInfo = await AsyncStorage.getItem('covi_user_jobInfo');
  let fontSize = await AsyncStorage.getItem('covi_user_fontSize');

  // lang, theme, jobInfo 기본값 맵핑
  if (parseConfigs.config) {
    if (!lang) {
      lang = parseConfigs.config.DefaultClientLang || 'ko';
      AsyncStorage.setItem('covi_user_lang', lang);
    }
    if (!theme) {
      theme = parseConfigs.config.DefaultTheme || 'blue';
      AsyncStorage.setItem('covi_user_theme', theme);
    }
    if (!jobInfo) {
      jobInfo = parseConfigs.config.DefaultClientJobInfo || 'PN';
      AsyncStorage.setItem('covi_user_jobInfo', jobInfo);
    }

    if (!fontSize) {
      fontSize = parseConfigs.config.DefaultFontSize || 'm';
      AsyncStorage.setItem('covi_user_fontSize', fontSize);
    }
  } else {
    if (!lang) {
      lang = 'ko';
    }
    if (!theme) {
      theme = 'blue';
    }
    if (!jobInfo) {
      jobInfo = 'PN';
    }

    if (!fontSize) {
      fontSize = 'm';
    }
  }
  configInstance = {
    serverURL: {
      HOST: domain,
      CHAT: `${domain}/server`,
      MANAGE: `${domain}/restful`,
      MANAGER: `${domain}/manager`,
      EVENT: `${domain}`,
    },
    setting: {
      lang,
      theme,
      jobInfo,
      fontSize,
    },
    config: {
      ...parseConfigs.config,
    },
    dic: {
      ...parseConfigs.dic,
    },
  };
};

export const getServerConfigs = async domain => {
  const lang = (await AsyncStorage.getItem('covi_user_lang')) || undefined;
  return axios({
    method: 'get',
    url: `${domain}/restful/na/nf/config`,
    params: {
      lang,
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'Covi-User-Access-Version': APP_VERSION,
      'Covi-User-Device-Type': 'covision.mobile.app',
    },
  });
};

export const getServerDictionary = (domain, lang) => {
  return axios({
    method: 'get',
    url: `${domain}/restful/na/nf/config`,
    params: {
      lang,
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'Covi-User-Access-Version': APP_VERSION,
      'Covi-User-Device-Type': 'covision.mobile.app',
    },
  });
};

export const getVersionInfo = (domain) => {
  return axios({
    method: 'get',
    url: `${domain}/restful/na/nf/updates/mobile/latest?p=mobile&a=${Platform.OS}`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'Covi-User-Access-Version': APP_VERSION,
      'Covi-User-Device-Type': 'covision.mobile.app',
    },
  });
};

export const getServer = key => {
  if (configInstance && configInstance.serverURL) {
    const searchConfig = search(configInstance.serverURL, key);
    if (searchConfig != undefined) return searchConfig;
  }
  return '';
};

export const getConfig = (key, defaultValue) => {
  if (configInstance && configInstance.config) {
    const searchConfig = search(configInstance.config, key);
    if (searchConfig != undefined) return searchConfig;
  }
  return defaultValue;
};

export const getSetting = (key, defaultValue) => {
  if (configInstance && configInstance.setting) {
    const searchConfig = search(configInstance.setting, key);
    if (searchConfig != undefined) return searchConfig;
  }
  return defaultValue;
};

export const getDic = (key, defaultValue) => {
  if (configInstance && configInstance.dic) {
    const searchConfig = search(configInstance.dic, key);
    /**
     * 2021.02.15 v1 react-native에서 HTML <br>태그의 개행처리를 위해 \n으로 변환처리
     * 2022.10.21 v2
     * '<br>'
     * '<br/>'
     * '<br />'
     * => '\n'
     */
    if (searchConfig !== undefined) {
      return searchConfig.replace(/<br\s?\/?>/g, '\n');
    }
  }
  return defaultValue;
};

const search = (object, key) => {
  let path = key.split('.');
  for (let i = 0; i < path.length; i++) {
    if (object[path[i]] === undefined) {
      return undefined;
    }
    object = object[path[i]];
  }
  return object;
};

export const initHostInfo = () => {
  return new Promise((resolve, reject) => {
    const removeHost = async () => {
      const token = await AsyncStorage.getItem('covi_user_access_token');
      const id = await AsyncStorage.getItem('covi_user_access_id');
      if (token) {
        const response = await logoutRequest({ token, id });
      }

      // host info 삭제
      AsyncStorage.removeItem('EHINF');
      AsyncStorage.removeItem('covi_user_jobInfo');
    };
    try {
      removeHost();
      resolve(true);
    } catch (e) {
      reject(false);
    }
  });
};
