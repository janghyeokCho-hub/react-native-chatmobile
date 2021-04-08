import QuickActions from 'react-native-quick-actions';
import AsyncStorage from '@react-native-community/async-storage';
import { DeviceEventEmitter, Alert } from 'react-native';
import { exitApp } from '@/lib/device/common';
import { initHostInfo, getDic } from '@/config';
const initQuickActions = () => {
  // item 등록 처리
  setQuickActionItems();

  // event listener 등록
  addQuickActionEvtListener();
};
const initDomain = getDic('InitDomainInfo');
const initServerInfo = getDic('InitServerInfo');
const setQuickActionItems = () => {
  QuickActions.setShortcutItems([
    {
      type: 'INITEHINF', // Required
      title: initDomain != null ? initDomain : 'Domain Init', // Optional, if empty, `type` will be used instead
      icon: 'Shuffle', // Icons instructions below
      userInfo: {
        url: 'app://initehinf',
      },
    },
    {
      type: 'INITESETINF', // Required
      title: initServerInfo != null ? initServerInfo : 'Server Config Init', // Optional, if empty, `type` will be used instead
      icon: 'Invitation', // Icons instructions below
      userInfo: {
        url: 'app://initesetinf',
      },
    },
  ]);
};

const addQuickActionEvtListener = () => {
  const coldLaunchedWithAction = data => {
    if (data) {
      const { type, title, userInfo } = data;

      if (type == 'INITEHINF') {
        initializeEumHostInfo();
      } else if (type == 'INITESETINF') {
        initializeEumSettingInfo();
      }
    }
  };

  // To get any actions sent when the app is cold-launched
  QuickActions.popInitialAction()
    .then(coldLaunchedWithAction)
    .catch(console.error);

  DeviceEventEmitter.addListener('quickActionShortcut', data => {
    const { type, title, userInfo } = data;
    if (type == 'INITEHINF') {
      initializeEumHostInfo();
    } else if (type == 'INITESETINF') {
      initializeEumSettingInfo();
    }
  });
};

const initializeEumHostInfo = async () => {
  const host = await AsyncStorage.getItem('EHINF');
  if (host) {
    const result = await initHostInfo();
    if (result) {
      Alert.alert(
        getDic('Eumtalk'),
        'Domain initializing success !',
        [
          {
            text: getDic('Ok'),
            onPress: () => {
              exitApp();
            },
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  }
};

const initializeEumSettingInfo = async () => {
  const settings = await AsyncStorage.getItem('ESETINF');
  if (settings) {
    AsyncStorage.removeItem('ESETINF');
    Alert.alert(
      getDic('Eumtalk'),
      'Server info initializing success !',
      [
        {
          text: getDic('Ok'),
          onPress: () => {
            exitApp();
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  }
};

export default initQuickActions;
