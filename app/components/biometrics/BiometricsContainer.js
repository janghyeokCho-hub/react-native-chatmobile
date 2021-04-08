import React from 'react';
import { View, Text } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';

__DEV__ &&
  ReactNativeBiometrics.isSensorAvailable().then(resultObject => {
    const { available, biometryType, error } = resultObject;
    let supportCheckFlag = false;

    console.log(`${available} / ${biometryType} / ${error}`);

    if (error == 'BIOMETRIC_ERROR_NONE_ENROLLED') {
      console.log('지문 등록 ㄲ');
    }
    if (available && biometryType === ReactNativeBiometrics.TouchID) {
      console.log('TouchID is supported');
      supportCheckFlag = true;
    }
    if (available && biometryType === ReactNativeBiometrics.FaceID) {
      console.log('FaceID is supported');
      supportCheckFlag = true;
    }
    if (available && biometryType === ReactNativeBiometrics.Biometrics) {
      console.log('Biometrics is supported');
      supportCheckFlag = true;
    }
    if (!supportCheckFlag) {
      console.log('Biometrics not supported');
    }
  });

__DEV__ &&
  ReactNativeBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' })
    .then(resultObject => {
      const { success } = resultObject;

      if (success) {
        console.log('successful biometrics provided');
      } else {
        console.log('user cancelled biometric prompt');
      }
    })
    .catch(error => {
      alert('지문이 여러번 인식되어 잠겼습니다. 앱 종료 후 다시 인식해주세요.');
      console.log('biometrics failed > ', error);
    });

const BiometricsContainer = () => {
  return __DEV__ ? (
    <View>
      <Text>auth plz</Text>
    </View>
  ) : null;
};

export default BiometricsContainer;
