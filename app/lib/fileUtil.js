import * as RNFS from 'react-native-fs';
import * as roomApi from '@API/room';
import { getConfig, getDic } from '@/config';
import ImageResizer from 'react-native-image-resizer';
import imageExtensions from 'image-extensions';
import videoExtensions from 'video-extensions';
import { creteContentFile } from '@/lib/device/file';
import { format } from 'date-fns';
import * as dbAction from '@/lib/appData/action';
import {
  convertEumTalkProtocolPreview,
  eumTalkRegularExp,
  isJSONStr,
} from './common';
import { isBlockCheck } from './api/orgchart';

const extensionImage = new Set(imageExtensions);
const extensionVideo = new Set(videoExtensions);

let fileInstance;

export const isAllImage = fileobj => {
  let allImage = true;
  fileobj.map(file => {
    if (!extensionImage.has(file.ext)) {
      allImage = false;
    }
  });
  return allImage;
};

class fileUpload {
  files = [];
  fileInfos = [];

  appendFiles = files => {
    let resultType = 'SUCCESS';
    let resultMsg = '';

    const checkValidation = this.checkValidationFile(files);

    if (checkValidation !== 'SUCCESS') {
      resultType = 'FAILURE';
      resultMsg = checkValidation;
    }

    if (resultType == 'SUCCESS') {
      files.forEach(file => {
        if (!this.checkDuplication(file)) {
          const fileBasicInfo = this.makeFileInfo(file, false);
          const fileInfo = { ...fileBasicInfo, uri: file.uri, path: file.path };
          file.tempId = fileInfo.tempId;

          this.files.push(file);
          this.fileInfos.push(fileInfo);
        }
      });
    }
    return { result: resultType, message: resultMsg };
  };

  setThumbDataURL = async () => {
    await Promise.all(
      this.fileInfos.map(async file => {
        if (file.image && (file.path || file.uri)) {
          try {
            let resizeData = await ImageResizer.createResizedImage(
              file.path ? file.path : file.uri,
              400,
              400,
              'PNG',
              100,
            );
            const base64Data = await RNFS.readFile(resizeData.uri, 'base64');
            file.thumbDataURL = `data:image/png;base64,${base64Data}`;

            // return {...file,thumbDataURL: `data:image/png;base64,${base64Data}`}

            // ImageResizer.createResizedImage(
            //   file.path ? file.path : file.uri,
            //   400,
            //   400,
            //   'PNG',
            //   100
            // ).then(async res=>{
            //   const base64Data = await RNFS.readFile(res.uri, 'base64');
            //   file.thumbDataURL = `data:image/png;base64,${base64Data}`;
            // })
          } catch (error) {
            console.error(error);
          }
        }
      }),
    );
  };

  setThumbDataiOSURL = async () => {
    await Promise.all(
      this.fileInfos.map(async file => {
        if (file.image) {
          const resizeData = await ImageResizer.createResizedImage(
            file.uri,
            400,
            400,
            'PNG',
            100,
          );
          const base64Data = await RNFS.readFile(resizeData.uri, 'base64');
          file.thumbDataURL = `data:image/png;base64,${base64Data}`;
        }
      }),
    );
  };

  pasteFiles = file => {
    let resultType = 'SUCCESS';
    let resultMsg = '';

    const checkValidation = this.checkValidationFile(file);

    if (checkValidation === 'SUCCESS') {
      const fileBasicInfo = this.makeFileInfo(file, true);
      const fileInfo = { ...fileBasicInfo };

      file.tempId = fileInfo.tempId;

      this.files.push(file);
      this.fileInfos.push(fileInfo);
    } else {
      resultType = 'FAILURE';
      resultMsg = checkValidation;
    }

    return { result: resultType, message: resultMsg };
  };

  /*imageProcessing = (tempId, callback) => {
    let fileInfo = this.fileInfos.find(item => item.tempId == tempId);
    let file = this.files.find(item => item.tempId == tempId);

    if (fileInfo.image) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const thumb = new Image();
        const dataURL = reader.result;
        thumb.onload = () => {
          const size = this.resize(thumb.width, thumb.height, 150, 150);

          let width = size.resizeWidth;
          let height = size.resizeHeight;
          let thumbDataURL = this.makeThumb(thumb, width, height);

          const newFileInfo = {
            ...fileInfo,
            width: width,
            height: height,
            thumbDataURL: thumbDataURL,
          };

          this.fileInfos = this.fileInfos.map(item => {
            if (item.tempId == tempId) {
              return newFileInfo;
            } else {
              return item;
            }
          });

          callback(newFileInfo);
        };
        thumb.src = dataURL;
      };
    }
  };*/

  resize = (width, height, maxWidth, maxHeight) => {
    let resizeWidth = 0;
    let resizeHeight = 0;

    // 가로나 세로의 길이가 최대 사이즈보다 크면 실행
    if (width > maxWidth || height > maxHeight) {
      // 가로가 세로보다 크면 가로는 최대사이즈로, 세로는 비율 맞춰 리사이즈
      if (width > height) {
        resizeWidth = maxWidth;
        resizeHeight = Math.round((height * resizeWidth) / width); // 세로가 가로보다 크면 세로는 최대사이즈로, 가로는 비율 맞춰 리사이즈
      } else {
        resizeHeight = maxHeight;
        resizeWidth = Math.round((width * resizeHeight) / height);
      } // 최대사이즈보다 작으면 원본 그대로
    } else {
      resizeWidth = width;
      resizeHeight = height;
    } // 리사이즈한 크기로 이미지 크기 다시 지정
    return {
      resizeWidth,
      resizeHeight,
    };
  };

  makeThumb = (img, width, height) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL();
  };

  getFiles = () => {
    return this.files;
  };

  getFile = tempId => {
    return this.files.find(item => item.tempId == tempId);
  };

  getFileInfo = tempId => {
    return this.fileInfos.find(item => item.tempId == tempId);
  };

  delFile = tempId => {
    let indexFiles = this.files.findIndex(item => item.tempId == tempId);
    let indexFileInfos = this.fileInfos.findIndex(
      item => item.tempId == tempId,
    );

    this.files.splice(indexFiles, 1);
    this.fileInfos.splice(indexFileInfos, 1);
  };

  getFileInfos = () => {
    return this.fileInfos.map(item => {
      return item;
    });
  };

  getRealFileInfos = () => {
    return this.fileInfos;
  };

  makeFileInfo = (fileObj, isPaste) => {
    if (!fileObj.name) {
      fileObj.name = fileObj.fileName;
    }
    if (!fileObj.size) {
      fileObj.size = fileObj.fileSize;
    }
    const fileLen = fileObj.name.length;
    const lastDot = fileObj.name.lastIndexOf('.');
    const fileExt = fileObj.name.substring(lastDot + 1, fileLen).toLowerCase();
    const fileName = fileObj.name.substring(0, lastDot);

    return {
      tempId: guid(),
      fullName: fileObj.name,
      fileName: fileName,
      ext: fileExt,
      size: fileObj.size,
      isPaste: isPaste,
      image:
        fileExt == 'png' ||
        fileExt == 'jpg' ||
        fileExt == 'jpeg' ||
        fileExt == 'bmp' ||
        fileExt == 'gif'
          ? true
          : false,
    };
  };

  checkDuplication = fileObj => {
    let duplication = false;
    this.fileInfos.forEach(file => {
      if (file.fullName == fileObj.name && file.IsPaste != 'Y') {
        duplication = true;
        return false;
      }
    });

    return duplication;
  };

  checkValidationFile = fileObjs => {
    let length = 0;
    let size = true;
    let ext = true;

    Array.prototype.forEach.call(fileObjs, file => {
      length++;
      // File Size Check
      if (file.size >= getConfig('File.limitUnitFileSize')) {
        size = false;
        return false;
      }
      if (!file.name) {
        file.name = file.fileName;
      }
      const fileLen = file.name ? file.name.length : file.fileName.length;
      const lastDot = file.name
        ? file.name.lastIndexOf('.')
        : file.fileName.lastIndexOf('.');
      const fileExt = file.name
        ? file.name.substring(lastDot + 1, fileLen).toLowerCase()
        : file.fileName.substring(lastDot + 1, fileLen).toLowerCase();
      if (getConfig('File.limitExtension').indexOf(fileExt) == -1) {
        ext = false;
      }
    });

    if (!size) return 'LIMIT_FILE_SIZE';
    if (!ext) return 'LIMIT_FILE_EXTENSION';
    // File Count Check
    if (this.files.length > getConfig('File.limitFileCnt')) {
      return 'LIMIT_FILE_COUNT';
    }

    // File Ext Check

    return 'SUCCESS';
  };

  clear = () => {
    this.fileInfos = [];
    this.files = [];
    this.tempFileInfos = [];
  };

  // 중복검사 관련된 함수들 추가
}

export const getInstance = () => {
  if (fileInstance) return fileInstance;
  else {
    fileInstance = new fileUpload();
    return fileInstance;
  }
};

export const downloadMessageData = async ({
  roomID,
  fileName,
  roomName,
  chineseWall = [],
}) => {
  const result = await dbAction.getAllMessages({ roomID });
  if (!result?.length) {
    // 대화내용없음
    return 'NONE';
  } else {
    let txt = `${roomName}\n`;
    txt += `저장한 날짜 : ${format(new Date(), 'yyyy년 MM월 dd일 HH:mm')}\n`;
    // 파일 대화내용 지우기
    const items = result.filter(item => !item.fileInfos);
    // 동기 처리를 위해 forEach 대신 for 사용
    for (const item of items) {
      if (item.messageType === 'N') {
        const sendDate = format(item.sendDate, 'yyyy년 MM월 dd일 HH:mm:ss');
        const senderInfo = isJSONStr(item.senderInfo)
          ? JSON.parse(item.senderInfo)
          : item.senderInfo;
        const name = senderInfo.name?.split(';')[0];
        let isBlock = false;

        if (item.isMine !== 'Y' && chineseWall.length) {
          const { blockChat } = isBlockCheck({
            targetInfo: {
              ...senderInfo,
              id: item.sender,
            },
            chineseWall,
          });
          isBlock = blockChat;
        }

        let context = isBlock
          ? getDic('BlockChat', '차단된 메시지입니다.')
          : item.context;

        if (eumTalkRegularExp.test(context)) {
          const messageObj = convertEumTalkProtocolPreview(context);
          context = messageObj.message;
        }
        txt += `\n${sendDate} ${name} : ${context}`;
      }
    }
    creteContentFile(txt, fileName);
  }
};

export const convertFileSize = size => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (size == 0) return 'n/a';
  const i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
  return (size / Math.pow(1024, i)).toFixed(1) + sizes[i];
};

export const getIconClass = extension => {
  let strReturn = '';
  const lowerExt = extension.toLowerCase();
  if (lowerExt == 'xls' || lowerExt == 'xlsx') {
    strReturn = 'exCel';
  } else if (
    lowerExt == 'jpg' ||
    lowerExt == 'png' ||
    lowerExt == 'bmp' ||
    lowerExt == 'gif'
  ) {
    strReturn = 'imAge';
  } else if (lowerExt == 'doc' || lowerExt == 'docx') {
    strReturn = 'woRd';
  } else if (lowerExt == 'ppt' || lowerExt == 'pptx') {
    strReturn = 'pPoint';
  } else if (lowerExt == 'txt' || lowerExt == 'hwp') {
    strReturn = 'teXt';
  } else {
    strReturn = 'etcFile';
  }

  return strReturn;
};

export const resizeImage = (width, height, maxWidth, maxHeight) => {
  let resizeWidth = 0;
  let resizeHeight = 0;

  // 가로나 세로의 길이가 최대 사이즈보다 크면 실행
  if (width > maxWidth || height > maxHeight) {
    // 가로가 세로보다 크면 가로는 최대사이즈로, 세로는 비율 맞춰 리사이즈
    if (width > height) {
      resizeWidth = maxWidth;
      resizeHeight = Math.round((height * resizeWidth) / width); // 세로가 가로보다 크면 세로는 최대사이즈로, 가로는 비율 맞춰 리사이즈
    } else {
      resizeHeight = maxHeight;
      resizeWidth = Math.round((width * resizeHeight) / height);
    } // 최대사이즈보다 작으면 원본 그대로
  } else {
    resizeWidth = width;
    resizeHeight = height;
  } // 리사이즈한 크기로 이미지 크기 다시 지정
  return {
    resizeWidth,
    resizeHeight,
  };
};

export const getFileExtension = ext => {
  switch (ext) {
    case 'doc':
    case 'docx':
      ext = 'doc';
      break;
    case 'xls':
    case 'xlsx':
      ext = 'xls';
      break;
    case 'ppt':
    case 'pptx':
      ext = 'ppt';
      break;
    case 'pdf':
      ext = 'pdf';
      break;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      ext = 'img';
      break;
    default:
      ext = 'etc';
      break;
  }

  return ext;
};

export const fileTypeImage = {
  doc: require('@C/assets/file-type-doc.png'),
  etc: require('@C/assets/file-type-etc.png'),
  img: require('@C/assets/file-type-img.png'),
  pdf: require('@C/assets/file-type-pdf.png'),
  ppt: require('@C/assets/file-type-ppt.png'),
  xls: require('@C/assets/file-type-xls.png'),
};

/*
file : 표시할 파일
files : L type일 경우 사용
type : N (Normal), L (List), A (Async)
params : Async Params
*/
/*export const openFilePreview = (file, files, type, params) => {
  openSubPop(
    'preview',
    '#/client/nw/preview',
    { file, files, type, params },
    670,
    770,
    'center',
    true,
    {},
  );
};*/

export const guid = () => {
  const s4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  return (
    s4() +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    s4() +
    s4()
  );
};

export const makeFileName = async (path, name) => {
  const fileName = name.substring(0, name.lastIndexOf('.'));
  let saveFileName = fileName;
  const ext = name.substring(name.lastIndexOf('.'));

  let existIdx = 0;
  let savePath = `${path}/${saveFileName}${ext}`;

  // 중복 파일 처리
  while (await RNFS.exists(savePath)) {
    saveFileName = `${fileName}(${++existIdx})`;
    savePath = `${path}/${saveFileName}${ext}`;
  }
  return savePath;
};

export const isImageOrVideo = name => {
  const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
  return extensionImage.has(ext) || extensionVideo.has(ext);
};

export const isVideo = name => {
  const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
  return extensionVideo.has(ext);
};

export const makeRandomFileName = (path, name) => {
  const saveFileName = guid();
  const ext = name.substring(name.lastIndexOf('.'));
  let savePath = `${path}/${saveFileName}${ext}`;

  return savePath;
};
export const getFileExtensionByFileName = name => {
  name = name.toLowerCase();
  let indExt = name.lastIndexOf('.');
  if (indExt > 0) {
    return name.slice(indExt + 1);
  }
  return null;
};

export const getFileMimeByFileName = name => {
  let ext = getFileExtensionByFileName(name);
  let mime = 'application/octet-stream';
  switch (ext) {
    case 'txt':
      mime = 'text/*';
      break;
    case 'doc':
    case 'docx':
      mime = 'application/msword';
      break;
    case 'xls':
    case 'xlsx':
      mime = 'application/vnd.ms-excel';
      break;
    case 'ppt':
    case 'pptx':
      mime = 'application/vnd.ms-powerpoint';
      break;
    case 'pdf':
      mime = 'application/pdf';
      break;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      mime = 'image/*';
      break;
    case 'mp4':
      mime = 'video/mp4';
      break;
    case 'avi':
      mime = 'video/x-msvideo';
      break;
    case 'mpeg':
    case 'mpg':
    case 'mpe':
      mime = 'video/mpeg';
      break;
    case 'ogv':
      mime = 'video/ogg';
      break;
    case 'webm':
      mime = 'video/webm';
      break;
    case 'hwp':
      mime = 'application/haansofthwp';
      break;
    case 'mp3':
      mime = 'audio/mp3';
      break;
    case 'wav':
      mime = 'audio/x-wav';
      break;
    case 'weba':
      mime = 'audio/webm';
      break;
    case 'aac':
      mime = 'audio/aac';
      break;
    case 'mid':
    case 'midi':
      mime = 'audio/midi';
      break;
    case 'oga':
      mime = 'audio/ogg';
      break;
    default:
      mime = '*/*';
  }
  return mime;
};
