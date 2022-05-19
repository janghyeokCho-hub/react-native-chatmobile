import * as RNFS from 'react-native-fs';
import { getServer, getDic } from '@/config';
import AsyncStorage from '@react-native-community/async-storage';
import {
  makeFileName,
  isImageOrVideo,
  isVideo,
  makeRandomFileName,
  getFileMimeByFileName,
  getFileExtensionByFileName,
} from '@/lib/fileUtil';
import { PermissionsAndroid, Alert, Linking } from 'react-native';
import { getSysMsgFormatStr } from '@/lib/common';
import CameraRoll from '@react-native-community/cameraroll';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import { FileLogger, LogLevel } from 'react-native-file-logger';

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
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      null,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      if (result) {
        FileLogger.configure({
          logLevel: LogLevel.Debug,
          captureConsole: true,
          dailyRolling: true,
          maximumFileSiz: 1024 * 1024 * 3, // 3MB
          logsDirectory: filePath,
        });
      } else {
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
    } else {
      Alert.alert(
        null,
        getDic('Msg_StoragePermissionError')[{ text: getDic('Ok') }],
      );
    }
  });
};

const fileDownload = async (optionObj, callback) => {
  RNFS.downloadFile(optionObj).promise.then(response => {
    if (optionObj.imageOrVideo) {
      CameraRoll.save(`file://${optionObj.toFile}`, {
        album: 'eumtalk',
      })
        .then(value => {
          // cache file delete
          RNFS.unlink(optionObj.toFile);
          // image의 경우 앨범의 경로로 경로 변경.
          optionObj.toFile =
            RNFS.PicturesDirectoryPath +
            '/eumtalk/' +
            optionObj.toFile.slice(optionObj.toFile.lastIndexOf('/') + 1);
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
  { token, fileName, type = 'chat', userId },
  callback,
  progressCallback,
) => {
  const imageOrVideo = isImageOrVideo(fileName);
  let directoryName = [{ type: 'Plain', data: 'Eumtalk' }];
  let directoryPath = 'Eumtalk';
  let filePath = null;
  let downloadPath = null;

  if (imageOrVideo) {
    directoryName = [
      {
        type: 'MultiPlain',
        data: '앨범;Album;Album;Album;Album;Album;Album;Album;Album;',
      },
    ];
    directoryPath = 'eumtalkTemporaryFiles';
    filePath = `${RNFS.CachesDirectoryPath}/${directoryPath}`;
  } else {
    filePath = `${RNFS.ExternalStorageDirectoryPath}/${directoryPath}`;
  }

  if (type === 'chat') {
    downloadPath = `${getServer('MANAGE')}/download/${token}`;
  } else if (type === 'note') {
    downloadPath = `${getServer(
      'MANAGE',
    )}/na/download/CR/${userId}/${token}/NOTE`;
  }

  let optionObj = {
    fromUrl: downloadPath,
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
        message: getSysMsgFormatStr(
          getDic('Tmp_DownloadSuccess'),
          directoryName,
        ),
        path: optionObj.toFile,
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

  RNFS.exists(filePath).then(async result => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      null,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      if (result) fileDownload(optionObj, callbackFn);
      else {
        RNFS.mkdir(filePath).then(result => {
          fileDownload(optionObj, callbackFn);
        });
      }
    } else {
      Alert.alert(
        null,
        getDic('Msg_StoragePermissionError')[{ text: getDic('Ok') }],
      );
    }
  });
};

export const downloadByTokenAlert = (item, progressCallback) => {
  downloadByToken(
    item,
    data => {
      Alert.alert(
        null,
        data.message,
        [
          {
            text: getDic('Open'),
            onPress: () => {
              RNFetchBlob.android
                .actionViewIntent(
                  isVideo(data.path)
                    ? data.path.replace('Pictures', 'Movies')
                    : data.path,
                  getFileMimeByFileName(data.path),
                )
                .catch(() => {
                  let ext = getFileExtensionByFileName(data.path);
                  let message = '';
                  if (ext) {
                    message = getDic('Msg_MobileAndroidNoAvailableApp');
                  } else {
                    message = getDic('Msg_MobileFileOpenError');
                  }
                  Alert.alert(null, message, [
                    ext != null && {
                      text: getDic('Search'),
                      onPress: () => {
                        Linking.openURL(`market://search?q=${ext}`).catch(
                          () => {
                            Linking.openURL(
                              `https://play.google.com/store/apps/search?q=${ext}`,
                            ).catch(() => {});
                          },
                        );
                      },
                    },
                    {
                      text: getDic('Close'),
                    },
                  ]);
                });
            },
          },
          {
            text: getDic('Ok'),
          },
        ],
        { cancelable: true },
      );
    },
    progressCallback,
  );
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
          console.log('catch share');
          //RNFS.unlink(data.savePath);
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

export const openFileViewer = async item => {
  const directoryName = 'eumtalkTemporaryFiles';
  const filePath = `${RNFS.CachesDirectoryPath}/${directoryName}`;
  const { token, fileName } = item;

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
      // callback({
      //   result: 'SUCCESS',
      //   message: '',
      //   savePath: optionObj.toFile,
      // });
    }
  };

  RNFS.exists(filePath).then(result => {
    if (result) {
      fileDownload(optionObj, callbackFn);
    } else {
      RNFS.mkdir(filePath).then(result => {
        fileDownload(optionObj, callbackFn);
      });
    }
  });
};

export const creteContentFile = async (contents, fileName) => {
  const directoryPath = `${RNFS.ExternalStorageDirectoryPath}/Eumtalk/`;
  const path = directoryPath + fileName;
  const directoryName = [{ type: 'Plain', data: 'Eumtalk' }];

  const isExist = await RNFS.exists(directoryPath);

  if (!isExist) {
    await RNFS.mkdir(directoryPath);
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    null,
  );
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    RNFS.writeFile(path, contents, 'utf8').then(() => {
      Alert.alert(
        null,
        getSysMsgFormatStr(getDic('Tmp_DownloadSuccess'), directoryName),
        [
          {
            text: getDic('Open'),
            onPress: () => {
              RNFetchBlob.android
                .actionViewIntent(path, getFileMimeByFileName(path))
                .catch(() => {
                  let ext = getFileExtensionByFileName(path);
                  let message = '';
                  if (ext) {
                    message = getDic('Msg_MobileAndroidNoAvailableApp');
                  } else {
                    message = getDic('Msg_MobileFileOpenError');
                  }
                  Alert.alert(null, message, [
                    ext != null && {
                      text: getDic('Search'),
                      onPress: () => {
                        Linking.openURL(`market://search?q=${ext}`).catch(
                          () => {
                            Linking.openURL(
                              `https://play.google.com/store/apps/search?q=${ext}`,
                            ).catch(() => {});
                          },
                        );
                      },
                    },
                    {
                      text: getDic('Close'),
                    },
                  ]);
                });
            },
          },
          {
            text: getDic('Ok'),
          },
        ],
        { cancelable: true },
      );
    });
  } else {
    Alert.alert(
      null,
      getDic('Msg_StoragePermissionError')[{ text: getDic('Ok') }],
    );
  }
};
