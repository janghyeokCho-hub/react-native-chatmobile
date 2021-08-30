import React, { useEffect, useState, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
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
import SecondAuth from '@C/auth/SecondAuth';
import * as dbAction from '@/lib/appData/action';
import { useNoteUnreadCount } from '@/lib/note/state';
import Note from '@/components/note/Note';

const Tab = createBottomTabNavigator();

const AppTemplate = ({ navigation }) => {
  const myInfo = useSelector(({ login }) => login.userInfo);
  const [useChannel, setUseChannel] = useState('Y');
  const [secondAuth, setSecondAuth] = useState(false);
  const [secondAuthInfo, setSecondAuthInfo] = useState(null);
  const useNote = useMemo(() => {
    return getConfig('UseNote', { use: 'N' });
  }, []);
  const unreadNoteCnt = useNoteUnreadCount();

  useEffect(() => {
    const useChannelConfig = getConfig('UseChannel', 'Y');
    setUseChannel(useChannelConfig);

    dbAction.getSecondPasswordInfo().then(data => {
      setSecondAuthInfo(data);
    });
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

  return secondAuthInfo != null && !secondAuth ? (
    <SecondAuth
      title="2차 비밀번호를 입력해주세요."
      subtitle="4자리 숫자로 된 PIN 번호를 입력해주세요."
      bioAuth={secondAuthInfo.useBioAuth}
      handlePasswordConfirmEvent={data => {
        if (data.join('') === secondAuthInfo.secondPass) {
          setSecondAuth(true);
          return true;
        } else return false;
      }}
      handlePasswordSuccessEvent={() => {
        setSecondAuth(true);
      }}
    />
  ) : (
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
            let _unreadCnt = 0;
            if (icon === 'Chat') {
              _unreadCnt = unreadCnt;
            } else if (icon === 'Channel') {
              _unreadCnt = unreadChannelCnt;
            } else if (icon === 'Note') {
              _unreadCnt = unreadNoteCnt;
            }
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
                {
                    <UnreadCntButton>{_unreadCnt}</UnreadCntButton>
                }
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
        {useNote?.use === 'Y' && (
          <Tab.Screen name="Note" component={Note} />
        )}
        <Tab.Screen name="UserSetting" component={UserSetting} />
      </Tab.Navigator>
      <AppTemplateBack navigation={navigation} />
    </View>
  );
};

export default AppTemplate;
