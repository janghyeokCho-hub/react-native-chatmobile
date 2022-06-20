import qs from 'qs';
import { chatsvr, managesvr, filesvr } from '@API/api';
import { getAesUtil } from '@/lib/AesUtil';

// 쪽지 발송
export function sendNote({
  receiveUser = [],
  receiveGroup = [],
  subject,
  context,
  files = [],
  fileInfos = [],
  isEmergency,
  blockList = [],
}) {
  const AESUtil = getAesUtil();
  const formData = new FormData();

  files.forEach(file => {
    formData.append('files', file);
  });

  formData.append('fileInfos', JSON.stringify(fileInfos));
  formData.append('receiveUser', AESUtil.encrypt(JSON.stringify(receiveUser)));
  formData.append(
    'receiveGroup',
    AESUtil.encrypt(JSON.stringify(receiveGroup)),
  );
  formData.append('subject', subject);
  formData.append('context', context);
  formData.append('isEmergency', isEmergency);
  formData.append('blockList', JSON.stringify(blockList));

  //POST
  return chatsvr('post', '/note/send', formData);
}

// 쪽지목록 가져오기
export async function getNoteList(path, sortName, sort) {
  const queryParams = {
    sortName,
    sort,
  };
  const result = await managesvr(
    'GET',
    path + qs.stringify(queryParams, { addQueryPrefix: true }),
  );
  if (result && result.data && result.data.status === 'SUCCESS') {
    return result.data.result;
  }
}

// 파일 다운로드
export function downloadFile({
  userId = null,
  accessKey = null,
  serviceType = 'NOTE',
  downloadHandler = () => {},
}) {
  const module = 'CR';

  if (!userId || !accessKey) {
    return null;
  }

  //GET module userId accesskey serviceType
  return filesvr(
    'get',
    `/na/download/${module}/${userId}/${accessKey}/${serviceType}`,
    // `/download/${accessKey}`,
    {},
    {},
    downloadHandler,
  );
}

// 쪽지 내용 조회
export async function getNote(noteId) {
  // 페이지 초기 렌더링시 noteId 없이 getNote가 호출됨: AJAX 요청 생략
  if (typeof noteId === 'undefined' || noteId === null) {
    return null;
  }
  const response = await managesvr('get', `/note/read/${noteId}`);

  if (response.data?.status === 'SUCCESS') {
    if (Array.isArray(response.data?.result) === true) {
      return {
        ...response.data.result[0],
        files: response.data.file,
      };
    }
    return {
      ...response.data.result,
      files: response.data.file,
    };
  }
}

// 쪽지 삭제
export function deleteNote({ viewType, noteId }) {
  return managesvr('delete', `/note/${viewType}/${noteId}`);
}

// 쪽지 보관
export function archiveNote({ noteId, sop }) {
  //PUT noteId
  return managesvr('put', `/note/${noteId}`, { sop });
}

// 쪽지 수신여부 조회
export async function getReadList({ noteId }) {
  //GET noteId
  const response = await managesvr('get', `/note/readlist/${noteId}`);
  if (response.data?.status === 'SUCCESS' && response.data?.result) {
    return response.data.result;
  }
}

// 쪽지 즐겨찾기
export function setFavorite({ noteId, sop }) {
  //POST noteId
  return managesvr('post', `/note/favorites/${noteId}`, { sop });
}
