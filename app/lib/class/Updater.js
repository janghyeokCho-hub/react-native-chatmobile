import {
  Platform,
  Alert,
  ToastAndroid,
  Linking,
  NativeModules,
} from 'react-native';
import { UpdateAPK } from 'rn-update-apk';
import { getServer } from '@/config';
import { managesvr } from '@API/api';
import { getDic } from '@/config';
import VersionCheck from 'react-native-version-check';

let updater = null;

class Updater {
  checkURL = `/na/nf/updates/mobile/latest?p=mobile&a=${Platform.OS}`;

  checkUpdate = handleProgress => {
    if (!__DEV__) {
      switch (Platform.OS) {
        case 'android':
          const updateApk = new UpdateAPK({
            apkVersionUrl: `${getServer('MANAGE')}${this.checkURL}&v=${
              NativeModules.RNUpdateAPK.versionName
            }`,
            fileProviderAuthority: 'com.chatmobile.provider',
            needUpdateApp: this.needUpdateApp,
            forceUpdateApp: this.forceUpdateApp,
            downloadApkEnd: this.downloadApkEnd,
            downloadApkProgress: handleProgress,
          });
          updateApk.checkUpdate();
          break;
        case 'ios':
          this.updateIOS();
          break;
      }
    }
  };

  needUpdateApp = needUpdate => {
    Alert.alert(getDic('AppUpdate'), getDic('NewUpdate'), [
      { text: getDic('Cancel') },
      { text: getDic('Ok'), onPress: () => needUpdate(true) },
    ]);
  };

  forceUpdateApp = needUpdate => {
    if (needUpdate) {
      Alert.alert(getDic('AppUpdate'), getDic('NewUpdate'), [
        { text: getDic('Ok'), onPress: () => needUpdate(true) },
      ]);
    } else {
      ToastAndroid.show(getDic('NewUpdate'), ToastAndroid.LONG);
    }
  };

  downloadApkEnd = () => {
    ToastAndroid.show(getDic('Msg_NewUpdateSuccess'), ToastAndroid.LONG);
  };

  updateIOS = () => {
    managesvr(
      'get',
      `${this.checkURL}&v=${VersionCheck.getCurrentVersion()}`,
    ).then(({ data }) => {
      if (data.status == 'SUCCESS') {
        if (data.forceUpdate) {
          this.forceUpdateApp(isUpdate => {
            if (isUpdate) {
              this.openDownloadPage(data.url);
            }
          });
        } else {
          this.needUpdateApp(isUpdate => {
            if (isUpdate) {
              this.openDownloadPage(data.url);
            }
          });
        }
      }
    });
  };

  openDownloadPage = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };
}

export const getUpdater = () => {
  if (updater == null) {
    updater = new Updater();
  }

  return updater;
};

export default getUpdater;
