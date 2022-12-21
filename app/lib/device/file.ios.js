import * as RNFS from 'react-native-fs';
import { getServer, getDic, getConfig } from '@/config';
import AsyncStorage from '@react-native-community/async-storage';
import {
  makeFileName,
  isImageOrVideo,
  makeRandomFileName,
} from '@/lib/fileUtil';
import { Alert } from 'react-native';
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
  });
};

const fileDownload = (optionObj, callback) => {
  RNFS.downloadFile(optionObj).promise.then(response => {
    if (optionObj.imageOrVideo) {
      CameraRoll.save(`file://${optionObj.toFile}`, {
        album: 'eumtalk',
      })
        .then(() => {
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
  { token, fileName, type = 'chat', userId },
  callback,
  progressCallback,
) => {
  const imageOrVideo = isImageOrVideo(fileName);
  let directoryName = 'Downloads';
  let filePath = null;
  let downloadPath = null;

  if (imageOrVideo) {
    directoryName = 'eumtalkTemporaryFiles';
    filePath = `${RNFS.CachesDirectoryPath}/${directoryName}`;
  } else {
    filePath = `${RNFS.DocumentDirectoryPath}/${directoryName}`;
  }

  const useFilePermission = getConfig('UseFilePermission', 'N') === 'Y';

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
      message = getDic('Msg_DownloadSuccess', '다운로드가 완료되었습니다.');
    } else if (response.statusCode === 204) {
      result = 'EXPIRED';
      message = getDic('Msg_FileExpired', '만료된 파일입니다.');
    } else if (response.statusCode === 403) {
      result = 'FORBIDDEN';
      message = getDic(
        'Block_FileDownload',
        '파일 다운로드가 금지되어 있습니다.',
      );
    } else {
      result = 'ERROR';
      message = getDic(
        'Msg_Error',
        '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
      );
    }
    callback({
      result,
      message,
      path: result === 'SUCCESS' && optionObj.toFile,
      imageOrVideo: result === 'SUCCESS' && imageOrVideo,
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

export const downloadByTokenAlert = (item, progressCallback) => {
  downloadByToken(
    item,
    data => {
      if (!data.imageOrVideo) {
        Alert.alert(
          null,
          data.message,
          [
            {
              text: getDic('Open', '열기'),
              onPress: () => {
                RNFetchBlob.ios.openDocument(data.path);
              },
            },
            {
              text: getDic('Ok', '확인'),
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
              text: getDic('Ok', '확인'),
            },
          ],
          { cancelable: true },
        );
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
            text: getDic('Ok', '확인'),
          },
        ],
        { cancelable: true },
      );
    } else {
      Share.open({
        message: '',
        title: '',
        url: `file://${data.savePath}`,
      }).catch(() => {
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
    let result = '';
    let message = '';

    if (response.statusCode === 200) {
      result = 'SUCCESS';
    } else if (response.statusCode === 204) {
      result = 'EXPIRED';
      message = getDic('Msg_FileExpired', '만료된 파일입니다.');
    } else if (response.statusCode === 403) {
      result = 'FORBIDDEN';
      message = getDic(
        'Block_FileDownload',
        '파일 다운로드가 금지되어 있습니다.',
      );
    } else {
      result = 'ERROR';
      message = getDic(
        'Msg_Error',
        '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
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

export const creteContentFile = async (contents, fileName) => {
  const directoryName = `${RNFS.DocumentDirectoryPath}/Downloads/`;
  const path = directoryName + fileName;

  RNFS.exists(directoryName)
    .then(result => {
      if (result) {
        return Promise.resolve();
      } else {
        return RNFS.mkdir(directoryName);
      }
    })
    .then(() => {
      return RNFS.writeFile(path, contents, 'utf8');
    })
    .then(() => {
      Alert.alert(
        null,
        getSysMsgFormatStr(
          getDic(
            'Tmp_DownloadSuccess',
            "다운로드가 완료되었습니다.\n파일 앱에서 경로 '%s' 에서 확인할 수 있습니다.",
          ),
          [{ type: 'Plain', data: 'Downloads' }],
        ),
        [
          {
            text: getDic('Open', '열기'),
            onPress: () => {
              RNFetchBlob.ios.openDocument(path);
            },
          },
          {
            text: getDic('Ok', '확인'),
          },
        ],
        { cancelable: true },
      );
    })
    .catch(err => {
      console.log('Error   ', err);
    });
};
