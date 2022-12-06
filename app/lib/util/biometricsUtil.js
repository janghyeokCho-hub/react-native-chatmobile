import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-community/async-storage';

const STORAGE_KEY = 'LASTEST_BIOMETRICS_AUTH_TIME';
const EPOCH_TIME = 3000; // 생체인증 성공 유효시간

export async function checkBiometricsAvailable() {
  try {
    const {
      available,
      biometryType,
      error,
    } = await ReactNativeBiometrics.isSensorAvailable();
    console.log(`${available} / ${biometryType}`);
    if (!available || error) {
      console.log('Biometrics is not available: ', error);
      return false;
    }
    // 생체인증 지원여부 state에 저
    switch (biometryType) {
      case ReactNativeBiometrics.TouchID:
      case ReactNativeBiometrics.FaceID:
      case ReactNativeBiometrics.Biometrics:
        console.log('Biometrics supports - ', biometryType);
        break;
      default:
        console.log('Biometrics is not supported: ', biometryType);
    }
    return available;
  } catch (err) {
    console.log('checkBiometricsAvailable error: ', err);
    return false;
  }
}

export async function lastAuthenticationExpired() {
  const lastAuthDate = Number(await AsyncStorage.getItem(STORAGE_KEY));
  const currentDate = Date.now();
  if (isNaN(lastAuthDate) || lastAuthDate <= 0) {
    return true;
  }
  return currentDate - lastAuthDate > EPOCH_TIME;
}

export async function updateLastAuthenticationDate(date = Date.now()) {
  // AsyncStorage.setItem 에러 방지를 위해 string 변환처리
  if (typeof date !== 'string') {
    date = JSON.stringify(date);
  }
  return await AsyncStorage.setItem(STORAGE_KEY, date);
}

export async function requireBiometricsAuthentication(force = false) {
  try {
    const expired = await lastAuthenticationExpired();
    /* 마지막 생체인증 시간이 아직 유효한 경우 생체인증 생략 */
    if (expired === false && force === false) {
      // 생체인증 생략
      return true;
    }
    // 생체인증 시작
    const promptResult = await ReactNativeBiometrics.simplePrompt({
      promptMessage: 'Confirm fingerprint',
    });
    const { success } = promptResult;
    if (success) {
      // 마지막 생체인증 성공시간 기록
      await updateLastAuthenticationDate();
    }
    // 생체인증 완료
    return success;
  } catch (error) {
    console.log('biometrics failed > ', error);
  }
  return false;
}
