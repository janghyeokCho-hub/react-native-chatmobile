import * as RNFS from 'react-native-fs';
import { getServer, getDic, getConfig } from '@/config';
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

const useFilePermission = getConfig('UseFilePermission', 'N') === 'Y';

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
        RNFS.mkdir(filePath).then(() => {
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
        getDic(
          'Msg_StoragePermissionError',
          '???????????? ????????? ?????? ??????????????? ??????????????????.\n???????????? ????????? ????????? ??? ?????? ???????????????????????????.',
        )[{ text: getDic('Ok') }],
      );
    }
  });
};

const fileDownload = async (optionObj, callback) => {
  RNFS.downloadFile(optionObj)
    .promise.then(response => {
      if (optionObj.imageOrVideo) {
        CameraRoll.save(`file://${optionObj.toFile}`, {
          album: 'eumtalk',
        })
          .then(() => {
            // cache file delete
            RNFS.unlink(optionObj.toFile);
            // image??? ?????? ????????? ????????? ?????? ??????.
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
    })
    .catch(e => {
      console.log('RNFS.downloadFile Error : ', e);
    });
};

export const downloadByToken = async (
  { token, fileName, type = 'chat', userId },
  callback,
  progressCallback,
) => {
  const imageOrVideo = isImageOrVideo(fileName);
  let directoryName = [{ type: 'Plain', data: 'Eumtalk' }];
  let directoryPath = 'Download/Eumtalk';
  let filePath = null;
  let downloadPath = null;

  if (imageOrVideo) {
    directoryName = [
      {
        type: 'MultiPlain',
        data: '??????;Album;Album;Album;Album;Album;Album;Album;Album;',
      },
    ];
    directoryPath = 'eumtalkTemporaryFiles';
    filePath = `${RNFS.CachesDirectoryPath}/${directoryPath}`;
  } else {
    filePath = `${RNFS.ExternalStorageDirectoryPath}/${directoryPath}`;
  }

  if (type === 'chat') {
    downloadPath = `${getServer('MANAGE')}/download${
      useFilePermission ? '/permission' : ''
    }/${token}`;
  } else if (type === 'note') {
    downloadPath = `${getServer('MANAGE')}/na/download${
      useFilePermission ? '/permission' : ''
    }/CR/${userId}/${token}/NOTE`;
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
    let result = '';
    let message = '';
    if (response.statusCode === 200) {
      result = 'SUCCESS';
      message = getSysMsgFormatStr(
        getDic(
          'Tmp_DownloadSuccess',
          "??????????????? ?????????????????????.\n?????? ????????? ?????? '%s' ?????? ????????? ??? ????????????.",
        ),
        directoryName,
      );
    } else if (response.statusCode === 204) {
      result = 'EXPIRED';
      message = getDic('Msg_FileExpired', '????????? ???????????????.');
    } else if (response.statusCode === 403) {
      result = 'FORBIDDEN';
      message = getDic(
        'Block_FileDownload',
        '?????? ??????????????? ???????????? ????????????.',
      );
    } else {
      result = 'ERROR';
      message = getDic(
        'Msg_Error',
        '????????? ??????????????????.<br/>??????????????? ??????????????????.',
      );
    }

    callback({
      result,
      message,
      path: result === 'SUCCESS' && optionObj.toFile,
    });
    if (result === 'SUCCESS' && progressCallback) {
      progressCallback({ bytesWritten: 100, contentLength: 100 });
    }
  };

  if (progressCallback) {
    optionObj.progressDivider = 1;
    optionObj.progress = result => {
      progressCallback(result);
    };
  }

  RNFS.exists(filePath)
    .then(async result => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          null,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          if (result) {
            fileDownload(optionObj, callbackFn);
          } else {
            RNFS.mkdir(filePath)
              .then(() => {
                fileDownload(optionObj, callbackFn);
              })
              .catch(e => {
                console.log(e);
                Alert.alert(null, '?????? ?????? ??????', [{ text: getDic('Ok') }]);
              });
          }
        } else {
          Alert.alert(
            null,
            getDic(
              'Msg_StoragePermissionError',
              '???????????? ????????? ?????? ??????????????? ??????????????????.\n???????????? ????????? ????????? ??? ?????? ???????????????????????????.',
            ),
            [{ text: getDic('Ok') }],
          );
        }
      } catch (e) {
        console.log(e);
      }
    })
    .catch(e => {
      console.log(e);
    });
};

export const downloadByTokenAlert = (item, progressCallback) => {
  downloadByToken(
    item,
    data => {
      if (data.result === 'SUCCESS') {
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
                      message = getDic(
                        'Msg_MobileAndroidNoAvailableApp',
                        '?????? ????????? ??? ????????? ?????? ?????? ?????? ????????????.\n PlayStore?????? ?????? ?????? ?????????????????????????',
                      );
                    } else {
                      message = getDic(
                        'Msg_MobileFileOpenError',
                        '????????? ?????? ??? ????????? ?????????????????????.',
                      );
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
      } else {
        if (data.result === 'EXPIRED') {
          Alert.alert(null, getDic('Msg_FileExpired', '????????? ???????????????.'), [
            {
              text: getDic('Ok', '??????'),
            },
          ]);
        } else if (data.result === 'FORBIDDEN') {
          Alert.alert(
            null,
            getDic('Block_FileDownload', '?????? ??????????????? ???????????? ????????????.'),
            [
              {
                text: getDic('Ok', '??????'),
              },
            ],
          );
        }
      }
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
            text: getDic('Ok', '??????'),
          },
        ],
        { cancelable: true },
      );
    } else {
      Share.open({
        message: '',
        title: '',
        url: `file://${data.savePath}`,
      });
    }
  });
};

const downloadShareFile = async (token, fileName, callback) => {
  const directoryName = 'eumtalkTemporaryFiles';
  const filePath = `${RNFS.CachesDirectoryPath}/${directoryName}`;

  let optionObj = {
    fromUrl: `${getServer('MANAGE')}/download${
      useFilePermission ? '/permission' : ''
    }/${token}`,
    toFile: makeRandomFileName(filePath, fileName),
    headers: await getHeaders(),
    imageOrVideo: false,
  };

  const callbackFn = response => {
    let result = '';
    let message = '';
    if (response.statusCode === 200) {
      result = 'SUCCESS';
      message = '';
    } else if (response.statusCode === 204) {
      result = 'EXPIRED';
      message = getDic('Msg_FileExpired', '????????? ???????????????.');
    } else if (response.statusCode === 403) {
      result = 'FORBIDDEN';
      message = getDic(
        'Block_FileDownload',
        '?????? ??????????????? ???????????? ????????????.',
      );
    } else {
      result = 'ERROR';
      message = getDic(
        'Msg_Error',
        '????????? ??????????????????.<br/>??????????????? ??????????????????.',
      );
    }
    callback({
      result,
      message,
      savePath: result === 'SUCCESS' && optionObj.toFile,
    });
  };

  RNFS.exists(filePath).then(result => {
    if (result) {
      fileDownload(optionObj, callbackFn);
    } else {
      RNFS.mkdir(filePath).then(() => {
        fileDownload(optionObj, callbackFn);
      });
    }
  });
};

// 2022-07-05 ?????? ????????? ???????
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
      callback({
        result: 'EXPIRED',
        message: getDic('Msg_FileExpired', '????????? ???????????????.'),
      });
    } else if (response.statusCode == 403) {
      callback({
        result: 'FORBIDDEN',
        message: getDic('Msg_FilePermission', '????????? ?????? ???????????????.'),
      });
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
        getSysMsgFormatStr(
          getDic(
            'Tmp_DownloadSuccess',
            "??????????????? ?????????????????????.\n?????? ????????? ?????? '%s' ?????? ????????? ??? ????????????.",
          ),
          directoryName,
        ),
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
                    message = getDic(
                      'Msg_MobileAndroidNoAvailableApp',
                      '?????? ????????? ??? ????????? ?????? ?????? ?????? ????????????.\n PlayStore?????? ?????? ?????? ?????????????????????????',
                    );
                  } else {
                    message = getDic(
                      'Msg_MobileFileOpenError',
                      '????????? ?????? ??? ????????? ?????????????????????.',
                    );
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
                      text: getDic('Close', '??????'),
                    },
                  ]);
                });
            },
          },
          {
            text: getDic('Ok', '??????'),
          },
        ],
        { cancelable: true },
      );
    });
  } else {
    Alert.alert(
      null,
      getDic(
        'Msg_StoragePermissionError',
        '???????????? ????????? ?????? ??????????????? ??????????????????.\n???????????? ????????? ????????? ??? ?????? ???????????????????????????.',
      )[{ text: getDic('Ok', '??????') }],
    );
  }
};
