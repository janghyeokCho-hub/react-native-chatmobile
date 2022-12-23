import React, { useCallback, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Vibration,
  Animated,
} from 'react-native';
import { getDic } from '@/config';
import BackButtonIcon from '@C/common/icons/BackButtonIcon';
import BiometricsContainer from '@C/biometrics/BiometricsContainer';
import { withSecurityScreen } from '@/withSecurityScreen';

const SecondAuth = ({
  route,
  navigation,
  title,
  subtitle,
  handlePasswordConfirmEvent,
  handlePasswordSuccessEvent,
  bioAuth,
}) => {
  const [secPassword, setSecPassword] = useState([]);
  const [checkPassword, setCheckPassword] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');

  const [checkTitle, setCheckTitle] = useState(null);
  const [checkSubTitle, setCheckSubTitle] = useState(null);

  const handleInputPassword = value => {
    let ref = [];
    secPassword.map(item => {
      ref.push(item);
    });
    if (ref.length < 4) {
      ref.push(value);
    }
    if (ref.length == 4) {
      const doubleCheckEvent =
        route != null ? route.params.handlePasswordDoubleCheckEvent : null;
      if (doubleCheckEvent && checkPassword == null) {
        setCheckPassword(ref.join(''));
        setSecPassword([]);
        setCheckTitle(getDic('Msg_InputPasswordCheck'));
        setCheckSubTitle(getDic('Msg_ChangeSecondPasswordSubTitle'));
        return;
      } else if (doubleCheckEvent && checkPassword != null) {
        if (checkPassword == ref.join('')) {
          doubleCheckEvent(ref);
          if (navigation != null) {
            navigation.goBack();
          }
        } else {
          Vibration.vibrate(100);
          setErrorMsg(getDic('Msg_WrongSecondCheckPassword'));
          Animated.sequence([
            Animated.timing(shakeErrMsg, {
              toValue: 5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeErrMsg, {
              toValue: -5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeErrMsg, {
              toValue: 5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeErrMsg, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setErrorMsg('');
          });

          setSecPassword([]);
        }
        return;
      }
      const handleEvent =
        route != null
          ? route.params.handlePasswordConfirmEvent
          : handlePasswordConfirmEvent;
      if (handleEvent != null) {
        if (!handleEvent(ref)) {
          Vibration.vibrate(100);
          setErrorMsg(getDic('Msg_WrongSecondPassword'));
          Animated.sequence([
            Animated.timing(shakeErrMsg, {
              toValue: 5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeErrMsg, {
              toValue: -5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeErrMsg, {
              toValue: 5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeErrMsg, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setErrorMsg('');
          });

          setSecPassword([]);
        } else {
          if (navigation != null) {
            navigation.goBack();
          }
        }
        return;
      }
    }
    setSecPassword(ref);
  };

  const handleRemovePassword = () => {
    secPassword.pop();
    let ref = [];
    secPassword.map(item => {
      ref.push(item);
    });
    setSecPassword(ref);
  };

  const shakeErrMsg = useRef(new Animated.Value(0)).current;
  const bioAuthSuccessEventHandler = useCallback(
    success => {
      if (success) {
        handlePasswordSuccessEvent();
      }
    },
    [handlePasswordSuccessEvent],
  );

  return (
    <SafeAreaView style={{ flex: 1, marginTop: 80 }}>
      {bioAuth && (
        <BiometricsContainer
          bioAuthSuccessEventHandler={bioAuthSuccessEventHandler}
        />
      )}
      <View style={styles.header}>
        <Text style={styles.title}>
          {checkTitle != null
            ? checkTitle
            : route != null
            ? route.params.title
            : title}
        </Text>
        <Text style={styles.subtitle}>
          {checkSubTitle != null
            ? checkSubTitle
            : route != null
            ? route.params.subtitle
            : subtitle}
        </Text>
        <Animated.View style={{ transform: [{ translateY: shakeErrMsg }] }}>
          <Text style={styles.errorMsg}>{errorMsg}</Text>
        </Animated.View>
      </View>
      <View style={styles.showPassword}>
        <View style={styles.passwordContainer}>
          <Text style={styles.passwordText}>
            {secPassword[0] != null && '*'}
          </Text>
        </View>
        <View style={styles.passwordContainer}>
          <Text style={styles.passwordText}>
            {secPassword[1] != null && '*'}
          </Text>
        </View>
        <View style={styles.passwordContainer}>
          <Text style={styles.passwordText}>
            {secPassword[2] != null && '*'}
          </Text>
        </View>
        <View style={styles.passwordContainer}>
          <Text style={styles.passwordText}>
            {secPassword[3] != null && '*'}
          </Text>
        </View>
      </View>
      <View style={styles.insertPassword}>
        <View style={styles.insertPasswordRow}>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleInputPassword(1);
            }}
          >
            <Text style={styles.insertPasswordText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleInputPassword(2);
            }}
          >
            <Text style={styles.insertPasswordText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleInputPassword(3);
            }}
          >
            <Text style={styles.insertPasswordText}>3</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.insertPasswordRow}>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleInputPassword(4);
            }}
          >
            <Text style={styles.insertPasswordText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleInputPassword(5);
            }}
          >
            <Text style={styles.insertPasswordText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleInputPassword(6);
            }}
          >
            <Text style={styles.insertPasswordText}>6</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.insertPasswordRow}>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleInputPassword(7);
            }}
          >
            <Text style={styles.insertPasswordText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleInputPassword(8);
            }}
          >
            <Text style={styles.insertPasswordText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleInputPassword(9);
            }}
          >
            <Text style={styles.insertPasswordText}>9</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.insertPasswordRow}>
          <TouchableOpacity style={styles.insertPasswordColumn}>
            <Text style={styles.insertPasswordText} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleInputPassword(0);
            }}
          >
            <Text style={styles.insertPasswordText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.insertPasswordColumn}
            onPress={() => {
              handleRemovePassword();
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <BackButtonIcon />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flex: 0.2,
    marginTop: 80,
    justifyContent: 'center',
  },

  showPassword: {
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordContainer: {
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: '#12cfee',
    marginLeft: 55,
  },
  passwordText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 3,
    justifyContent: 'center',
    color: 'white',
  },

  insertPassword: {
    flex: 1,
  },
  insertPasswordRow: {
    flexDirection: 'row',
  },
  insertPasswordColumn: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    height: 90,
    borderWidth: 1,
    borderColor: 'silver',
  },
  insertPasswordText: {
    fontSize: 24,
    textAlign: 'center',
  },

  title: {
    fontSize: 24,
    marginTop: 50,
    color: 'black',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 15,
    color: 'silver',
    textAlign: 'center',
  },
  errorMsg: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 25,
  },
});

export default withSecurityScreen(SecondAuth);
