import React from 'react';
import { AppState, Platform, View, Image } from 'react-native';
import { getConfig } from '@/config';

const SecurityScreen = () => {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        style={{ width: 200, height: 100 }}
        source={require('@C/assets/eumtalk-logo.png')}
      />
    </View>
  );
};

const showSecurityScreenFromAppState = appState => {
  const useScreenCaptureSecure =
    getConfig('UseScreenCaptureSecure', 'N') === 'Y';
  if (useScreenCaptureSecure) {
    return ['background', 'inactive'].includes(appState);
  } else {
    return false;
  }
};

const withSecurityScreenIOS = Wrapped => {
  return class WithSecurityScreen extends React.Component {
    state = {
      showSecurityScreen: showSecurityScreenFromAppState(AppState.currentState),
    };

    componentDidMount() {
      AppState.addEventListener('change', this.onChangeAppState);
    }

    componentWillUnmount() {
      AppState.removeEventListener('change', this.onChangeAppState);
    }

    onChangeAppState = nextAppState => {
      const showSecurityScreen = showSecurityScreenFromAppState(nextAppState);
      this.setState({ showSecurityScreen });
    };

    render() {
      return this.state.showSecurityScreen ? (
        <SecurityScreen />
      ) : (
        <Wrapped {...this.props} />
      );
    }
  };
};

/**
 * Android 는 Java 소스로 따로 구현해야함
 */
const withSecurityScreenAndroid = Wrapped => Wrapped;

export const withSecurityScreen =
  Platform.OS === 'ios' ? withSecurityScreenIOS : withSecurityScreenAndroid;
