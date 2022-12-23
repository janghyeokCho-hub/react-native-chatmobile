import React, { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import LoadingWrap from '@COMMON/LoadingWrap';
import { useSelector, useDispatch } from 'react-redux';
import ImagePicker from 'react-native-image-picker';

import { modifyUserInfo, modifyUserProfileImage } from '@/lib/api/setting';
import { changeMyInfo, changeMyPhotoPath } from '@/modules/login';
import { getServer, getConfig, getDic } from '@/config';
import { getJobInfo } from '@/lib/common';
import { useTheme } from '@react-navigation/native';
import { withSecurityScreen } from '@/withSecurityScreen';

const InfoSetting = ({ navigation }) => {
  const { colors, sizes } = useTheme();
  const { userInfo } = useSelector(({ login }) => ({
    userInfo: login.userInfo,
  }));
  const [profile, setProfile] = useState(`${userInfo.photoPath}`);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [work, setWork] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const emailTextInput = useRef(null);
  const phoneNumberTextInput = useRef(null);
  const workTextInput = useRef(null);

  useEffect(() => {
    setEmail(userInfo.mailAddress);
    setPhoneNumber(userInfo.phoneNumber);
    setWork(userInfo.work == null ? ' ' : userInfo.work);
  }, [userInfo]);

  const handleInfoSettingSave = () => {
    const changeData = {
      mailAddress: email,
      phoneNumber: phoneNumber,
      work: work,
    };
    modifyUserInfo(changeData).then(({ data }) => {
      if (data.status === 'SUCCESS') {
        dispatch(changeMyInfo(changeData));
        Alert.alert(
          getDic('Eumtalk'),
          getDic('Msg_UserInfoModify'),
          [
            {
              text: getDic('Ok'),
              onPress: () => {},
            },
          ],
          { cancelable: true },
        );
      }
    });
  };

  const handleProfileImageSave = () => {
    ImagePicker.launchImageLibrary(
      getConfig('ImagePickerOption', { title: 'Select Avatar' }),
      response => {
        if (!response.didCancel) {
          if (response.type === 'image/jpeg' || response.type === 'image/png') {
            const reqData = new FormData();
            if (Platform.OS === 'ios') {
              reqData.append('file', {
                uri: response.origURL ? response.origURL : response.uri,
                type: response.type,
                name: response.name,
              });
            } else {
              reqData.append('file', {
                uri: response.uri,
                type: response.type,
                name: response.fileName,
              });
            }
            setLoading(true);
            modifyUserProfileImage(reqData)
              .then(({ data }) => {
                if (data.status === 'SUCCESS') {
                  dispatch(changeMyPhotoPath(data.result));
                  setProfile(
                    'data:' + response.type + ';base64,' + response.data,
                  );
                  setLoading(false);
                  Alert.alert(
                    getDic('Eumtalk'),
                    getDic('Msg_ProfileChange'),
                    [
                      {
                        text: getDic('Ok'),
                        onPress: () => {},
                      },
                    ],
                    { cancelable: true },
                  );
                } else {
                  setLoading(false);
                  Alert.alert(
                    getDic('Eumtalk'),
                    getDic('Msg_InvalidImage'),
                    [
                      {
                        text: getDic('Ok'),
                        onPress: () => {},
                      },
                    ],
                    { cancelable: true },
                  );
                }
              })
              .catch(error => {
                setLoading(false);
                Alert.alert(
                  getDic('Eumtalk'),
                  getDic('Msg_NetworkError'),
                  [
                    {
                      text: getDic('Ok'),
                      onPress: () => {},
                    },
                  ],
                  { cancelable: true },
                );
              });
          } else {
            setLoading(false);
            Alert.alert(
              getDic('Eumtalk'),
              getDic('Msg_ImageExtError'),
              [
                {
                  text: getDic('Ok'),
                  onPress: () => {},
                },
              ],
              { cancelable: true },
            );
          }
        }
      },
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.userDetailContainer}>
        <Image
          style={styles.profileImage}
          source={{
            uri: profile,
          }}
        />
        <View style={styles.profileTitleContainer}>
          <Text style={{ ...styles.profileTitle, fontSize: 18 + sizes.inc }}>
            {getJobInfo(userInfo)}
          </Text>
        </View>
        {/* {getConfig('UseMyInfoEdit') && ( */}
        {userInfo.isHR === 'N' && (
          <TouchableOpacity
            style={styles.profileChangeButton}
            onPress={() => {
              handleProfileImageSave();
            }}
          >
            <Text
              style={{
                ...styles.profileChangeButtonTitle,
                fontSize: 13 + sizes.inc,
              }}
            >
              {getDic('Modify')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {userInfo.isHR === 'N' ? (
        <View style={styles.userInfoContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => {
              emailTextInput.current.focus();
            }}
          >
            <Text style={{ ...styles.userInfoTitle, fontSize: 16 + sizes.inc }}>
              {getDic('Email')}
            </Text>
            <TextInput
              ref={emailTextInput}
              style={[
                styles.userInfoInputText,
                userInfo.isExtUser === 'Y' && styles.disabled,
                { fontSize: 16 + sizes.inc },
              ]}
              value={email}
              onChangeText={text => {
                setEmail(text);
              }}
              placeholder={getDic('Msg_InputEmail')}
              placeholderTextColor={'#AAA'}
              editable={true}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.userInfoContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => {
              emailTextInput.current.focus();
              Keyboard.dismiss();
            }}
          >
            <Text style={{ ...styles.userInfoTitle, fontSize: 16 + sizes.inc }}>
              {getDic('Email')}
            </Text>
            <TextInput
              ref={emailTextInput}
              style={[
                styles.userInfoInputText,
                userInfo.isExtUser === 'Y' && styles.disabled,
                { fontSize: 16 + sizes.inc },
              ]}
              value={email}
              // onChangeText={text => {
              //   setEmail(text);
              // }}
              placeholder={getDic('Msg_modifyUserSetting')}
              placeholderTextColor={'#AAA'}
              editable={false}
            />
          </TouchableOpacity>
        </View>
      )}
      {userInfo.isHR === 'N' ? (
        <View style={styles.userInfoContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => {
              phoneNumberTextInput.current.focus();
            }}
          >
            <Text style={{ ...styles.userInfoTitle, fontSize: 16 + sizes.inc }}>
              {getDic('PhoneNumber')}
            </Text>
            <TextInput
              ref={phoneNumberTextInput}
              style={{ ...styles.userInfoInputText, fontSize: 16 + sizes.inc }}
              value={phoneNumber}
              onChangeText={text => {
                setPhoneNumber(text);
              }}
              placeholder={getDic('Msg_InputPhoneNumber')}
              placeholderTextColor={'#AAA'}
              editable={true}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.userInfoContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => {
              phoneNumberTextInput.current.focus();
              Keyboard.dismiss();
            }}
          >
            <Text style={{ ...styles.userInfoTitle, fontSize: 16 + sizes.inc }}>
              {getDic('PhoneNumber')}
            </Text>
            <TextInput
              ref={phoneNumberTextInput}
              style={{ ...styles.userInfoInputText, fontSize: 16 + sizes.inc }}
              value={phoneNumber}
              // onChangeText={text => {
              //   setPhoneNumber(text);
              // }}
              placeholder={getDic('Msg_modifyUserSetting')}
              placeholderTextColor={'#AAA'}
              editable={false}
            />
          </TouchableOpacity>
        </View>
      )}
      {userInfo.isHR === 'N' ? (
        <View style={styles.userInfoContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => {
              workTextInput.current.focus();
            }}
          >
            <Text style={{ ...styles.userInfoTitle, fontSize: 16 + sizes.inc }}>
              {getDic('Work')}
            </Text>
            <TextInput
              ref={workTextInput}
              style={{ ...styles.userInfoInputText, fontSize: 16 + sizes.inc }}
              value={work}
              onChangeText={text => {
                setWork(text);
              }}
              placeholder={getDic('Msg_InputWork')}
              placeholderTextColor={'#AAA'}
              editable={true}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.userInfoContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => {
              workTextInput.current.focus();
              Keyboard.dismiss();
            }}
          >
            <Text style={{ ...styles.userInfoTitle, fontSize: 16 + sizes.inc }}>
              {getDic('Work')}
            </Text>
            <TextInput
              ref={workTextInput}
              style={{ ...styles.userInfoInputText, fontSize: 16 + sizes.inc }}
              value={work}
              // onChangeText={text => {
              //   setWork(text);
              // }}
              placeholder={getDic('Msg_modifyUserSetting')}
              placeholderTextColor={'#AAA'}
              editable={false}
            />
          </TouchableOpacity>
        </View>
      )}
      {/* {getConfig('UseMyInfoEdit') && ( */}
      {userInfo.isHR === 'N' && (
        <View style={styles.userInfoSaveContainer}>
          <TouchableOpacity
            onPress={() => {
              handleInfoSettingSave();
            }}
          >
            <View
              style={{
                ...styles.userInfoSaveBtnContainer,
                borderColor: colors.primary,
                backgroundColor: colors.primary,
              }}
            >
              <Text
                style={{
                  ...styles.userInfoSaveBtnTitle,
                  fontSize: sizes.large,
                }}
              >
                {getDic('Save')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      {loading && <LoadingWrap />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  userDetailContainer: {
    marginTop: 15,
    marginLeft: 10,
    marginBottom: 15,
    marginRight: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  profileTitleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    textAlignVertical: 'center',
    marginLeft: 15,
  },
  profileTitle: {
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  profileSubTitle: {
    color: '#777',
    fontSize: 16,
  },
  profileChangeButton: {
    color: '#888',
    borderColor: '#AAA',
    marginLeft: 'auto',
    borderWidth: 0.8,
    height: 30,
    borderRadius: 15,
    width: 55,
    justifyContent: 'center',
    marginTop: 5,
    marginRight: 10,
  },
  profileChangeButtonTitle: {
    textAlign: 'center',
    textAlignVertical: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  userInfoContainer: {
    margin: 10,
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#CCC',
  },
  userInfoTitle: {
    fontWeight: 'bold',
  },
  disabled: { backgroundColor: '#ddd' },
  userInfoInputText: {
    color: '#999',
    marginTop: 7,
  },
  userInfoSaveContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  userInfoSaveBtnContainer: {
    width: 150,
    borderWidth: 0.8,
    borderRadius: 2,
    padding: 12,
  },
  userInfoSaveBtnTitle: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default withSecurityScreen(InfoSetting);
