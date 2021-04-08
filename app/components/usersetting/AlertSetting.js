import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import SlideCheckedBox from '@COMMON/SlideCheckedBox';
import { modifyNotification, getNotification } from '@/lib/api/setting';
import messaging from '@react-native-firebase/messaging';
import { getDic } from '@/config';

const AlertSetting = ({ navigation }) => {
  const [isNoti, setIsNoti] = useState(true);
  const [showNotiContent, setShowNotiContent] = useState(true);

  useEffect(() => {
    initFn();
  }, []);

  const initFn = useCallback(async () => {
    const pushID = await messaging().getToken();
    getNotification({ pushID }).then(({ data }) => {
      if (data.status == 'SUCCESS' && data.result) {
        if (data.result.isNoti != undefined) setIsNoti(data.result.isNoti);
        if (data.result.showNotiContent != undefined)
          setShowNotiContent(data.result.showNotiContent);
      }
    });
  }, []);

  const setNotification = useCallback(
    async type => {
      try {
        const pushID = await messaging().getToken();
        let params = {};

        if (type === 'isNoti') params.isNoti = !isNoti;
        if (type === 'showNotiContent')
          params.showNotiContent = !showNotiContent;

        modifyNotification({ pushID, notiInfo: params })
          .then(({ data }) => {
            if (data.status == 'SUCCESS') {
            } else {
              setIsNoti(isNoti);
              setShowNotiContent(showNotiContent);
            }
          })
          .catch(e => {
            setIsNoti(isNoti);
            setShowNotiContent(showNotiContent);
          });
      } catch (e) {
        setIsNoti(isNoti);
        setShowNotiContent(showNotiContent);
      }
    },
    [isNoti, showNotiContent],
  );

  return (
    <View style={styles.container}>
      <SlideCheckedBox
        title={getDic('UseNoti')}
        checkValue={isNoti}
        onPress={() => {
          setIsNoti(!isNoti);
          setNotification('isNoti');
        }}
      />
      <SlideCheckedBox
        title={getDic('ShowNoti')}
        checkValue={showNotiContent}
        onPress={() => {
          setShowNotiContent(!showNotiContent);
          setNotification('showNotiContent');
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
});
export default AlertSetting;
