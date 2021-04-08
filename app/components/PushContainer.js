import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
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
import PushNotificationIOS from '@react-native-community/push-notification-ios';

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

            PushNotification.configure({
              onNotification: notification => {
                // Android Push Notification Open Event Linstener(Background)
                if (notification != undefined) {
                  if (navigator != undefined) {
                    const { roomID } = notification.roomID
                      ? notification
                      : notification.payload;
                    const { roomType } = notification.roomType
                      ? notification
                      : notification.payload && notification.payload.roomType
                      ? notification.payload
                      : { roomType: null };

                    if (!notification.data) {
                      if (roomType == 'C') {
                        dispatch(openChannel({ roomID: roomID }));
                        moveToChannelRoom(navigator, 'ChannelRoom', {
                          roomID: roomID,
                        });
                      } else {
                        dispatch(openRoom({ roomID: roomID }));
                        moveToRoom(navigator, 'ChatRoom', {
                          roomID: roomID,
                        });
                      }
                    }
                  }
                }
                if (Platform.OS === 'ios')
                  notification.finish(PushNotificationIOS.FetchResult.NoData);
              },
            });

            Notifications.events().registerNotificationReceivedBackground(
              (notification, completion) => {
                completion({ alert: true, sound: true, badge: false });
              },
            );
            // 안드로이드에서 실행 방지('유효하지 않은 접근' 에러 방어)
            Notifications.events().registerNotificationOpened(
              (notification, completion) => {
                // iOS Push NOtification Open Event Linstener(Background)
                if (notification !== undefined) {
                  if (navigator !== undefined) {
                    // notification.room* undefined 에러 방어
                    const { roomID } = notification.roomID
                      ? notification
                      : notification.payload;
                    const { roomType } = notification.roomType
                      ? notification
                      : notification.payload && notification.payload.roomType
                      ? notification.payload
                      : { roomType: null };
                    if (roomType === 'C') {
                      dispatch(openChannel({ roomID }));
                      moveToChannelRoom(navigator, 'ChannelRoom', {
                        roomID,
                      });
                    } else {
                      dispatch(openRoom({ roomID }));
                      moveToRoom(navigator, 'ChatRoom', {
                        roomID,
                      });
                    }
                  }
                }
                completion();
              },
            );
            Notifications.getInitialNotification()
              .then(notification => {
                // Android & iOS Push Notification Open Event Linstener(Background and App is close)
                if (notification != undefined) {
                  if (navigator != undefined) {
                    const { roomID } = notification.roomID
                      ? notification
                      : notification.payload;
                    const { roomType } = notification.roomType
                      ? notification
                      : notification.payload && notification.payload.roomType
                      ? notification.payload
                      : { roomType: null };

                    if (roomType == 'C') {
                      dispatch(openChannel({ roomID: roomID }));
                      moveToChannelRoom(navigator, 'ChannelRoom', {
                        roomID: roomID,
                      });
                    } else {
                      dispatch(openRoom({ roomID: roomID }));
                      moveToRoom(navigator, 'ChatRoom', {
                        roomID: roomID,
                      });
                    }
                  }
                }
              })
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
