import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, View } from 'react-native';
import IconButton from '@COMMON/buttons/IconButton';
import SlideCheckedBox from '@COMMON/SlideCheckedBox';
import { getDic } from '@/config';

const AppLockSetting = ({ navigation }) => {
  const [passwd, setPasswd] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('covi_user_scd_passwd').then(data => {
      console.log('data=>', data);
      if (data != null) {
        setPasswd(data);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <SlideCheckedBox
        title={getDic('SecondPasswordSetting')}
        checkValue={passwd ? true : false}
        onPress={() => {}}
      />
      {passwd ? (
        <IconButton
          title={getDic('SecondPasswordChange')}
          onPress={() => {
            openJobInfoModal();
          }}
        />
      ) : (
        <></>
      )}
      <SlideCheckedBox
        title={getDic('BioAuthSetting')}
        checkValue={passwd ? true : false}
        onPress={() => {}}
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
});
export default AppLockSetting;
