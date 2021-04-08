import React, { Component } from 'react';
import { AppState, Alert, Platform } from 'react-native';
import * as socketConnector from '@/lib/socket/socketConnect';
import { connect } from 'react-redux';
import { changeSocketConnect, sync } from '@/modules/login';
import { getChannels } from '@/modules/channel';
import * as db from '@/lib/appData/connector';
import * as LoginInfo from '@/lib/class/LoginInfo';
import * as RoomList from '@/lib/class/RoomList';
import * as api from '@API/login';
import { restartApp } from '@/lib/device/common';
import { getDic } from '@/config';

import PushNotificationIOS from '@react-native-community/push-notification-ios';

class AppStateHandler extends Component {
  state = {
    appState: '',
  };

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
    }

    if (
      this.state.appState == 'active' &&
      nextAppState.match(/inactive|background/)
    ) {
      socketConnector.closeSocket(true);
      this.props.changeSocketConnect('DC');
      db.closeConnection();

      RoomList.clearData();
    } else if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState == 'active'
    ) {
      const loginInfo = LoginInfo.getLoginInfo();

      if (loginInfo && loginInfo.getID()) {
        api.tokencheckRequest().then(({ data }) => {
          if (data.status == 'FAIL') {
            Alert.alert(
              null,
              '로그인이 만료되었습니다.\n재로그인해주시기 바랍니다.',
              [
                {
                  text: getDic('Ok'),
                  onPress: () => {
                    restartApp();
                  },
                },
              ],
            );
          } else if (data.status == 'SUCCESS') {
            const { token, accessid } = this.props.connObj.auth;
            const {
              socketActionsObj,
              handleConnect,
              handleDisconnect,
              handleReconnect,
            } = this.props.connObj;
            if (token) {
              socketConnector.getSocketInstance(
                { token, accessid },
                socketActionsObj,
                handleConnect,
                handleDisconnect,
                handleReconnect,
              );
            }

            if (this.props.networkState) {
              this.props.sync({
                showLoading: false,
                userList: Object.keys(this.props.fixedUsers),
              });
              this.props.getChannels({ userId: loginInfo.getID() });
            }
          }
        });
      }
    }
    this.state.appState = nextAppState;
  };

  render() {
    return null;
  }
}

export default connect(
  ({ app, presence }) => ({
    networkState: app.networkState,
    fixedUsers: presence.fixedUsers,
  }),
  { changeSocketConnect, sync, getChannels },
)(AppStateHandler);
