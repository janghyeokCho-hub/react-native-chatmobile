import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import IconButton from '@COMMON/buttons/IconButton';
import SlideCheckedBox from '@COMMON/SlideCheckedBox';
import { getDic } from '@/config';
import * as dbAction from '@/lib/appData/action';

const AppLockSetting = ({ navigation }) => {
  const [secondPasswordSetting, setSecondPasswordSetting] = useState(false);
  const [bioAuthSetting, setBioAuthSetting] = useState(false);
  const [secondAuthInfo, setSecondAuthInfo] = useState(null);

  useEffect(() => {
    dbAction.getSecondPasswordInfo().then(data => {
      if (data != null) {
        setSecondPasswordSetting(true);
        setBioAuthSetting(data.useBioAuth);
        setSecondAuthInfo(data);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <IconButton
        title={getDic('SecondPasswordSetting')}
        onPress={() => {
          if (secondAuthInfo != null) {
            setSecondAuthInfo(null);
            dbAction.updateSecondPassword(null);
            dbAction.getSecondPasswordInfo().then(data => {
              setSecondAuthInfo(data);
            });
            setSecondPasswordSetting(false);
          } else {
            navigation.navigate('SecondAuth', {
              title: '2차 비밀번호를 입력해주세요.',
              subtitle: '4자리로 된 PIN 번호를 입력해주세요.',
              handlePasswordConfirmEvent: data => {
                dbAction.updateSecondPassword({
                  secondAuth: data.join(''),
                  useBioAuth: false,
                });
                dbAction.getSecondPasswordInfo().then(data => {
                  setSecondAuthInfo(data);
                });
                setSecondPasswordSetting(true);
                return true;
              },
            });
          }
        }}
        icon={
          <View style={styles.fontSizeView}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '400',
                color: secondPasswordSetting ? '#12cfee' : '#808080',
              }}
            >
              {secondPasswordSetting ? '켜짐' : '꺼짐'}
            </Text>
          </View>
        }
      />
      {secondPasswordSetting ? (
        <View>
          <IconButton
            title={getDic('SecondPasswordChange')}
            onPress={() => {
              navigation.navigate('SecondAuth', {
                title: '2차 비밀번호를 입력해주세요.',
                subtitle: '4자리로 된 PIN 번호를 입력해주세요.',
                handlePasswordConfirmEvent: data => {
                  dbAction.updateSecondPassword({
                    secondAuth: data.join(''),
                    useBioAuth: false,
                  });
                  dbAction.getSecondPasswordInfo().then(data => {
                    setSecondAuthInfo(data);
                  });
                  setSecondPasswordSetting(true);
                  return true;
                },
              });
            }}
          />
          <SlideCheckedBox
            title={getDic('BioAuthSetting')}
            checkValue={bioAuthSetting}
            onPress={() => {
              const changeBioAuth = !secondAuthInfo.useBioAuth;
              setBioAuthSetting(changeBioAuth);
              dbAction.updateSecondPassword({
                secondAuth: secondAuthInfo.secondPass,
                useBioAuth: changeBioAuth,
              });
              dbAction.getSecondPasswordInfo().then(data => {
                setSecondAuthInfo(data);
              });
            }}
          />
        </View>
      ) : (
        <></>
      )}
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
});
export default AppLockSetting;
