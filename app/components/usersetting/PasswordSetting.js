import React, { useState, useRef } from 'react';
import {
  TextInput,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { getAesUtil } from '@/lib/AesUtil';
import { modifyUserPassword } from '@/lib/api/setting';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';
import { withSecurityScreen } from '@/withSecurityScreen';

const PasswordSetting = ({ navigation }) => {
  const { colors, sizes } = useTheme();
  const { userInfo } = useSelector(({ login }) => ({
    userInfo: login.userInfo,
  }));

  const [currunetPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');

  const refCurrentPassword = useRef(null);
  const refNewPassword = useRef(null);
  const refNewPasswordCheck = useRef(null);

  const handleChangePasswordSave = () => {
    const AESUtil = getAesUtil();
    if (currunetPassword === '' || newPassword === '' || checkPassword === '') {
      Alert.alert(
        '이음톡',
        '비밀번호 변경에 필요한 값을 모두 입력 해주세요.',
        [
          {
            text: '확인',
            onPress: () => {},
          },
        ],
        { cancelable: true },
      );
    }

    if (newPassword != checkPassword) {
      setNewPassword('');
      setCheckPassword('');
      Alert.alert(
        '이음톡',
        '새 비밀번호가 일치하지 않습니다.',
        [
          {
            text: '확인',
            onPress: () => {},
          },
        ],
        { cancelable: true },
      );
    }

    modifyUserPassword({
      nowPW: AESUtil.encrypt(currunetPassword),
      newPW: AESUtil.encrypt(newPassword),
    }).then(({ data }) => {
      if (data.status === 'SUCCESS') {
        setCurrentPassword('');
        setNewPassword('');
        setCheckPassword('');
        Alert.alert(
          '이음톡',
          '비밀번호가 수정 되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {},
            },
          ],
          { cancelable: true },
        );
      } else if (data.status === 'Unauthorized') {
        setCurrentPassword('');
        Alert.alert(
          '이음톡',
          '잘못된 현재 비밀번호를 입력하였습니다.',
          [
            {
              text: '확인',
              onPress: () => {},
            },
          ],
          { cancelable: true },
        );
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfoContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={e => {
            refCurrentPassword.current.focus();
          }}
        >
          <Text style={{ ...styles.userInfoTitle, fontSize: 16 + sizes.inc }}>
            {getDic('CurrentPassword')}
          </Text>
          <TextInput
            ref={refCurrentPassword}
            style={{ ...styles.userInfoInputText, fontSize: 16 + sizes.inc }}
            value={currunetPassword}
            onChangeText={text => {
              setCurrentPassword(text);
            }}
            secureTextEntry
            placeholder={getDic('Msg_InputCurrentPassword')}
            placeholderTextColor={'#AAA'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.userInfoContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={e => {
            refNewPassword.current.focus();
          }}
        >
          <Text style={{ ...styles.userInfoTitle, fontSize: 16 + sizes.inc }}>
            {getDic('NewPassword')}
          </Text>
          <TextInput
            ref={refNewPassword}
            style={{ ...styles.userInfoInputText, fontSize: 16 + sizes.inc }}
            value={newPassword}
            onChangeText={text => {
              setNewPassword(text);
            }}
            secureTextEntry
            placeholder={getDic('Msg_InputNewPassword')}
            placeholderTextColor={'#AAA'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.userInfoContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={e => {
            refNewPasswordCheck.current.focus();
          }}
        >
          <Text style={{ ...styles.userInfoTitle, fontSize: 16 + sizes.inc }}>
            {getDic('NewPasswordConfirm')}
          </Text>
          <TextInput
            ref={refNewPasswordCheck}
            style={{ ...styles.userInfoInputText, fontSize: 16 + sizes.inc }}
            value={checkPassword}
            onChangeText={text => {
              setCheckPassword(text);
            }}
            secureTextEntry
            placeholder={getDic('Msg_InputNewPasswordConfirm')}
            placeholderTextColor={'#AAA'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.userInfoSaveContainer}>
        <TouchableOpacity
          onPress={() => {
            handleChangePasswordSave();
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
                fontSize: sizes.fontSize,
              }}
            >
              {getDic('Save')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
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
    margin: 24,
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
    marginLeft: 10,
  },
  profileTitle: {
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 3,
    fontSize: 18,
  },
  profileSubTitle: {
    color: '#777',
    fontSize: 16,
  },
  profileChangeButton: {
    color: '#000',
    borderColor: '#000',
    marginLeft: 'auto',
    borderWidth: 1,
    padding: 5,
    height: 30,
    borderRadius: 15,
    width: 55,
  },
  profileChangeButtonTitle: {
    textAlign: 'center',
    textAlignVertical: 'center',
    justifyContent: 'center',
  },
  userInfoContainer: {
    margin: 15,
  },
  userInfoTitle: {
    fontWeight: 'bold',
  },
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

export default withSecurityScreen(PasswordSetting);
