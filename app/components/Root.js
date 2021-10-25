import React from 'react';
import { StatusBar, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CommonActions } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import Login from '@C/login/Login';
import LoginBox from '@C/login/LoginBox';
import AppTemplate from '@C/AppTemplate';
import TokenChecker from '@C/login/TokenChecker';
import { useSelector } from 'react-redux';
import ChatRoom from '@C/chat/chatroom/ChatRoom';
import ChannelRoom from '@C/channel/channelroom/ChannelRoom';
import MoveView from '@C/chat/chatroom/move/MoveView';
import ProfilePopup from '@COMMON/ProfilePopup';
import AddContact from '@C/contact/AddContact';
import MakeRoom from '@C/chat/chatroom/normal/MakeRoom';
import { navigationRef } from '@/components/RootNavigation';

/* 쪽지 */
import NewNote from '@C/note/NewNote';
import ReadNote from '@C/note/ReadNote';
import AddTarget from '@C/note/AddTarget';
/* 쪽지 */

import {
  InfoSetting,
  PasswordSetting,
  AppLockSetting,
  ChatSetting,
  AlertSetting,
  VersionInfo,
  EtcSetting,
} from '@C/usersetting';
import {
  PhotoSummary,
  FileSummary,
  ChangeRoomInfo,
  ChatSettingBox,
  InviteMember,
  ImageList,
  EditGroup
} from '@C/chat/chatroom/layer';
import {
  InviteExtUser,
  CreateChannelView,
  SelectChannelMemberView,
  InviteChannelMember,
  CategorySelectView,
  ChannelInfoDetailView,
  ChangeChannelInfoView,
} from '@C/channel/layer';
import SecondAuth from '@C/auth/SecondAuth';
import ModalContainer from './ModalContainer';

import { getDic } from '@/config';

const Root = ({ stack, theme }) => {
  const Stack = stack;

  const { token, authCheck } = useSelector(({ login }) => ({
    token: login.token,
    authCheck: login.authCheck,
  }));

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <NavigationContainer theme={theme} ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {!authCheck ? (
            <Stack.Screen name="TockenChecker" component={TokenChecker} />
          ) : token == null ? (
            <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="LoginBox" component={LoginBox} />
            </>
          ) : (
            <>
              <Stack.Screen
                name="App"
                component={AppTemplate}
                options={{ title: '' }}
              />
              <Stack.Screen name="ChatRoom" component={ChatRoom} />
              <Stack.Screen name="ChannelRoom" component={ChannelRoom} />

              <Stack.Screen name="NewNote" component={NewNote} />
              <Stack.Screen name="ReadNote" component={ReadNote} />
              <Stack.Screen name="AddNoteTarget" component={AddTarget} />

              <Stack.Screen name="MakeRoom" component={MakeRoom} />
              <Stack.Screen name="MoveChat" component={MoveView} />
              <Stack.Screen name="ProfilePopup" component={ProfilePopup} />
              <Stack.Screen name="AddContact" component={AddContact} />
              <Stack.Screen name="InviteMember" component={InviteMember} />
              <Stack.Screen
                name="InviteChannelMember"
                component={InviteChannelMember}
              />
              <Stack.Screen name="InviteExtUser" component={InviteExtUser} />
              <Stack.Screen name="SecondAuth" component={SecondAuth} />
              <Stack.Screen
                name="CategorySelect"
                component={CategorySelectView}
              />
              <Stack.Screen
                name="CreateChannel"
                component={CreateChannelView}
              />
              <Stack.Screen
                name="SelectChannelMemberView"
                component={SelectChannelMemberView}
              />
              <Stack.Screen name="PhotoSummary" component={PhotoSummary} />
              <Stack.Screen name="FileSummary" component={FileSummary} />
              <Stack.Screen name="ImageList" component={ImageList} />
              <Stack.Screen name="ChangeRoomInfo" component={ChangeRoomInfo} />
              <Stack.Screen name="ChatSettingBox" component={ChatSettingBox} />
              <Stack.Screen
                name="ChannelInfo"
                component={ChannelInfoDetailView}
                options={({ navigation }) => ({
                  title: getDic('ChannelInfo'),
                  headerShown: true,
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{
                        paddingLeft: 10,
                        paddingRight: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                      onPress={() => {
                        navigation.dispatch(CommonActions.goBack);
                      }}
                    >
                      <Svg
                        width="7.131"
                        height="12.78"
                        viewBox="0 0 7.131 12.78"
                      >
                        <Path
                          id="패스_2901"
                          data-name="패스 2901"
                          d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                          transform="translate(704.432 304.223) rotate(180)"
                          fill="#222"
                        />
                      </Svg>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="ChangeChannelInfo"
                component={ChangeChannelInfoView}
                options={({ navigation }) => ({
                  title: getDic('ChangeChannelInfo'),
                  headerShown: true,
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{
                        paddingLeft: 10,
                        paddingRight: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                      onPress={() => {
                        navigation.dispatch(CommonActions.goBack);
                      }}
                    >
                      <Svg
                        width="7.131"
                        height="12.78"
                        viewBox="0 0 7.131 12.78"
                      >
                        <Path
                          id="패스_2901"
                          data-name="패스 2901"
                          d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                          transform="translate(704.432 304.223) rotate(180)"
                          fill="#222"
                        />
                      </Svg>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="InfoSetting"
                component={InfoSetting}
                options={({ navigation }) => ({
                  title: getDic('MyInfo'),
                  headerShown: true,
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{
                        paddingLeft: 10,
                        paddingRight: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                      onPress={() => {
                        navigation.dispatch(CommonActions.goBack);
                      }}
                    >
                      <Svg
                        width="7.131"
                        height="12.78"
                        viewBox="0 0 7.131 12.78"
                      >
                        <Path
                          id="패스_2901"
                          data-name="패스 2901"
                          d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                          transform="translate(704.432 304.223) rotate(180)"
                          fill="#222"
                        />
                      </Svg>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="PasswordSetting"
                component={PasswordSetting}
                options={({ navigation }) => ({
                  title: getDic('PasswordChange'),
                  headerShown: true,
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{
                        paddingLeft: 10,
                        paddingRight: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                      onPress={() => {
                        navigation.dispatch(CommonActions.goBack);
                      }}
                    >
                      <Svg
                        width="7.131"
                        height="12.78"
                        viewBox="0 0 7.131 12.78"
                      >
                        <Path
                          id="패스_2901"
                          data-name="패스 2901"
                          d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                          transform="translate(704.432 304.223) rotate(180)"
                          fill="#222"
                        />
                      </Svg>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="AppLockSetting"
                component={AppLockSetting}
                options={({ navigation }) => ({
                  title: getDic('AppLockSetting'),
                  headerShown: true,
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{
                        paddingLeft: 10,
                        paddingRight: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                      onPress={() => {
                        navigation.dispatch(CommonActions.goBack);
                      }}
                    >
                      <Svg
                        width="7.131"
                        height="12.78"
                        viewBox="0 0 7.131 12.78"
                      >
                        <Path
                          id="패스_2901"
                          data-name="패스 2901"
                          d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                          transform="translate(704.432 304.223) rotate(180)"
                          fill="#222"
                        />
                      </Svg>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="ChatSetting"
                component={ChatSetting}
                options={({ navigation }) => ({
                  title: getDic('ChatSetting'),
                  headerShown: true,
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{
                        paddingLeft: 10,
                        paddingRight: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                      onPress={() => {
                        navigation.dispatch(CommonActions.goBack);
                      }}
                    >
                      <Svg
                        width="7.131"
                        height="12.78"
                        viewBox="0 0 7.131 12.78"
                      >
                        <Path
                          id="패스_2901"
                          data-name="패스 2901"
                          d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                          transform="translate(704.432 304.223) rotate(180)"
                          fill="#222"
                        />
                      </Svg>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="AlertSetting"
                component={AlertSetting}
                options={({ navigation }) => ({
                  title: getDic('Notification'),
                  headerShown: true,
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{
                        paddingLeft: 10,
                        paddingRight: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                      onPress={() => {
                        navigation.dispatch(CommonActions.goBack);
                      }}
                    >
                      <Svg
                        width="7.131"
                        height="12.78"
                        viewBox="0 0 7.131 12.78"
                      >
                        <Path
                          id="패스_2901"
                          data-name="패스 2901"
                          d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                          transform="translate(704.432 304.223) rotate(180)"
                          fill="#222"
                        />
                      </Svg>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="VersionInfo"
                component={VersionInfo}
                options={({ navigation }) => ({
                  title: getDic('VersionInfo'),
                  headerShown: true,
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{
                        paddingLeft: 10,
                        paddingRight: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                      onPress={() => {
                        navigation.dispatch(CommonActions.goBack);
                      }}
                    >
                      <Svg
                        width="7.131"
                        height="12.78"
                        viewBox="0 0 7.131 12.78"
                      >
                        <Path
                          id="패스_2901"
                          data-name="패스 2901"
                          d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                          transform="translate(704.432 304.223) rotate(180)"
                          fill="#222"
                        />
                      </Svg>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="EtcSetting"
                component={EtcSetting}
                options={({ navigation }) => ({
                  title: getDic('Etc'),
                  headerShown: true,
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{
                        paddingLeft: 10,
                        paddingRight: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                      onPress={() => {
                        navigation.dispatch(CommonActions.goBack);
                      }}
                    >
                      <Svg
                        width="7.131"
                        height="12.78"
                        viewBox="0 0 7.131 12.78"
                      >
                        <Path
                          id="패스_2901"
                          data-name="패스 2901"
                          d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                          transform="translate(704.432 304.223) rotate(180)"
                          fill="#222"
                        />
                      </Svg>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen name="EditGroup" component={EditGroup} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      <ModalContainer />
    </>
  );
};

export default Root;
