import { Component } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { setNetworkState } from '@/modules/app';
import { getDic } from '@/config';

class NetInfoHandler extends Component {
  state = {
    netInfo: null,
  };

  componentDidMount() {
    /*NetInfo.configure({
      reachabilityUrl: Config.ServerURL.MANAGE + '/na/m/v/k',
      reachabilityTest: async response => () => response.status === 200,
      reachabilityRequestTimeout: 3 * 1000,
    });*/

    this.state.netInfo = NetInfo.addEventListener(this._handleNetInfoChange);
  }

  componentWillUnmount() {
    if (this.state.netInfo && this.state.netInfo.unsubscribe)
      this.state.netInfo.unsubscribe();
  }

  _handleNetInfoChange = state => {
    if (this.props.networkState && !state.isConnected) {
      Alert.alert(
        null,
        getDic('Msg_NetworkUnstable'),
        [{ text: getDic('Ok') }],
        { cancelable: true },
      );
    }

    this.props.setNetworkState(state.isConnected);
  };

  render() {
    return null;
  }
}

export default connect(
  ({ app }) => ({
    networkState: app.networkState,
  }),
  {
    setNetworkState,
  },
)(NetInfoHandler);
