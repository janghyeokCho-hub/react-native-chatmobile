import { Dimensions, Linking, Alert, findNodeHandle } from 'react-native';
import RNExitApp from 'react-native-exit-app';
import RNRestart from 'react-native-restart';
import TextInputReset from 'react-native-text-input-reset';
import { getDic } from '@/config';
import SendIntentAndroid from 'react-native-send-intent';

export const getTopPadding = () => {
  // StatusBar 직접 import 해서 계산
  return 0;
};

export const getBottomPadding = () => {
  // StatusBar 직접 import 해서 계산
  return 0;
};

export const getScreenWidth = () => {
  return Math.round(Dimensions.get('window').width);
};

export const getScreenHeight = () => {
  return Math.round(Dimensions.get('window').height);
};

export const linkCall = phoneNumber => {
  if (phoneNumber && phoneNumber != '') {
    SendIntentAndroid.sendPhoneDial(phoneNumber, false);
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
  TextInputReset.resetKeyboardInput(findNodeHandle(ref));
};
