import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import ChatRoomHeader from '@C/chat/chatroom/normal/ChatRoomHeader';
import MessagePostBox from '@C/chat/chatroom/normal/MessagePostBox';
import ChannelMessageList from '@C/channel/channelroom/ChannelMessageList';
import { View, Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import Drawer from 'react-native-drawer';
import ChannelMenuBox from '@C/channel/channelroom/controls/ChannelMenuBox';
import { getTopPadding } from '@/lib/device/common';
import { useDispatch, useSelector } from 'react-redux';
import { addBackHandler, delBackHandler } from '@/modules/app';
import ChannelNoticeView from '../layer/ChannelNoticeView';
import ChannelNoticeIcon from '@/components/common/icons/ChannelNoticeIcon';
import { removeChannelNotice } from '@/modules/channel';
import { getDic } from '@/config';

const ChannelMessageView = ({
  roomInfo,
  onSearchBox,
  onRead,
  postAction,
  navigation,
}) => {
  const isBackLock = useSelector(({ app }) => app.backHandler.ChatMenuBox);
  const userInfo = useSelector(({ login }) => login.userInfo);
  const [extensionType, setExtensionType] = useState('');
  const [flip, setFlip] = useState(false);
  const [noticeFlip, setNoticeFlip] = useState(false);
  const [noticeDisable, setNoticeDisable] = useState(false);

  const listBox = useRef(null);
  const _drawer = useRef(null);

  const dispatch = useDispatch();

  useLayoutEffect(() => {
    AsyncStorage.getItem(':channel_notice_' + roomInfo.roomId).then(data => {
      if (data) {
        const json_data = JSON.parse(data);
        setNoticeFlip(json_data.noticeFlip);
        setNoticeDisable(json_data.noticeDisable);
      }
    });
  }, []);

  const handleExtension = type => {
    setExtensionType(type);
  };

  const openSideMenu = () => {
    openChatMenuBox();
  };

  const openChatMenuBox = useCallback(() => {
    Keyboard.dismiss();
    _drawer.current.open();

    if (isBackLock === undefined) {
      dispatch(addBackHandler({ name: 'ChannelMenuBox' }));
    }
  }, [dispatch, isBackLock]);

  const closeChatMenuBox = useCallback(() => {
    _drawer.current.close();

    dispatch(delBackHandler({ name: 'ChannelMenuBox' }));
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
          <ChannelMenuBox
            title={getDic('ChannelMenu')}
            roomInfo={roomInfo}
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
          {roomInfo.notice && !noticeFlip && !noticeDisable ? (
            <ChannelNoticeView
              noticeInfo={roomInfo.notice}
              open
              flip={flip}
              onPress={() => {
                setFlip(!flip);
              }}
              onFlipHandler={() => {
                setNoticeFlip(true);
                const param = {
                  noticeFlip: true,
                  noticeDisable: noticeDisable,
                };
                AsyncStorage.setItem(
                  ':channel_notice_' + roomInfo.roomId,
                  JSON.stringify(param),
                );
              }}
              onDisableHandler={() => {
                setNoticeDisable(true);
                const param = {
                  noticeFlip: noticeFlip,
                  noticeDisable: true,
                };
                AsyncStorage.setItem(
                  ':channel_notice_' + roomInfo.roomId,
                  JSON.stringify(param),
                );
              }}
              onNoticeRemoveHandler={() => {
                if (roomInfo.notice && userInfo) {
                  dispatch(
                    removeChannelNotice({
                      messageId: roomInfo.notice.messageID,
                      memberInfo: userInfo.id,
                      roomId: roomInfo.notice.roomID.toString(),
                    }),
                  );
                }
              }}
            />
          ) : (
            <></>
          )}
          <ChannelMessageList
            onExtension={handleExtension}
            ref={listBox}
            navigation={navigation}
            roomInfo={roomInfo}
          />
          {noticeFlip && !noticeDisable && (
            <View
              style={{
                position: 'absolute',
                right: 0,
                top: getTopPadding() + 25,
                backgroundColor: 'transparent',
              }}
            >
              <TouchableOpacity
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 35,
                  borderWidth: 0.8,
                  marginLeft: 'auto',
                  marginTop: 15,
                  marginRight: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderColor: '#e0e0e0',
                }}
                onPress={() => {
                  setNoticeFlip(false);
                  const param = {
                    noticeFlip: false,
                    noticeDisable: noticeDisable,
                  };
                  AsyncStorage.setItem(
                    ':channel_notice_' + roomInfo.roomId,
                    JSON.stringify(param),
                  );
                }}
              >
                <ChannelNoticeIcon color="black" width="24" height="24" />
              </TouchableOpacity>
            </View>
          )}
          <MessagePostBox
            disabled={roomInfo.disabled}
            postAction={postAction}
            scrollToStart={scrollToStart}
            onExtension={handleExtension}
            extension={extensionType}
            navigation={navigation}
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

export default ChannelMessageView;
