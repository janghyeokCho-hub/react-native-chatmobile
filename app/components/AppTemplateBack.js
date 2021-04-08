import React, { Component } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { connect } from 'react-redux';
import { addBackHandler } from '@/modules/app';
import { exitApp } from '@/lib/device/common';
import { CommonActions } from '@react-navigation/native';
import { getDic } from '@/config';

class AppTemplateBack extends Component {
  constructor(props) {
    super(props);
    this.state = { isExitApp: false };
  }

  componentDidMount() {
    if (Platform.OS == 'android') {
      if (this.props.isBackLock == undefined) {
        this.props.addBackHandler({ name: 'AppTemplate' });
      }
      BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
    }
  }

  componentWillUnmount() {
    if (Platform.OS == 'android') {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        this._handleBackPress,
      );
    }
  }

  _handleBackPress = () => {
    if (this.props.isBackLock) {
      if (!this.props.navigation.canGoBack()) {
        let timeOut;
        if (this.state.isExitApp) {
          clearTimeout(timeOut);
          exitApp();
        } else {
          ToastAndroid.show(getDic('Msg_BackButtonExit'), ToastAndroid.SHORT);
          this.setState({ isExitApp: true });
          timeOut = setTimeout(() => {
            this.setState({ isExitApp: false });
          }, 2000);
        }
      } else {
        this.props.navigation.dispatch(CommonActions.goBack());
      }

      return true;
    }
  };

  render() {
    return null;
  }
}

export default connect(
  ({ app }) => ({
    isBackLock: app.backHandler['AppTemplate'],
  }),
  { addBackHandler },
)(AppTemplateBack);
