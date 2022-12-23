import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import IconButton from '@COMMON/buttons/IconButton';
import SlideCheckedBox from '@COMMON/SlideCheckedBox';
import { getDic } from '@/config';
import { restartApp } from '@/lib/device/common';
import * as dbAction from '@/lib/appData/action';
import { withSecurityScreen } from '@/withSecurityScreen';

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
              title: getDic('Msg_InputSecondPassword'),
              subtitle: getDic('Msg_InputPinNumber'),
              handlePasswordDoubleCheckEvent: async data => {
                await dbAction.updateSecondPassword({
                  secondAuth: data.join(''),
                  useBioAuth: false,
                });
                await dbAction.getSecondPasswordInfo().then(data => {
                  setSecondAuthInfo(data);
                });
                await setSecondPasswordSetting(true);
                restartApp();
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
              {secondPasswordSetting ? getDic('On') : getDic('Off')}
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
                title: getDic('Msg_ChangeSecondPassword'),
                subtitle: getDic('Msg_InputPinNumber'),
                handlePasswordDoubleCheckEvent: async data => {
                  await dbAction.updateSecondPassword({
                    secondAuth: data.join(''),
                    useBioAuth: false,
                  });
                  await dbAction.getSecondPasswordInfo().then(data => {
                    setSecondAuthInfo(data);
                  });
                  await setSecondPasswordSetting(true);
                  restartApp();
                },
              });
            }}
          />
          <SlideCheckedBox
            title={getDic('BioAuthSetting')}
            checkValue={bioAuthSetting}
            onPress={async () => {
              const changeBioAuth = !secondAuthInfo.useBioAuth;
              setBioAuthSetting(changeBioAuth);
              await dbAction.updateSecondPassword({
                secondAuth: secondAuthInfo.secondPass,
                useBioAuth: changeBioAuth,
              });
              await dbAction.getSecondPasswordInfo().then(data => {
                setSecondAuthInfo(data);
              });
              restartApp();
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

export default withSecurityScreen(AppLockSetting);
