import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import SlideCheckedBox from '@COMMON/SlideCheckedBox';
import {
  modifyNotification,
  getNotification,
  changeNotificationBlockOption,
} from '@/lib/api/setting';
import messaging from '@react-native-firebase/messaging';
import { getDic, getConfig } from '@/config';
import { changeMyInfo } from '@/modules/login';
import { withSecurityScreen } from '@/withSecurityScreen';

const AlertSetting = ({ navigation }) => {
  const dispatch = useDispatch();
  const { myInfo } = useSelector(({ login }) => ({
    myInfo: login.userInfo,
  }));
  const useNotificationBlock = getConfig('NotificationBlock');
  const [isNoti, setIsNoti] = useState(true);
  const [showNotiContent, setShowNotiContent] = useState(true);
  const [notificationBlock, setNotificationBlock] = useState(
    myInfo.notificationBlock === 'Y',
  );

  useEffect(() => {
    initFn();
  }, [initFn]);

  const initFn = useCallback(async () => {
    const pushID = await messaging().getToken();
    getNotification({ pushID }).then(({ data }) => {
      if (data.status == 'SUCCESS' && data.result) {
        if (data.result.isNoti !== undefined) {
          setIsNoti(data.result.isNoti);
        }
        if (data.result.showNotiContent !== undefined) {
          setShowNotiContent(data.result.showNotiContent);
        }
      }
    });
  }, []);

  const setNotification = useCallback(
    async type => {
      try {
        const pushID = await messaging().getToken();
        let params = {};

        if (type === 'isNoti') {
          params.isNoti = !isNoti;
        }
        if (type === 'showNotiContent') {
          params.showNotiContent = !showNotiContent;
        }

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

  const setNotiBlock = option => {
    changeNotificationBlockOption({ notificationBlock: option }).then(
      response => {
        setNotificationBlock(option === 'Y' ? true : false);
        dispatch(
          changeMyInfo({
            notificationBlock: option,
          }),
        );
      },
    );
  };

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
      {useNotificationBlock && useNotificationBlock === 'Y' && (
        <SlideCheckedBox
          title={getDic('SetWorkTimeNoti')}
          checkValue={notificationBlock}
          onPress={() => {
            setNotiBlock(!notificationBlock ? 'Y' : 'N');
          }}
        />
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
});

export default withSecurityScreen(AlertSetting);
