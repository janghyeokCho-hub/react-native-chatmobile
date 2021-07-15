import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, extLoginRequest, loginInit } from '@/modules/login';
import { getAesUtil } from '@/lib/AesUtil';
import KeySpacer from '@C/common/layout/KeySpacer';
import LoadingWrap from '../common/LoadingWrap';
import { getBottomPadding } from '@/lib/device/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';
import { getServer } from '@/config';
import MemoTextInput from '@C/common/inputs/MemoTextInput';

const LoginBox = ({ route }) => {
  const { colors, sizes } = useTheme();

  const { authFail, errMessage, errStatus, loading } = useSelector(
    ({ login, loading }) => ({
      authFail: login.authFail,
      errMessage: login.errMessage,
      errStatus: login.errStatus,
      loading: loading['login/REQUEST'],
    }),
  );
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isExtUser, setIsExtUser] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (route && route.params.isExtUser) {
      setIsExtUser(route.params.isExtUser);
    }
  }, [route]);

  const handleLogin = () => {
    Keyboard.dismiss();

    const AESUtil = getAesUtil();
    const encryptPassword = AESUtil.encrypt(password);

    const data = {
      id: userId,
      pw: encryptPassword,
      da: Platform.OS,
      dp: 'mobile',
    };

    if (isExtUser) {
      dispatch(extLoginRequest(data));
    } else {
      dispatch(loginRequest(data));
    }
  };

  const initInput = () => {
    // id 는 초기화 되지 않도록 처리
    // setUserId('');
    setPassword('');
  };

  useEffect(() => {
    if (authFail) {
      let message;

      if (errStatus) {
        if (errStatus === 'FAIL') {
          message = getDic('Msg_wrongLoginInfo');
        } else if (errStatus === 'ERROR') {
          message = getDic('Msg_Error');
        } else if (errStatus === 'LIC_FAIL') {
          const appName = DeviceInfo.getApplicationName();
          // 2021.02.09 TODO 다국어 반영
          message = getDic(
            'Msg_Fail_License',
            `라이센스가 만료되어 ${appName}을 이용하실 수 없습니다.`,
          );
        } else if (errStatus === 'ACCESS_FAIL') {
          message = getDic(
            'Msg_Fail_LoginAccessDenied',
            '접근이 제한된 계정입니다',
          );
        } else if (errStatus === 'ACCOUNT_LOCK') {
          message = getDic(
            'Msg_Fail_Account_Lock',
            '보안상의 이유로 계정이 비활성화되었으므로 로그인할 수 없습니다',
          );
        }
      } else if (
        errMessage &&
        errMessage.response &&
        errMessage.response.status === 403
      ) {
        message = getDic(
          'Msg_Error_Denied',
          '접속이 불가능합니다.\n관리자에게 문의해주세요',
        );
      }
      if (!message) {
        // errMessage가 없을경우 에러메시지 출력
        // message = covi.getDic('Msg_wrongLoginInfo');
        console.log(`response status not matching. ${errStatus}`);
        message = getDic('Msg_Error');
      }

      Alert.alert(
        'Alert',
        message,
        [
          {
            text: getDic('Ok'),
            onPress: () => {
              initInput();
              dispatch(loginInit());
            },
          },
        ],
        { cancelable: true },
      );
    }
  }, [authFail]);

  const handleChangeId = userId =>{
    setUserId(userId)
  }

  return (
    <>
      {!loading && (
        <>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View style={styles.LoginBox}>
              <Image
                style={styles.Logo}
                source={{
                  uri: `${getServer(
                    'HOST',
                  )}/chatStyle/common/image/common/logo.png`,
                }}
              />
              <MemoTextInput
                memKey="id"
                changeHandler={handleChangeId}
                value={userId}
                placeholder={
                  isExtUser ? getDic('Email') : getDic('LoginID')
                }
                disabled={loading}
              ></MemoTextInput>

              <TextInput
                style={{ ...styles.textForm_Type2, fontSize: sizes.large }}
                placeholder={getDic('Password')}
                value={password}
                secureTextEntry
                onChangeText={text => setPassword(text)}
                placeholderTextColor={'#AAA'}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  ...styles.LoginBtn_Type1,
                }}
                onPress={handleLogin}
              >
                <Text
                  style={{
                    fontSize: sizes.large,
                    ...styles.LoginBtn_Type1_Text,
                  }}
                >
                  {getDic('Login')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
          <KeySpacer spacing={getBottomPadding()} />
        </>
      )}
      {loading && <LoadingWrap />}
    </>
  );
};

const styles = StyleSheet.create({
  LogoContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  Logo: {
    width: 270,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  LoginBox: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: wp('13%'),
    paddingRight: wp('13%'),
  },
  textForm_Type1: {
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: '#999999',
    color: '#000',
    width: '100%',
    height: hp('6%'),
    padding: 10,
    borderTopRightRadius: 2,
    borderTopLeftRadius: 2,
  },
  textForm_Type2: {
    borderWidth: 0.5,
    borderTopColor: '#D5D5D5',
    borderLeftColor: '#999999',
    borderRightColor: '#999999',
    borderBottomColor: '#999999',

    color: '#000',
    width: '100%',
    height: hp('6%'),
    padding: 10,
    borderRadius: 2,
  },
  LoginBtn_Type1: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: hp('6%'),
    marginTop: hp('1%'),
    borderRadius: 2,
  },
  LoginBtn_Type1_Text: {
    color: 'white',
  },
  appDataDel: {
    alignItems: 'center',
    paddingTop: 40,
  },
  appDataDelTxt: {
    fontSize: 12.5,
    color: '#999',
  },
});

export default LoginBox;
