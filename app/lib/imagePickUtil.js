import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CameraRoll from '@react-native-community/cameraroll';
import { PermissionsAndroid } from 'react-native';
import { Alert } from 'react-native';
import { Platform } from 'react-native';

const generalImageOption = {
  title: '이미지 선택',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

export const selectImageWithLibrary = (imageHandler, handleCancel) => {
  launchImageLibrary(generalImageOption, response => {
    if (!response.didCancel) imageHandler(response);
    else if (handleCancel) handleCancel();
  });
};

export const selectImageWithCamera = (imageHandler, handleCancel) => {
  if (Platform.OS == 'android') {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then(
      res => {
        if (res == 'granted') {
          launchCamera(generalImageOption, response => {
            if (!response.didCancel) imageHandler(response);
            else if (handleCancel) handleCancel();
          });
        } else {
          Alert.alert('', '설정에서 카메라 권한을 등록해주세요.');
        }
      },
    );
  } else {
    launchCamera(generalImageOption, response => {
      if (!response.didCancel) imageHandler(response);
      else if (handleCancel) handleCancel();
    });
  }
};

export const getImagesFromLibrary = assetType => {
  return CameraRoll.getPhotos({ assetType: assetType, first: 30 });
};
