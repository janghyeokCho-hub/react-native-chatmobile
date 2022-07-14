import { chatsvr, managesvr, filesvr, imgsvr } from '@API/api';
import { getConfig } from '@/config';

export const sendMessage = params => {
  return chatsvr('post', '/message', params);
};

export const readMessage = params => {
  return chatsvr('put', '/message', params);
};

export const getMessagePage = params => {
  return managesvr(
    'get',
    `/messages/${params.pageNum}?roomID=${params.roomID}&loadCnt=${
      params.loadCnt
    }&startId=${params.startId}`,
  );
};

export const getMessagePages = params => {
  return managesvr(
    'get',
    `/messages?roomID=${params.roomID}&loadCnt=${params.loadCnt}&startId=${
      params.startId
    }&pages=${params.pages.join(',')}`,
  );
};

export const uploadFile = params => {
  let url = '';
  const formData = new FormData();

  // url 및 formData 생성
  if (params.sendFileInfo.files.length == 1) {
    url = '/upload';
    formData.append('file', params.sendFileInfo.files[0]);
  } else {
    url = '/multiUpload';
    params.sendFileInfo.files.forEach(file => {
      formData.append('files', file);
    });
  }

  formData.append('fileInfos', JSON.stringify(params.sendFileInfo.fileInfos));

  if (params.roomID) {
    formData.append('roomID', params.roomID);
  } else {
    delete params['sendFileInfo'];
    formData.append('roomObj', JSON.stringify(params));
  }

  return managesvr(
    'post',
    url,
    formData,
    {
      'Content-Type': 'multipart/form-data',
    },
    params?.onSubmitCancelToken,
  );
};

export const getThumbnail = params => {
  return imgsvr('get', `/thumbnail/${params.token}`, null, {
    'Cache-Control': 'public, max-age=31536000',
  });
};

export const getOriginalImage = params => {
  return imgsvr('get', `/image/${params.token}`, null, {
    'Cache-Control': 'public, max-age=31536000',
  });
};

export const getFileByToken = params => {
  const useFilePermission = getConfig('UseFilePermission', 'N') === 'Y';
  const url = useFilePermission
    ? `/download/permission/${params.token}`
    : `/download/${params.token}`;

  return filesvr('get', url);
};

export const getURLThumbnail = params => {
  return managesvr('post', `/message/link/thumbnail`, params);
};

export const getRoomFiles = params => {
  return managesvr(
    'get',
    `/room/files/${params.roomID}?IsImage=${params.isImage}&page=${
      params.page
    }&loadCnt=${params.loadCnt}`,
  );
};

export const getPageNumber = params => {
  return managesvr(
    'get',
    `/message/pageNum/${params.messageID}?roomId=${params.roomID}&startId=${
      params.startId
    }&loadCnt=${params.loadCnt}`,
  );
};

export const getRoomImages = params => {
  return managesvr(
    'get',
    `/room/images/${params.roomID}?ft=${params.token}&type=${params.type}&cnt=${
      params.cnt
    }`,
  );
};

export const getMessages = params => {
  return managesvr(
    'get',
    `/messages?roomID=${params.roomID}&loadCnt=${params.loadCnt}&startId=${
      params.startId
    }&dist=${params.dist}`,
  );
};

export const searchMessage = params => {
  return managesvr(
    'get',
    `/messages/search/${params.search}?roomID=${params.roomID}&loadCnt=${
      params.loadCnt
    }`,
  );
};

export const getFileInfo = params => {
  return managesvr('get', `/file/${params.fileId}`);
};

// 채널
export const readChannelMessage = params => {
  return chatsvr('put', '/channel/message', params);
};

export const getChannelMessages = params => {
  return managesvr(
    'get',
    `/channel/messages?roomID=${params.roomId}&loadCnt=${
      params.loadCnt
    }&startId=${params.startId}&dist=${params.dist}`,
  );
};

export const sendChannelMessage = params => {
  return chatsvr('post', '/channel/message', params);
};

export const searchChannelMessage = (params, { searchByName }) => {
  const searchText = encodeURIComponent(params.search);
  let requestMethod = 'get';
  let requestURL;
  let requestBody = {};
  if (searchByName) {
    requestMethod = 'post';
    requestURL = '/channel/sender/search';
    requestBody = {
      roomId: params.roomId,
      loadCnt: params.loadCnt,
      searchId: params.search,
    };
  } else {
    requestURL = `/channel/messages/search?roomID=${params.roomId}&loadCnt=${
      params.loadCnt
    }&searchText=${searchText}`;
  }
  return managesvr(requestMethod, requestURL, requestBody);
};

export const getNotice = params => {
  return managesvr(
    'get',
    `/notices?roomID=${params.roomID}&loadCnt=${params.loadCnt}&startId=${
      params.startId
    }&dist=${params.dist}`,
  );
};

// 채널 메시지 삭제
export const deleteChannelMessage = params => {
  return chatsvr('delete', `/channel/message/${params.messageId}`, params);
};

// 대화방 메시지 삭제
export const delChatroomMessage = params => {
  return chatsvr('delete', `/message`, params);
};

// 공지 내리기
export const removeNotice = params => {
  return chatsvr('put', `/channel/notice/message/${params.messageId}`, params);
};

// 멘션 목록 리스트 조회
export const getChannelMentionList = params => {
  return managesvr(
    'get',
    `/channel/mention/${params.roomId}?name=${params.name}`,
  );
};

// 파일 전달
export const shareFile = formData => {
  return filesvr('post', '/shareFiles', formData, {}, 'json');
};

// 파일 토큰 유효성 체크
export const checkFileTokenValidation = async ({ token, serviceType }) => {
  return await filesvr('get', `/check/${serviceType}/${token}`);
};

//책갈피
//책갈피 리스트 조회
export const getBookmarkList = params => {
  return managesvr('get', `/bookmark/${params}`);
};

//책갈피 삭제
export const deleteBookmark = params => {
  return managesvr('delete', `/bookmark/${params.roomId}/${params.bookmarkId}`);
};

//책갈피 등록

export const createBookmark = params => {
  return managesvr('post', `/bookmark`, params);
};
