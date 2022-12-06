import React, { useState, useLayoutEffect } from 'react';
import {
  checkBiometricsAvailable,
  requireBiometricsAuthentication,
} from '@/lib/util/biometricsUtil';

const BiometricsContainer = ({ bioAuthSuccessEventHandler }) => {
  const [bioCheckFlag, setBioCheckFlag] = useState(false);

  useLayoutEffect(() => {
    /* 생체인증 지원여부 검사 */
    checkBiometricsAvailable().then(available => {
      setBioCheckFlag(available);
    });
  }, []);

  useLayoutEffect(() => {
    /* 생체인증 미지원시 생체인증 생략 */
    if (!bioCheckFlag) {
      return;
    }

    requireBiometricsAuthentication()
      .then(authResult => {
        bioAuthSuccessEventHandler(authResult);
      })
      .catch(() => {
        bioAuthSuccessEventHandler(false);
      });
  }, [bioCheckFlag, bioAuthSuccessEventHandler]);

  return <></>;
};

export default BiometricsContainer;
