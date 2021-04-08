import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTargetUser } from '@/modules/presence';
import AsyncStorage from '@react-native-community/async-storage';

const PresenceContainer = () => {
  const { actionQue } = useSelector(({ presence }) => ({
    actionQue: presence.actionQue,
  }));

  const dispatch = useDispatch();

  const [delayFn, setDelayFn] = useState(null);

  useEffect(() => {
    return () => {
      setDelayFn(null);
    };
  }, []);

  useEffect(() => {
    // TODO: Presence 업데이트 시간 및 배열 사이즈에 대해 Config로 변경 필요
    if (actionQue.length > 0) {
      if (actionQue.length > 500) {
        if (delayFn !== null) {
          clearTimeout(delayFn);
          setDelayFn(null);
        }
        dispatch(setTargetUser());
      } else {
        if (delayFn === null)
          setDelayFn(
            setTimeout(async () => {
              const token = await AsyncStorage.getItem('covi_user_access_token');
              const id = await AsyncStorage.getItem('covi_user_access_id');
              
              if(token !== null && id !== null) {
                dispatch(setTargetUser());
              }
              setDelayFn(null);
            }, 10000),
          );
      }
    }
  }, [actionQue]);

  return null;
};

export default PresenceContainer;
