import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text, Image } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getConfig, getDic } from '@/config';
import LoginBox from './LoginBox';
import { useTheme } from '@react-navigation/native';
import { getServer } from '@/config';
import { withSecurityScreen } from '@/withSecurityScreen';

const Login = ({ navigation }) => {
  const { colors, sizes } = useTheme();
  const enabledExtUser = getConfig('EnabledExtUser', 'Y');

  const goLoginBox = isExtUser => {
    navigation.navigate('LoginBox', { isExtUser });
  };

  return (
    <>
      {(enabledExtUser === 'Y' && (
        <View style={styles.LoginBox}>
          <Image
            style={styles.Logo}
            source={{
              uri: `${getServer(
                'HOST',
              )}/chatStyle/common/image/common/logo.png`,
            }}
          />
          <TouchableOpacity
            style={{
              ...styles.LoginBtn_Type1,
              backgroundColor: colors.primary,
            }}
            onPress={() => goLoginBox(false)}
          >
            <Text
              style={{ ...styles.LoginBtn_Type1_Text, fontSize: sizes.large }}
            >
              {getDic('EmployeeLogin')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.LoginBtn_Type2}
            onPress={() => goLoginBox(true)}
          >
            <Text
              style={{ ...styles.LoginBtn_Type2_Text, fontSize: sizes.large }}
            >
              {getDic('ExternalLogin')}
            </Text>
          </TouchableOpacity>
        </View>
      )) || <LoginBox />}
    </>
  );
};

const styles = StyleSheet.create({
  Logo: {
    width: 270,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  LoginBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: wp('13%'),
    paddingRight: wp('13%'),
    backgroundColor: 'white',
  },
  LoginBtn_Type1: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: hp('6%'),
    marginBottom: hp('1%'),
    borderRadius: 2,
  },
  LoginBtn_Type1_Text: {
    color: 'white',
  },
  LoginBtn_Type2: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: hp('6%'),
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#BBB',
    borderRadius: 2,
  },
});

export default withSecurityScreen(Login);
