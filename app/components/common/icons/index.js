import React, { Component } from 'react';

import ContactIcon from '@COMMON/icons/ContactIcon';
import ChatIcon from '@COMMON/icons/ChatIcon';
import OrgChartIcon from '@COMMON/icons/OrgChartIcon';
import ChannelIcon from '@COMMON/icons/ChannelIcon';
import UserSettingIcon from '@COMMON/icons/UserSettingIcon';

class Icon extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    switch (this.props.name) {
      case 'Contact':
        return <ContactIcon focus={this.props.focus} />;
      case 'Chat':
        return <ChatIcon focus={this.props.focus} />;
      case 'OrgChart':
        return <OrgChartIcon focus={this.props.focus} />;
      case 'Channel':
        return <ChannelIcon focus={this.props.focus} />;
      case 'UserSetting':
        return <UserSettingIcon focus={this.props.focus} />;
      default:
        return ContactIcon;
    }
  }
}

export default Icon;
