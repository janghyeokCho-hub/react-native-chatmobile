import React, { Component } from 'react';

import ContactIcon from '@COMMON/icons/ContactIcon';
import ChatIcon from '@COMMON/icons/ChatIcon';
import OrgChartIcon from '@COMMON/icons/OrgChartIcon';
import ChannelIcon from '@COMMON/icons/ChannelIcon';
import UserSettingIcon from '@COMMON/icons/UserSettingIcon';
import NoteIcon from '@/components/common/icons/note/NoteIcon';
import AddChannelIcon from '@COMMON/icons/AddChannelIcon';
import AddContactIcon from '@COMMON/icons/AddContactIcon';
import TrashIcon from '@COMMON/icons/TrashIcon';
import SendIcon from '@/components/common/icons/SendIcon';
import ReplyIcon from '@/components/common/icons/ReplyIcon';
import ForwardIcon from '@/components/common/icons/ForwardIcon';
import ShowMoreIcon from '@/components/common/icons/ShowMoreIcon';
import DotIcon from '@/components/common/icons/DotIcon';
import FileIcon from '@/components/common/icons/FileIcon';

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
      case 'Note':
        return <NoteIcon focus={this.props.focus} />;
      case 'Add':
        return <AddChannelIcon {...this.props} />;
      case 'AddContact':
        return <AddContactIcon {...this.props} />;
      case 'Send':
        return <SendIcon {...this.props} />;
      case 'Reply':
        return <ReplyIcon {...this.props} />;
      case 'ReplyAll':
        return <ReplyIcon {...this.props} replyAll={true} />;
      case 'Forward':
        return <ForwardIcon {...this.props} />;
      case 'Trash':
        return <TrashIcon {...this.props} />;
      case 'Menu':
        return <ShowMoreIcon {...this.props} />;
      case 'MenuDot':
        return <DotIcon {...this.props} />;
      case 'File':
        return <FileIcon {...this.props} />;
      default:
        return <ContactIcon focus={this.props.focus} />;
    }
  }
}

export default Icon;
