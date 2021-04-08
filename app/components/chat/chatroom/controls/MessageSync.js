import { Component } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { connect } from 'react-redux';
import { AppState } from 'react-native';
import { setMessagesForSync, readMessage } from '@/modules/room';

class MessageSync extends Component {
  state = {
    appState: '',
    beforeConnect: true,
    netInfo: null,
  };

  componentDidMount() {
    AppState.addEventListener('change', this._getSyncData);

    this.state.netInfo = NetInfo.addEventListener(this._handleNetInfoChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._getSyncData);

    if (this.state.netInfo && this.state.netInfo.unsubscribe)
      this.state.netInfo.unsubscribe();
  }

  _getSyncData = currState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      currState == 'active' &&
      this.props.roomID
    ) {
      this.props.syncMessages();
    }

    this.state.appState = currState;
  };

  _handleNetInfoChange = state => {
    if (!this.state.beforeConnect && state.isConnected && this.props.roomID) {
      this.props.syncMessages();
    }

    this.state.beforeConnect = state.isConnected;
  };

  render() {
    return null;
  }
}

export default connect(
  ({ app }) => ({
    networkState: app.networkState,
  }),
  { setMessagesForSync, readMessage },
)(MessageSync);
