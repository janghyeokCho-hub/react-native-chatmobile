import React, { Component } from 'react';
import { Platform, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { addBackHandler, delBackHandler } from '@/modules/app';

class SummaryBack extends Component {
  componentDidMount() {
    if (Platform.OS == 'android') {
      if (this.props.isBackLock == undefined) {
        this.props.addBackHandler({ name: 'SummaryBack' });
      }
      BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
    }
  }

  componentWillUnmount() {
    if (Platform.OS == 'android') {
      this.props.delBackHandler({ name: 'SummaryBack' });

      BackHandler.removeEventListener(
        'hardwareBackPress',
        this._handleBackPress,
      );
    }
  }

  _handleBackPress = () => {
    if (this.props.isBackLock) {
      this.props.handleSetSelect();

      return true;
    }
  };

  render() {
    return null;
  }
}

export default connect(
  ({ app }) => ({
    isBackLock: app.backHandler['SummaryBack'],
  }),
  { addBackHandler, delBackHandler },
)(SummaryBack);
