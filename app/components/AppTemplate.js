import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import ContactList from '@C/contact/ContactList';
import ChatList from '@C/chat/ChatList';
import OrgChartList from '@C/orgchart/OrgChartList';
import ChannelList from '@C/channel/ChannelList';
import UserSetting from '@C/usersetting/UserSetting';
import Icon from '@COMMON/icons';
import { useSelector } from 'react-redux';
import UnreadCntButton from '@COMMON/buttons/UnreadCntButton';
import PushContainer from '@/components/PushContainer';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import AppTemplateBack from './AppTemplateBack';
import { getServer, getConfig } from '@/config';

const Tab = createBottomTabNavigator();

const AppTemplate = ({ navigation }) => {
  const myInfo = useSelector(({ login }) => login.userInfo);
  const [useChannel, setUseChannel] = useState('Y');

  useEffect(() => {
    const useChannelConfig = getConfig('UseChannel', 'Y');
    setUseChannel(useChannelConfig);
  }, []);

  const unreadCnt = useSelector(
    ({ room }) => {
      const rooms = room.rooms;
      let cnt = 0;
      if (rooms) {
        rooms.forEach(item => {
          cnt += item.unreadCnt;
        });
      }
      return cnt;
    },
    (left, right) => left == right,
  );

  const unreadChannelCnt = useSelector(
    ({ channel }) => {
      const channels = channel.channels;
      let cnt = 0;
      if (channels) {
        channels.forEach(item => {
          if (item.unreadCnt) cnt += item.unreadCnt;
        });
      }
      return cnt;
    },
    (left, right) => left == right,
  );

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        paddingTop: getTopPadding(),
        backgroundColor: '#fff',
      }}
    >
      <PushContainer navigator={navigation} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let icon = route.name;
            return (
              <View
                style={{
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Icon name={route.name} focus={focused} />
                {icon == 'Chat' ? (
                  <UnreadCntButton>{unreadCnt}</UnreadCntButton>
                ) : icon == 'Channel' ? (
                  <UnreadCntButton>{unreadChannelCnt}</UnreadCntButton>
                ) : (
                  <></>
                )}
              </View>
            );
          },
        })}
        tabBarOptions={{
          showLabel: false,
          keyboardHidesTabBar: true,
          style: {
            backgroundColor: '#FFF',
            elevation: 0, // remove shadow on Android
            shadowOpacity: 0, // remove shadow on iOS
            borderTopWidth: 0.6,
            borderTopColor: '#DDD',
            paddingBottom: getBottomPadding(),
            paddingLeft: 10,
            paddingRight: 10,
          },
        }}
        backBehavior="none"
      >
        {myInfo && myInfo.isExtUser !== 'Y' && (
          <Tab.Screen name="Contact" component={ContactList} />
        )}
        <Tab.Screen name="Chat" component={ChatList} />
        {myInfo && myInfo.isExtUser !== 'Y' && (
          <Tab.Screen name="OrgChart" component={OrgChartList} />
        )}
        {useChannel === 'Y' && (
          <Tab.Screen name="Channel" component={ChannelList} />
        )}
        <Tab.Screen name="UserSetting" component={UserSetting} />
      </Tab.Navigator>
      <AppTemplateBack navigation={navigation} />
    </View>
  );
};

export default AppTemplate;
