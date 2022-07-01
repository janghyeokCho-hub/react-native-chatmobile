import { getServerUtil } from '@COMMON/share/lib/api';
import { stat, readFile } from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import imageExtensions from 'image-extensions';
import videoExtensions from 'video-extensions';

const extensionImage = new Set(imageExtensions);
const extensionVideo = new Set(videoExtensions);

export const getFileStat = async fileInfos => {
  return await Promise.all(fileInfos.map(item => stat(item)));
};

const getThumbnailDataURL = async fileInfos => {
  return await Promise.all(
    fileInfos.map(async file => {
      if (file.image) {
        const resizeData = await ImageResizer.createResizedImage(
          file.uri,
          400,
          400,
          'PNG',
          100,
        );
        const base64Data = await readFile(resizeData.uri, 'base64');
        return { ...file, thumbDataURL: `data:image/png;base64,${base64Data}` };
      } else {
        return file;
      }
    }),
  );
};

const fileNameInfos = fileFullPath => {
  const filePathSplit = fileFullPath.split('/');
  const fullName = filePathSplit[filePathSplit.length - 1];

  const lastDot = fullName.lastIndexOf('.');
  const ext = fullName.substring(lastDot + 1, fullName.length).toLowerCase();
  const name = fullName.substring(0, lastDot);

  return { fullName, name, ext };
};

const getFileInfo = file => {
  const { fullName, ext, name } = fileNameInfos(file.path);

  return {
    uri: file.path,
    fullName: fullName.toLowerCase(),
    fileName: name.toLowerCase(),
    ext: ext.toLowerCase(),
    size: file.size,
    image:
      ext == 'png' ||
      ext == 'jpg' ||
      ext == 'jpeg' ||
      ext == 'bmp' ||
      ext == 'gif'
        ? true
        : false,
  };
};

const getMimeTypeFromExt = ext => {
  if (extensionImage.has(ext)) {
    if (ext === 'jpg') {
      return 'image/jpeg';
    } else {
      return `image/${ext}`;
    }
  } else if (extensionVideo.has(ext)) {
    if (ext.toLowerCase() === 'mov') {
      return 'video/quicktime';
    } else {
      return `video/${ext}`;
    }
  }

  return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
};

export const shareFactory = async shareData => {
  const isFileUpload =
    Array.isArray(shareData.fileInfos) && shareData.fileInfos.length > 0;

  const server = getServerUtil();
  let url = null;
  if (isFileUpload) {
    url = '/fileShare';
    const formData = new FormData();
    shareData.fileInfos.forEach(item => {
      const { fullName, ext } = fileNameInfos(item.path);
      formData.append('files', {
        name: fullName.toLowerCase(),
        size: item.size,
        type: getMimeTypeFromExt(ext),
        // type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        uri: item.path,
      });
    });

    let fileInfos = shareData.fileInfos.map(getFileInfo);
    // make thumbnail data
    fileInfos = await getThumbnailDataURL(fileInfos);

    formData.append('fileInfos', JSON.stringify(fileInfos));

    formData.append('type', shareData.type);
    formData.append('targets', shareData.targets);
    formData.append('roomType', shareData.roomType);
    formData.append('blockList', shareData.blockList);
    return server.postRestful(url, formData, {
      'Content-Type': 'multipart/form-data',
    });
  } else {
    url = '/textShare';

    return server.postRestful(url, {
      type: shareData.type,
      targets: shareData.targets,
      roomType: shareData.roomType,
    });
  }
};

export const messageFactory = async messageDatas => {
  return await Promise.all(
    messageDatas.map(async item => {
      const server = getServerUtil();
      const sendResult = await server.postChat('/message', item);
      return sendResult;
    }),
  );
};

export const getFileInfoStr = fileInfo => {
  if (!!fileInfo) {
    if (Array.isArray(fileInfo)) {
      if (fileInfo.length == 1) {
        return JSON.stringify(fileInfo[0]);
      } else {
        return JSON.stringify(fileInfo);
      }
    } else {
      return JSON.stringify(fileInfo);
    }
  } else {
    return null;
  }
};
