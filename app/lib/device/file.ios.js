import * as RNFS from 'react-native-fs';
import { getServer, getDic } from '@/config';
import AsyncStorage from '@react-native-community/async-storage';
import { sendViewerServer } from '@API/viewer';
import { getConfig } from '@/config';
import {
  makeFileName,
  isImageOrVideo,
  makeRandomFileName,
} from '@/lib/fileUtil';
import { Alert, Linking } from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import { FileLogger, LogLevel } from 'react-native-file-logger';
import { getSysMsgFormatStr } from '@/lib/common';

const getHeaders = async () => {
  return {
    'Covi-User-Device-Type': 'covision.mobile.app',
    'Covi-User-Access-Token': await AsyncStorage.getItem(
      'covi_user_access_token',
    ),
    'Covi-User-Access-ID': await AsyncStorage.getItem('covi_user_access_id'),
    'Content-Type': 'application/json; charset=utf-8',
  };
};

export const loggerInit = () => {
  let filePath = `${RNFS.ExternalStorageDirectoryPath}/KICTalk/`;
  RNFS.exists(filePath).then(async result => {
    if (result) {
      RNFS.mkdir(filePath).then(result => {
        FileLogger.configure({
          logLevel: LogLevel.Debug,
          captureConsole: true,
          dailyRolling: true,
          maximumFileSiz: 1024 * 1024 * 3, // 3MB
          logsDirectory: filePath,
        });
      });
    }
  });
};

const fileDownload = (optionObj, callback) => {
  RNFS.downloadFile(optionObj).promise.then(response => {
    if (optionObj.imageOrVideo) {
      CameraRoll.save(`file://${optionObj.toFile}`, {
        album: 'eumtalk',
      })
        .then(value => {
          // cache file delete
          RNFS.unlink(optionObj.toFile);
          callback(response);
        })
        .catch(() => {
          callback(response);
        });
    } else {
      callback(response);
    }
  });
};

export const downloadByToken = async (
  token,
  fileName,
  callback,
  progressCallback,
) => {
  const imageOrVideo = isImageOrVideo(fileName);
  let directoryName = 'Downloads';
  let filePath = null;

  if (imageOrVideo) {
    directoryName = 'eumtalkTemporaryFiles';
    filePath = `${RNFS.CachesDirectoryPath}/${directoryName}`;
  } else {
    filePath = `${RNFS.DocumentDirectoryPath}/${directoryName}`;
  }

  let optionObj = {
    fromUrl: `${getServer('MANAGE')}/download/${token}`,
    toFile:
      (!imageOrVideo && (await makeFileName(filePath, fileName))) ||
      makeRandomFileName(filePath, fileName),
    headers: await getHeaders(),
    imageOrVideo: imageOrVideo,
  };

  const callbackFn = response => {
    if (response.statusCode == 204) {
      callback({ result: 'EXPIRED', message: getDic('Msg_FileExpired') });
    } else if (response.statusCode == 403) {
      callback({ result: 'FORBIDDEN', message: getDic('Msg_FilePermission') });
    } else {
      //fileDownload(response.data, fileName);
      callback({
        result: 'SUCCESS',
        message: getDic('Msg_DownloadSuccess'),
        path: optionObj.toFile,
        imageOrVideo: imageOrVideo,
      });
      if (progressCallback)
        progressCallback({ bytesWritten: 100, contentLength: 100 });
    }
  };

  if (progressCallback) {
    optionObj.progressDivider = 1;
    optionObj.progress = result => {
      progressCallback(result);
    };
  }

  RNFS.exists(filePath).then(result => {
    if (result) fileDownload(optionObj, callbackFn);
    else {
      RNFS.mkdir(filePath).then(result => {
        fileDownload(optionObj, callbackFn);
      });
    }
  });
};

export const downloadByTokenAlert = (item, progressCallback) => {
  downloadByToken(
    item.token,
    item.fileName,
    data => {
      if (!data.imageOrVideo) {
        Alert.alert(
          null,
          data.message,
          [
            {
              text: getDic('Open'),
              onPress: () => {
                RNFetchBlob.ios.openDocument(data.path);
              },
            },
            {
              text: getDic('Ok'),
            },
          ],
          { cancelable: true },
        );
      } else {
        Alert.alert(
          null,
          data.message,
          [
            {
              text: getDic('Ok'),
            },
          ],
          { cancelable: true },
        );
      }
    },
    progressCallback,
  );
};

export const viewerByTokenAlert = item => {
  const synapURL = getConfig('SynapDocViewServer', null);
  if (synapURL != null) {
    sendViewerServer('get', synapURL, item)
      .then(response => {
        let sendURL = response.config.url.indexOf('job');
        sendURL = response.config.url.substring(0, sendURL);
        Linking.openURL(`${sendURL}view/${response.data.key}`);
      })
      .catch(response => {
        Alert.alert(
          getDic('Eumtalk'),
          getDic('Msg_FileExpired'),
          [
            {
              text: getDic('Ok'),
            },
          ],
          { cancelable: true },
        );
      });
  }
};

export const downloadAndShare = item => {
  downloadShareFile(item.token, item.fileName, data => {
    if (data.result !== 'SUCCESS') {
      Alert.alert(
        null,
        data.message,
        [
          {
            text: getDic('Ok'),
          },
        ],
        { cancelable: true },
      );
    } else {
      Share.open({
        message: '',
        title: '',
        url: `file://${data.savePath}`,
      })
        .then(() => {
          // RNFS.unlink(data.savePath);
        })
        .catch(() => {
          RNFS.unlink(data.savePath);
        });
    }
  });
};

const downloadShareFile = async (token, fileName, callback) => {
  const directoryName = 'eumtalkTemporaryFiles';
  const filePath = `${RNFS.CachesDirectoryPath}/${directoryName}`;

  let optionObj = {
    fromUrl: `${getServer('MANAGE')}/download/${token}`,
    toFile: makeRandomFileName(filePath, fileName),
    headers: await getHeaders(),
    imageOrVideo: false,
  };

  const callbackFn = response => {
    if (response.statusCode == 204) {
      callback({ result: 'EXPIRED', message: getDic('Msg_FileExpired') });
    } else if (response.statusCode == 403) {
      callback({ result: 'FORBIDDEN', message: getDic('Msg_FilePermission') });
    } else {
      callback({
        result: 'SUCCESS',
        message: '',
        savePath: optionObj.toFile,
      });
    }
  };

  RNFS.exists(filePath).then(result => {
    if (result) fileDownload(optionObj, callbackFn);
    else {
      RNFS.mkdir(filePath).then(result => {
        fileDownload(optionObj, callbackFn);
      });
    }
  });
};

export const creteContentFile = async (contents, fileName) => {
  const directoryName = `${RNFS.DocumentDirectoryPath}/Downloads/`;
  const path = directoryName + fileName;

  RNFS.exists(directoryName)
  .then(result => {
    if (result) return Promise.resolve();
    else {
      return RNFS.mkdir(directoryName)
    }
  }).then(() => {
    return RNFS.writeFile(path, contents, 'utf8')
  }).then(() => {
    Alert.alert(
      null,
      getSysMsgFormatStr(
        getDic('Tmp_DownloadSuccess'),
        [
          { type: 'Plain', data: 'Downloads' }
        ]
      ),
      [
        {
          text: getDic('Open'),
          onPress: () => {
            RNFetchBlob.ios.openDocument(path);
          },
        },
        {
          text: getDic('Ok'),
        },
      ],
      { cancelable: true },
    );
  }).catch(err => {
    console.log('Error   ', err);
  });
};