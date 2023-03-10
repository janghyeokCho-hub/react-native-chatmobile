import { Dimensions, Linking, Alert } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { isIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';
import RNExitApp from 'react-native-exit-app';
import RNRestart from 'react-native-restart';
import { getDic } from '@/config';
import JailMonkey from 'jail-monkey';

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

/**
 * @Author 조장혁
 * @description OS 루팅 변조 또는 디버깅 모드가 탐지되면 앱을 종료시킴
 */
export const getMobileSecurityCheck = () => {
  if (JailMonkey.isJailBroken()) {
    Alert.alert(
      getDic('Eumtalk', '이음톡'),
      getDic(
        'Msg_Rooting_ExitApp',
        '이 장치는 루팅 변조로 식별되어 앱을 종료합니다.',
      ),
      [
        {
          text: getDic('Ok', '확인'),
          onPress: () => {
            exitApp();
          },
        },
      ],
    );
  } else if (JailMonkey.isDebuggedMode()) {
    Alert.alert(
      getDic('Eumtalk', '이음톡'),
      getDic(
        'Msg_Debugging_ExitApp',
        '디버깅 모드가 탐지되어 앱을 종료합니다.',
      ),
      [
        {
          text: getDic('Ok', '확인'),
          onPress: () => {
            exitApp();
          },
        },
      ],
    );
  }
};
