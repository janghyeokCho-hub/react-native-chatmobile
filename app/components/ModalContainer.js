import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '@/modules/modal';
import { getAesUtil } from '@/lib/AesUtil';
import { joinChannel } from '@/lib/api/channel';
import { getServer } from '@/config';
import { modifyChannelInfo } from '@/modules/channel';
import { getDic } from '@/config';
import MessageExtension from '@C/chat/message/MessageExtension';
import Modal from '@C/common/Modal';
import LoadingWrap from '@COMMON/LoadingWrap';

const ModalContainer = () => {
  const { modalOpen, modalData, modalType } = useSelector(({ modal }) => ({
    modalOpen: modal.open,
    modalData: modal.modalData,
    modalType: modal.modalData.type,
  }));

  const [password, setPassword] = useState('');

  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [channelCategory, setChannelCategory] = useState('');
  const { loading } = useSelector(({ loading }) => ({
    loading: loading['channel/MODIFY_CHANNELINFO'],
  }));

  const dispatch = useDispatch();

  const handleModifyChannelInfo = () => {
    // 채널 아이콘 수정
    // if (icon) {
    //   const formData = new FormData();
    //   formData.append('fileName', icon);
    //   formData.append('roomId', roomId);
    //   dispatch(uploadChannelIcon(formData));
    // }

    // 비밀번호 암호화
    // let encryptSecretKey = '';
    // if (openType != 'O' && secretKey) {
    //   const AESUtil = getAesUtil();
    //   encryptSecretKey = AESUtil.encrypt(secretKey);
    // }

    // 채널 정보 수정
    dispatch(
      modifyChannelInfo({
        roomId: modalData.channelMenuInfo.roomId,
        description: channelDescription,
        roomName: channelName,
        categoryCode: channelCategory,
        // secretKey : encryptSecretKey,
      }),
    );
  };

  useEffect(() => {
    if (modalData && modalData.channelMenuInfo) {
      setChannelName(modalData.channelMenuInfo.roomName);
      setChannelDescription(modalData.channelMenuInfo.description);
      setChannelCategory(modalData.channelMenuInfo.categoryCode);
    }
  }, [modalData]);

  return (
    <Modal
      open={modalOpen}
      offset={0}
      animationDuration={50}
      animationTension={150}
      modalDidClose={() => {
        setPassword('');
        dispatch(closeModal());
      }}
      closeOnTouchOutside={modalData.closeOnTouchOutside}
      containerStyle={{
        justifyContent: 'center',
      }}
      modalStyle={{
        borderRadius: 15,
        backgroundColor: '#F5F5F5',
      }}
      disableOnBackPress={false}
    >
      <View>
        {!loading &&
          modalType === 'channelChangeInfo' &&
          modalData.channelMenuInfo && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={{
                uri: `${getServer('HOST')}${
                  modalData.channelMenuInfo.iconPath
                }`,
              }}
            >
              <Text style={styles.modalInfoTitle}>{getDic('ChannelName')}</Text>
              <Text style={styles.modalInfoSubtitle}>
                {modalData.channelMenuInfo.roomName}
              </Text>
              <Text style={styles.modalInfoTitle}>
                {getDic('ChannelDescription')}
              </Text>
              <Text style={styles.modalInfoSubtitle}>
                {modalData.channelMenuInfo.description}
              </Text>
              <Text style={styles.modalInfoTitle}>{getDic('Category')}</Text>
              <Text style={styles.modalInfoSubtitle}>
                {modalData.channelMenuInfo.categoryName}
              </Text>

              <TouchableOpacity
                style={{ marginLeft: 'auto' }}
                onPress={() => {
                  dispatch(closeModal());
                }}
              >
                <Image
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 35,
                    margin: 21,
                  }}
                  source={{
                    uri: getServer('HOST') + modalData.channelMenuInfo.iconPath,
                  }}
                />
                <Text style={styles.modalInfoTitle}>
                  {getDic('ChannelName')}
                </Text>
                <TextInput
                  placeholderTextColor="#AAA"
                  onChangeText={text => {
                    setChannelName(text);
                  }}
                  style={styles.modalInfoSubtitle}
                  placeholder={channelName}
                />
                <Text style={styles.modalInfoTitle}>
                  {getDic('ChannelDescription')}
                </Text>
                <TextInput
                  placeholderTextColor="#AAA"
                  onChangeText={text => {
                    setChannelDescription(text);
                  }}
                  style={styles.modalInfoSubtitle}
                  placeholder={channelDescription}
                />
                <Text style={styles.modalInfoTitle}>{getDic('Category')}</Text>
                <TextInput
                  placeholderTextColor="#AAA"
                  onChangeText={text => {
                    setChannelCategory(text);
                  }}
                  style={styles.modalInfoSubtitle}
                  placeholder={channelCategory}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginLeft: 'auto' }}
                onPress={() => {
                  handleModifyChannelInfo();
                  if (!loading) {
                    dispatch(closeModal());
                  }
                }}
              >
                <Text style={{ fontSize: 18 }}>{getDic('Ok')}</Text>
              </TouchableOpacity>
            </View>
          )}
        {modalType === 'channelInfo' && modalData.channelMenuInfo && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              style={{
                width: 150,
                height: 150,
                borderRadius: 35,
                margin: 21,
              }}
              source={{
                uri: `${getServer('HOST')}${
                  modalData.channelMenuInfo.iconPath
                }`,
              }}
            />
            <Text style={styles.modalInfoTitle}>{getDic('ChannelName')}</Text>
            <Text style={styles.modalInfoSubtitle}>
              {modalData.channelMenuInfo.roomName}
            </Text>
            <Text style={styles.modalInfoTitle}>
              {getDic('ChannelDescription')}
            </Text>
            <Text style={styles.modalInfoSubtitle}>
              {modalData.channelMenuInfo.description}
            </Text>
            <Text style={styles.modalInfoTitle}>{getDic('Category')}</Text>
            <Text style={styles.modalInfoSubtitle}>
              {modalData.channelMenuInfo.categoryName}
            </Text>

            <TouchableOpacity
              style={{ marginLeft: 'auto' }}
              onPress={() => {
                dispatch(closeModal());
              }}
            >
              <Text style={{ fontSize: 18 }}>{getDic('Ok')}</Text>
            </TouchableOpacity>
          </View>
        )}
        {modalType === 'colorBox' && modalData.buttonList && (
          <View style={styles.colorBoxWrap}>
            {modalData.buttonList.map(modalInfo => {
              return (
                <View key={modalInfo.code}>
                  <TouchableOpacity
                    onPress={() => {
                      modalInfo.onPress();
                      dispatch(closeModal());
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: modalInfo.color,
                        ...styles.colorBox,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
        {modalType === 'fontSizeSelector' &&
          modalData.buttonList &&
          modalData.buttonList.map(modalInfo => {
            return (
              <View key={modalInfo.code}>
                <TouchableOpacity
                  onPress={() => {
                    modalInfo.onPress();
                    dispatch(closeModal());
                  }}
                >
                  <Text
                    style={{ ...styles.modalButtons, fontSize: modalInfo.size }}
                  >
                    {modalInfo.title}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        {modalType === 'msgExtension' && modalData.messageData && (
          <MessageExtension
            messageData={modalData.messageData}
            onClose={() => {
              dispatch(closeModal());
            }}
            btnStyle={styles.modalButtons}
          />
        )}
        {modalType === 'normal'
          ? modalData.buttonList &&
            modalData.buttonList.map(modalInfo => {
              return (
                <View key={modalInfo.code}>
                  <TouchableOpacity
                    onPress={() => {
                      modalInfo.onPress();
                      dispatch(closeModal());
                    }}
                  >
                    <Text style={styles.modalButtons}>{modalInfo.title}</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          : modalData.channel && (
              <View style={{ margin: 12 }}>
                <Text style={styles.modalTitle}>
                  {modalData.channel.roomName}
                </Text>
                <TextInput
                  style={{
                    ...styles.modalContents,
                    color: '#000',
                    fontSize: 18,
                    marginTop: 5,
                  }}
                  placeholder={getDic('Msg_InputPassword')}
                  placeholderTextColor="#AAA"
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                  }}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={{ marginLeft: 'auto' }}
                  onPress={() => {
                    const AESUtil = getAesUtil();
                    const params = {
                      openType: modalData.channel.openType,
                      roomId: modalData.channel.roomId,
                      members: modalData.members,
                    };
                    params.secretKey = AESUtil.encrypt(password);
                    joinChannel(params).then(({ data }) => {
                      if (data.status === 'SUCCESS') {
                        modalData.navigation.navigate('ChannelRoom', {
                          roomID: modalData.channel.roomId,
                        });
                        dispatch(closeModal());
                        setPassword('');
                      } else {
                        const result = data.result.split(' ');
                        if (result[0] === '[EE-CSCHC4]') {
                          Alert.alert(
                            getDic('Eumtalk'),
                            getDic('Msg_WrongPasswordInput'),
                            [{ text: getDic('Ok') }],
                            {
                              cancelable: true,
                            },
                          );
                          setPassword('');
                        } else {
                          Alert.alert(
                            getDic('Eumtalk'),
                            getDic('Msg_NetworkError'),
                            [{ text: getDic('Ok') }],
                            {
                              cancelable: true,
                            },
                          );
                          setPassword('');
                        }
                      }
                    });
                  }}
                >
                  <Text style={styles.modalContents}>{getDic('Enter')}</Text>
                </TouchableOpacity>
              </View>
            )}
        {loading && <LoadingWrap />}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 20,
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 0.6,
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  modalContents: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'left',
  },
  modalButtons: {
    fontSize: 20,
    margin: 21,
    textAlign: 'left',
  },
  modalInfoTitle: {
    color: '#000',
    fontSize: 18,
  },
  modalInfoSubtitle: {
    color: '#777',
    fontSize: 18,
    marginBottom: 21,
  },
  colorBoxWrap: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  colorBox: {
    height: 40,
    width: 40,
  },
});

export default ModalContainer;
