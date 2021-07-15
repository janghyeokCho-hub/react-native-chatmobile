import React, { useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import * as Device from '@API/device';
import PushNotification from 'react-native-push-notification';
import { Notifications } from 'react-native-notifications';
import { openRoom } from '@/modules/room';
import { openChannel } from '@/modules/channel';
import { moveToRoom } from '@/lib/roomUtil';
import { moveToChannelRoom } from '@/lib/channelUtil';

const PushContainer = ({ navigator }) => {
  const { userInfo } = useSelector(({ login }) => ({
    userInfo: login.userInfo,
  }));

  const requestPermission = async () => {
    return await messaging().requestPermission();
  };

  const requestToken = async () => {
    return await messaging().getToken();
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      const handleNotification = (notification, completion) => {
        if (typeof notification === 'undefined') {
          // 정상적인 알림이 아닐 경우 동작하지 않도록 함
          return;
        }
        if (notification?.noteId || notification?.payload?.noteId) {
          // 쪽지알림 처리
          Alert.alert('쪽지', '쪽지는 PC에서 학인해주세요.');
          return;
        }

        const { roomID } = notification.roomID ? notification : notification?.payload;
        const { roomType } = notification?.roomType ? notification : notification?.payload;

        // 방 정보가 유효하지 않을 경우 동작하지 않도록 함
        if (!roomID || !roomType || notification?.data) {
          return;
        }
        if (roomType === 'C') {
          dispatch(openChannel({ roomID: roomID }));
          moveToChannelRoom(navigator, 'ChannelRoom', {
            roomID,
          });
        } else if (roomType === 'M') {
          dispatch(openRoom({ roomID: roomID }));
          moveToRoom(navigator, 'ChatRoom', {
            roomID,
          });
        }

        // Notifications.events().registerNotificationOpened
        if (typeof completion !== 'undefined') {
          completion();
        }
      };
      requestPermission().then(result => {
        if (result) {
          requestToken().then(token => {
            const data = {
              userID: userInfo.id,
              deviceType: DeviceInfo.getSystemName(),
              deviceVersion: DeviceInfo.getSystemVersion(),
              deviceInfo: DeviceInfo.getUniqueId(),
              pushID: token,
            };
            Device.addDevice(data);

            PushNotification.setApplicationIconBadgeNumber(0);

            Notifications.events().registerNotificationReceivedBackground(
              (notification, completion) => {
                completion({ alert: true, sound: true, badge: false });
              },
            );

            /* iOS Push Notification Open Event Linstener(Background) */
            Notifications.events().registerNotificationOpened(handleNotification);

            /* Android & iOS Push Notification Open Event Linstener(Background and App is close) */
            Notifications.getInitialNotification().then(handleNotification)
              .catch(error => {
                console.log(error);
              });
          });
        }
      });
    }
  }, [userInfo]);

  return null;
};

export default PushContainer;
