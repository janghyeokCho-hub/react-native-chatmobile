import { Platform } from 'react-native';
import userDefaults from 'react-native-user-defaults';
import SharedPreferences from 'react-native-shared-preferences';
import { getServer } from '@/config';

let loginInfo = null;

class LoginInfo {
  constructor(id, token, userInfo) {
    this.id = id;
    this.token = token;
    this.userInfo = userInfo;
    this.accessid = id;
  }

  getData = () => {
    return this;
  };

  getID = () => {
    return this.id;
  };

  getToken = () => {
    return this.token;
  };

  getAccessID = () => {
    return this.accessid;
  };
}

export const getLoginInfo = () => {
  if (!loginInfo) loginInfo = new LoginInfo();
  return loginInfo;
};

export const setData = (id, token, userInfo) => {
  loginInfo = new LoginInfo(id, token, userInfo);

  if (Platform.OS === 'ios') {
    userDefaults
      .set(
        'loginInfo',
        {
          id: id,
          token: token,
          host: getServer('HOST'),
          userInfo: userInfo,
          accessid: id,
        },
        'group.eumtalk',
      )
      .then((msg, data) => {
        // console.log('loginInfo setting success ( iOS :: userDefaults )');
      })
      .catch(() => {
        console.log('loginInfo setting failure ( iOS :: userDefaults )');
      });
  } else if (Platform.OS === 'android') {
    SharedPreferences.setItem(
      'loginInfo',
      JSON.stringify({
        id: id,
        accessid: id,
        token: token,
        host: getServer('HOST'),
        userInfo: userInfo,
      }),
    );
  }
};

export const isNull = () => {
  return loginInfo == null;
};

export const clearData = () => {
  if (loginInfo) loginInfo = null;

  return true;
};
