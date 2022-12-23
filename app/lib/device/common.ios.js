import { Dimensions, Linking, Alert } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { isIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';
import RNExitApp from 'react-native-exit-app';
import RNRestart from 'react-native-restart';
import { getDic } from '@/config';

export const getTopPadding = () => {
  return getStatusBarHeight(true);
};

export const getBottomPadding = () => {
  // StatusBar 직접 import 해서 계산
  if (isIphoneX()) {
    return getBottomSpace(true);
  } else {
    return getStatusBarHeight(true);
  }
};

export const getScreenWidth = () => {
  return Math.round(Dimensions.get('window').width);
};

export const getScreenHeight = () => {
  return Math.round(Dimensions.get('window').height);
};

export const linkCall = phoneNumber => {
  if (phoneNumber && phoneNumber != '') {
    Linking.openURL(`telprompt:${phoneNumber}`);
  } else {
    Alert.alert(null, getDic('Msg_TelError'), [{ text: getDic('Ok') }], {
      cancelable: true,
    });
  }
};

export const exitApp = () => {
  RNExitApp.exitApp();
};

export const restartApp = () => {
  RNRestart.Restart();
};

export const resetInput = ref => {
  ref && ref.clear();
};
