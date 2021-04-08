import React, { Component } from 'react';
import { Platform, BackHandler } from 'react-native';
import { connect } from 'react-redux';

class MenuBoxBack extends Component {
  componentDidMount() {
    if (Platform.OS == 'android') {
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
      this.props.handleClose();

      return true;
    }
  };

  render() {
    return null;
  }
}

export default connect(({ app }) => ({
  isBackLock: app.backHandler['ChatMenuBox'],
}))(MenuBoxBack);
