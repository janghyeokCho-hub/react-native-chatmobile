import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';

import { chatsvr, managesvr } from '@API/api';
import { getAesUtil } from '@/lib/AesUtil';
import { Platform } from 'react-native';

/**
 * 2021.01.19
 * 1. useMACAddress = true
 * Request Header의 'Covi-User-Device-MAC' 필드에 MAC Address 추가
 *
 * 2. useMACEncryption = true
 * Request Header 추가시 MAC Address 값 암호화
 */
const defaultFlag = {
  useMACAddress: true,
  useMACEncryption: true,
};

async function _loginRequest(
  method,
  path,
  params,
  { useMACAddress, useMACEncryption } = defaultFlag,
) {
  const AESUtil = getAesUtil();
  if (useMACAddress) {
    try {
      // Get MAC Address
      const addr = await DeviceInfo.getMacAddress();
      let addrString;

      if (!addr || addr === '02:00:00:00:00:00' || Platform.OS === 'ios') {
        // MAC Address 획득이 불가능한 경우 (모듈 자체문제 or iOS)
        addrString = DeviceInfo.getUniqueId();
      } else if (Platform.OS === 'android') {
        // Android
        addrString = addr.split(':').join('');
      }
      /**
       * 2021.01.19
       * encrypt 호출 전 암호화에 필요한 값 존재하는지 체크 (singleton object 확인 필요함)
       * AESUtil.keySize
       * AESUtil.salt
       * AESUtil.passPhrase
       */
      const headers = {};
      if (useMACEncryption && AESUtil.keySize) {
        // console.log('MAC Encryption(On) : MAC Address in Request Param');
        // params['Covi-User-Device-MAC'] = AESUtil.encrypt(addrString);
        // console.log('request param  ', params);
        console.log('MAC Encryption(On) : MAC Address in Request Header');
        headers['Covi-User-Device-MAC'] = AESUtil.encrypt(addrString);
        console.log('request header  ', headers);
      } else {
        //암호화가 안될경우
        console.log('MAC Encryption(Off) : MAC Address in Rqeuest Header');
        headers['Covi-User-Device-MAC'] = addrString;
        console.log('request header  ', headers);
      }

      return managesvr(method, path, params, headers);
    } catch (err) {
      /**
       * 2021.01.19
       * MAC Address 모듈에 문제가 발생하면 요청실패 메시지 반환 (임시)
       */
      console.log('Cannot get MAC Address ', err);
      return {
        status: 'FAIL',
        result: 'Cannot get MAC Address',
      };
    }
  } else {
    return managesvr(method, path, params);
  }
}

/**
 * 2021.01.19
 * 1. useMACAddress = true
 * Request Header의 'Covi-User-Device-MAC' 필드에 MAC Address 추가
 *
 * 2. useMACEncryption = true
 * Request Header 추가시 MAC Address 값 암호화
 */
export const loginRequest = async params => {
  return _loginRequest('post', '/na/m/login', params, {
    /**
     * 2021.01.21
     * MAC Address 전송 활성화시 true로 변경하기
     */
    useMACAddress: true,
    useMACEncryption: true,
  });
};

export const extLoginRequest = params => {
  return _loginRequest('post', '/na/m/extlogin', params, {
    // useMACAddress 비활성화시 useMACEncryption 사용 안함
    useMACAddress: true,
    useMACEncryption: true,
  });
};

export const logoutRequest = params => {
  return chatsvr('post', '/logout', params);
};

export const tokencheckRequest = params => {
  return managesvr('post', '/na/m/v/k', params);
};

export const accessTokenCheck = params => {
  return managesvr('post', '/na/token/validation', params);
};

export const saveLocalStorage = async ({ token, accessid }) => {
  await AsyncStorage.setItem('covi_user_access_token', token);
  await AsyncStorage.setItem('covi_user_access_id', accessid);
};

export const getSystemConfigSaaS = params => {
  return managesvr('post', '/na/saas/config', params);
};

export const getFilePermission = ({ userId }) => {
  return managesvr('get', `/file/permission/${userId}`);
};
