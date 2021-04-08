import React, { Component } from 'react';
import { getChannelSyncMessage } from '@/lib/messageUtil';
import { connect } from 'react-redux';
import { AppState } from 'react-native';
import { setMessagesForSync, readMessage } from '@/modules/channel';

class ChannelMessageSync extends Component {
  componentDidMount() {
    AppState.addEventListener('change', this._getChannelSyncData);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._getChannelSyncData);
  }

  _getChannelSyncData = currState => {
    if (currState == 'active' && this.props.messageID) {
      getChannelSyncMessage(this.props.roomID, this.props.messageID).then(
        response => {
          if (response.data.status == 'SUCCESS') {
            const data = response.data.result;
            if (data.length > 0) {
              this.props.setMessagesForSync(data);
              this.props.readMessage({
                roomID: this.props.roomID,
                isNotice: false,
              });
            }
          }
        },
      );
    }
  };

  render() {
    return <></>;
  }
}

export default connect(null, { setMessagesForSync, readMessage })(
  ChannelMessageSync,
);
