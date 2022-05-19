import { Alert, Linking } from 'react-native';
import Axios from 'axios';
import { managesvr } from '../api/api';
import { sendViewerServer } from '@API/viewer';
import { getConfig, getDic, getServer } from '@/config';
import { getLoginInfo } from '@/lib/class/LoginInfo';

export const requestDecodeDRM = async ({ fileId, fileExt, token, roomID }) => {
  const DRM_SYNAP = getConfig('DRMSynap') || { use: false };
  const date = fileId?.slice(0, 8); // date: YYYYMMDD
  const response = await managesvr('post', '/na/file/drm', {
    Domain: DRM_SYNAP?.domain,
    FilePath: `/${roomID}/${date}/`,
    FileName: `${fileId}.${fileExt}`,
    FileID: fileId,
    TokenID: token,
  });
  return response;
};

export const openSynapViewer = async item => {
  const restful = getServer('MANAGE');
  const DRM_SYNAP = getConfig('DRMSynap') || { use: false };
  const synapURL = getConfig('SynapDocViewServer') || '';
  const token = getLoginInfo()
    .getToken()
    ?.replace(/\^/gi, '-');
  const fileId = item?.token;
  const fileExt = item?.ext;
  const filePath = `${restful}/na/nf/synabDownload/${item?.token}/${token}`;

  try {
    if (DRM_SYNAP?.use) {
      const response = await requestDecodeDRM({
        fileId,
        fileExt,
        token,
        roomID: item?.roomID,
      });
      if (response?.data?.status !== 'SUCCESS' || !response?.data?.result) {
        Alert.alert(
          getDic('Eumtalk'),
          getDic('Msg_Error'),
          [
            {
              text: getDic('Ok'),
            },
          ],
          { cancelable: true },
        );
        return;
      }
      const substrIndex = synapURL.indexOf('job');
      const sendURL = synapURL.substring(0, substrIndex);
      Linking.openURL(`${sendURL}view/${response.data.result.key}`);
    } else {
      const response = await sendViewerServer({ filePath, fileId });
      if (!response?.data?.key) {
        throw new Error('Invalid response data');
      }
      const substrIndex = synapURL.indexOf('job');
      const sendURL = synapURL.substring(0, substrIndex);
      Linking.openURL(`${sendURL}view/${response.data.key}`);
    }
  } catch (err) {
    let message;
    if (err?.response?.status === 404) {
      // '문서뷰어 서버를 찾을 수 없습니다. 관리자에게 문의해주세요.;Cannot find Viewer Server. Please contact the manager.'
      message = getDic(
        'Msg_SynapFailed',
        '문서뷰어 서버를 찾을 수 없습니다. 관리자에게 문의해주세요.',
      );
    } else {
      // '파일이 만료되었거나 문서 변환 오류가 발생했습니다.;The file has already expired or failed to convert from the server'
      message = getDic(
        'Msg_SynapError',
        '파일이 만료되었거나 문서 변환 오류가 발생했습니다.',
      );
    }
    Alert.alert(
      getDic('Eumtalk'),
      message,
      [
        {
          text: getDic('Ok'),
        },
      ],
      { cancelable: true },
    );
  }
};
