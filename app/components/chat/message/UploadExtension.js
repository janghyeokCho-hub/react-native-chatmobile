import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getConfig, getDic } from '@/config';

const UploadExtension = ({
  currentRoom,
  onClose,
  btnStyle,
  onUploadFile,
  navigation,
  onShareDocLayer,
}) => {
  const ShareDoc = getConfig('ShareDoc') || {};
  const useShareDoc = ShareDoc?.use === 'Y';
  const roomId =
    currentRoom.roomType === 'C' ? currentRoom.roomId : currentRoom.roomID;

  const buttons = useMemo(() => {
    let modalBtn = [
      {
        type: 'upload',
        title: '내 PC에서 첨부',
        onPress: () => {
          onUploadFile();
        },
      },
    ];
    if (useShareDoc && roomId) {
      modalBtn.push({
        type: 'create',
        title: getDic('CreateShareDoc', '공동 문서 생성'),
        onPress: () => {
          navigation.navigate('CreateDocument', {
            headerName: getDic('CreateShareDoc', '공동 문서 생성'),
            postAction: () => console.log('postAction'),
          });
        },
      });
      modalBtn.push({
        type: 'share',
        title: '공동 문서 공유',
        onPress: () => {
          onShareDocLayer();
        },
      });
    }

    return modalBtn;
  }, [onUploadFile, navigation, onShareDocLayer, roomId, useShareDoc]);

  return (
    <View>
      {buttons &&
        buttons.map(modalInfo => {
          return (
            <View key={`msgext_${modalInfo.type}`}>
              <TouchableOpacity
                onPress={() => {
                  modalInfo.onPress();
                  onClose();
                }}
              >
                <Text style={btnStyle}>{modalInfo.title}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
    </View>
  );
};

export default UploadExtension;
