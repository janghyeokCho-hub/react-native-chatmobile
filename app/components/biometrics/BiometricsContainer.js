import React, { useState, useEffect } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';

const BiometricsContainer = ({ bioAuthSuccessEventHandler }) => {
  const [bioCheckFlag, setBioCheckFlag] = useState(false);
  useEffect(() => {
    if (!bioCheckFlag) {
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

      ReactNativeBiometrics.simplePrompt({
        promptMessage: 'Confirm fingerprint',
      })
        .then(resultObject => {
          const { success } = resultObject;

          bioAuthSuccessEventHandler(success);
          setBioCheckFlag(true);
        })
        .catch(error => {
          alert(
            '지문 인식을 사용할 수 없습니다.\r\n앱 종료 후 다시 인식해주세요.',
          );
          console.log('biometrics failed > ', error);
        });
    }
  }, []);

  return <></>;
};

export default BiometricsContainer;
