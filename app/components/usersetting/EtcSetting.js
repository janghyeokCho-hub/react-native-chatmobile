import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { useSelector } from 'react-redux';
import IconButton from '@COMMON/buttons/IconButton';
import * as db from '@/lib/appData/connector';
import { restartApp } from '@/lib/device/common';
import { initHostInfo, getDic } from '@/config';
const EtcSetting = () => {
  const { userInfo } = useSelector(({ login }) => ({
    userInfo: login.userInfo,
  }));

  return (
    <View style={styles.container}>
      <IconButton
        title={getDic('InitServerInfo')}
        onPress={() => {
          // App 재시작
          Alert.alert(
            getDic('Eumtalk'),
            '설정정보 초기화 시 앱이 재시작 됩니다.\r\n진행하시겠습니까?',
            [
              { text: getDic('Cancel'), onPress: () => {} },
              {
                text: getDic('Ok'),
                onPress: async () => {
                  try {
                    await AsyncStorage.removeItem('covi_user_jobInfo');
                    await AsyncStorage.removeItem('ESETINF');
                  } catch (err) {
                    console.log(
                      `AsyncStorage removeItem 'covi_user_jobInfo', 'ESETINF' occured an error : `,
                      err,
                    );
                  }
                  restartApp();
                },
              },
            ],
            {
              cancelable: true,
            },
          );
        }}
      />
      <IconButton
        title={getDic('InitDomainInfo')}
        onPress={() => {
          // App 재시작
          Alert.alert(
            getDic('Eumtalk'),
            getDic('Msg_InitDomainInfo'),
            [
              { text: getDic('Cancel'), onPress: () => {} },
              {
                text: getDic('Ok'),
                onPress: () => {
                  Promise.all([
                    initHostInfo(),
                    AsyncStorage.removeItem('ESETINF'),
                  ]).then(() => {
                    Alert.alert(
                      null,
                      getDic('Msg_InitSettinfInforResult'),
                      [
                        {
                          text: '확인',
                          onPress: () => {
                            restartApp();
                          },
                        },
                      ],
                      { cancelable: true },
                    );
                  });
                },
              },
            ],
            {
              cancelable: true,
            },
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  fontSizeView: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  syncBtn: {
    marginLeft: 'auto',
    fontSize: 16,
  },
  appDataDelBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});

export default EtcSetting;
