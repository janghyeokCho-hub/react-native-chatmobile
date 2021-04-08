import React, { useEffect, useRef, useState, useCallback } from 'react';
import ChatRoomHeader from '@C/chat/chatroom/normal/ChatRoomHeader';
import MessagePostBox from '@C/chat/chatroom/normal/MessagePostBox';
import MessageList from '@C/chat/chatroom/normal/MessageList';
import { View, StyleSheet, Keyboard } from 'react-native';
import Drawer from 'react-native-drawer';
import ChatMenuBox from '@C/chat/chatroom/layer/ChatMenuBox';
import { getTopPadding } from '@/lib/device/common';
import { useDispatch, useSelector } from 'react-redux';
import { addBackHandler, delBackHandler } from '@/modules/app';
import { getDic } from '@/config';

const MessageView = ({
  roomInfo,
  onSearchBox,
  onRead,
  postAction,
  navigation,
}) => {
  const isBackLock = useSelector(({ app }) => app.backHandler['ChatMenuBox']);

  const [extensionType, setExtensionType] = useState('');
  const listBox = useRef(null);
  const _drawer = useRef(null);

  const dispatch = useDispatch();

  const handleExtension = type => {
    setExtensionType(type);
  };

  const openSideMenu = () => {
    openChatMenuBox();
  };

  const openChatMenuBox = useCallback(() => {
    Keyboard.dismiss();
    _drawer.current.open();
    if (isBackLock == undefined) {
      dispatch(addBackHandler({ name: 'ChatMenuBox' }));
    }
  }, [dispatch, isBackLock]);

  const closeChatMenuBox = useCallback(() => {
    _drawer.current.close();

    dispatch(delBackHandler({ name: 'ChatMenuBox' }));
  }, [dispatch]);

  const scrollToStart = () => {
    listBox.current.scrollToOffset({
      y: 0,
      animated: true,
    });
  };

  return (
    <>
      <View style={styles.statusBar} />
      <Drawer
        ref={_drawer}
        type="overlay"
        content={
          <ChatMenuBox
            title={getDic('ChatRoomMenu')}
            roomInfo={roomInfo}
            isMakeRoom={false}
            handleClose={closeChatMenuBox}
            navigation={navigation}
          />
        }
        tapToClose={true}
        styles={drawerStyles}
        openDrawerOffset={0.2}
        panCloseMask={0.2}
        closedDrawerOffset={-3}
        side="right"
        tweenHandler={ratio => ({
          main: { opacity: (2 - ratio) / 2 },
        })}
        tweenDuration={200}
      >
        <View style={styles.contanier}>
          <ChatRoomHeader
            roomInfo={roomInfo}
            isMakeRoom={false}
            onSearchBox={onSearchBox}
            openSideMenu={openSideMenu}
            navigation={navigation}
          />
          <MessageList
            onExtension={handleExtension}
            navigation={navigation}
            ref={listBox}
          />
          <MessagePostBox
            postAction={postAction}
            scrollToStart={scrollToStart}
            onExtension={handleExtension}
            extension={extensionType}
            navigation={navigation}
            disabled={roomInfo.roomType == 'A'}
            isLock={
              (roomInfo.setting && roomInfo.setting.lockInput === 'Y') || false
            }
          />
        </View>
      </Drawer>
    </>
  );
};

const drawerStyles = {
  main: { paddingRight: 3 },
};

const styles = StyleSheet.create({
  contanier: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  statusBar: {
    height: getTopPadding(),
    width: '100%',
    backgroundColor: '#F6F6F6',
  },
});

export default MessageView;
