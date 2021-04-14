import React, { Component } from 'react';
import Root from '@C/Root';
import SocketContainer from '@C/SocketContainer';
import PresenceContainer from '@C/PresenceContainer';
import NetInfoHandler from '@C/NetInfoHandler';
import { Text, TextInput, Alert, View, StyleSheet } from 'react-native';
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';
import { YellowBox } from 'react-native';
import { getDic } from '@/config';
import { restartApp } from '@/lib/device/common';
import Orientation from 'react-native-orientation';
import DeviceInfo from 'react-native-device-info';
import getUpdater from '@/lib/class/Updater';
import getTheme from '@/config/theme';

// OS 폰트 크기 무시
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

console.disableYellowBox = true;

// 개발 시 아래 항목의 Warning 무시
YellowBox.ignoreWarnings([
  'Warning: componentWillReceiveProps',
  'Warning: componentWillMount',
  'Warning: Encountered two children with the same key',
]);

setJSExceptionHandler((e, isFatal) => {
  console.log('setJSExceptionHandler : ', e);
  restartApp();
  /*
  Alert.alert(
    null,
    getDic('Msg_Error') +
      `\nError Code: JS Error - ${isFatal ? 'Fatal:' : ''} ${
        e ? e : 'Empty Message'
      }`,
    [{ text: getDic('Ok') }],
  );*/
}, false);

setNativeExceptionHandler(errorString => {
  console.log('setNativeExceptionHandler : ', errorString);
  restartApp();
  /*
  Alert.alert(
    null,
    getDic('Msg_Error') + `Error Code: Native Error - ${errorString}`,
    [{ text: getDic('Ok') }],
  );*/
});

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      downloadProgress: -1,
      theme: getTheme(),
    };
  }

  componentDidMount() {
    getUpdater().checkUpdate(progress => {
      this.setState({ downloadProgress: progress });
    });

    if (!DeviceInfo.isTablet()) {
      Orientation.lockToPortrait();
    }
  }

  render() {
    return (
      <>
        {this.state.downloadProgress !== -1 &&
          this.state.downloadProgress !== 100 && (
            <View style={styles.topBar}>
              <Text style={{ color: 'white' }}>
                {getDic('InProgress')} {this.state.downloadProgress}%
              </Text>
            </View>
          )}

        <SocketContainer />
        <PresenceContainer />
        <NetInfoHandler />
        <Root stack={this.props.stack} theme={this.state.theme} />
      </>
    );
  }
}

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12cfee',
  },
});

export default App;
