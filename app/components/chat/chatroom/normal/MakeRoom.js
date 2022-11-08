import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ChatRoomHeader from '@C/chat/chatroom/normal/ChatRoomHeader';
import MessagePostBox from '@C/chat/chatroom/normal/MessagePostBox';
import { openRoom } from '@/modules/room';
import { createRoom } from '@API/room';
import { clearFiles } from '@/modules/message';
import * as fileUtil from '@/lib/fileUtil';
import { sendMessage, uploadFile, getURLThumbnail } from '@API/message';
import { Alert, View, StyleSheet, ScrollView, Keyboard } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { moveToRoom } from '@/lib/roomUtil';
import ChatMenuBox from '../layer/ChatMenuBox';
import Drawer from 'react-native-drawer';
import { getTopPadding } from '@/lib/device/common';
import { getDic } from '@/config';

const MakeRoom = ({ route, navigation }) => {
  const blockUser = useSelector(({ login }) => login.blockList);
  const { makeInfo, sender } = useSelector(({ room, login }) => ({
    makeInfo: room.makeInfo,
    sender: login.id,
  }));

  const [extensionType, setExtensionType] = useState('');
  const [disabeld, setDisabled] = useState(false);
  const _drawer = useRef(null);

  const dispatch = useDispatch();

  const handleExtension = extension => {
    setExtensionType(extension);
  };

  const openSideMenu = () => {
    openChatMenuBox();
  };

  const openChatMenuBox = () => {
    Keyboard.dismiss();
    _drawer.current.open();
  };

  const closeChatMenuBox = () => {
    _drawer.current.close();
  };

  useEffect(() => {
    const { makeData } = route.params;

    if (makeData) {
      dispatch(openRoom(makeData));
    } else {
      Alert.alert(
        null,
        getDic('Msg_ChatRoomCreateErr'),
        [
          {
            text: getDic('Ok'),
            onPress: () => {
              navigation.dispatch(CommonActions.goBack());
            },
          },
        ],
        { cancelable: true },
      );
    }

    // file control 초기화
    const fileCtrl = fileUtil.getInstance();
    fileCtrl.clear();
    dispatch(clearFiles());
  }, []);

  const handleNewRoom = roomID => {
    dispatch(openRoom({ roomID: roomID }));
    moveToRoom(navigation, 'ChatRoom', { roomID: roomID });
  };

  // TODO: 메시지 전송 실패 여부 처리
  const handleMessage = async ({ message, filesObj, linkObj, messageType }) => {
    // 방생성 api 호출
    // 호출 결과에 따라 ChatRoom으로 화면 전환
    // -- MultiView의 경우 dispatch
    // -- NewWindow의 경우 route 이동
    setDisabled(true);

    let invites = [];
    makeInfo.members.forEach(item => invites.push(item.id));

    let blockList = [];
    if (invites?.length && blockUser) {
      blockList = blockUser.filter(
        item => item !== sender && invites.includes(item),
      );
    }

    if (invites.indexOf(sender) === -1) {
      invites.push(sender);
    }

    const data = {
      roomType: makeInfo.roomType,
      name: '',
      members: invites,
      memberType: makeInfo.memberType,
      message: message?.message,
      sendFileInfo: filesObj,
      linkInfo: linkObj,
      messageType: messageType ? messageType : 'N',
      blockList: blockList,
    };

    if (filesObj) {
      uploadFile(data)
        .then(({ data: response }) => {
          if (response.state === 'SUCCESS') {
            const messageParams = {
              context: message,
              roomID: response.roomID,
              sender: sender,
              roomType: makeInfo.roomType,
              fileInfos: JSON.stringify(response.result),
              blockList: blockList,
            };

            sendMessage(messageParams)
              .then(({ data: sendMessageResponse }) => {
                const { status, result } = sendMessageResponse;
                if (status === 'SUCCESS') {
                  if (linkObj) {
                    getURLThumbnail({
                      roomId: result.roomID,
                      messageId: result?.messageID,
                      url: linkObj.url,
                    });
                  }

                  handleNewRoom(result.roomID);
                }
              })
              .catch(error => console.log(error));
          }
        })
        .catch(error => console.log(error));
    } else {
      createRoom(data).then(({ data: response }) => {
        if (response.status === 'SUCCESS') {
          const roomID = response.result.room?.roomID;
          const messageID = response?.result?.messageID;
          if (linkObj) {
            getURLThumbnail({
              roomId: roomID,
              messageId: messageID,
              url: linkObj.url,
            });
          }

          const messageParams = {
            context: message,
            roomID: roomID,
            sender: sender,
            roomType: makeInfo.roomType,
            fileInfos: null,
            blockList: blockList,
          };

          sendMessage(messageParams)
            .then(({ data: sendMessageResponse }) => {
              const { status } = sendMessageResponse;
              if (status === 'SUCCESS') {
                if (linkObj) {
                  getURLThumbnail({
                    roomId: roomID,
                    messageId: messageID,
                    url: linkObj.url,
                  });
                }

                handleNewRoom(roomID);
              }
            })
            .catch(error => console.log(error));
        }
      });
    }
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
            roomInfo={makeInfo}
            isMakeRoom={true}
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
            roomInfo={makeInfo}
            isMakeRoom={true}
            openSideMenu={openSideMenu}
            navigation={navigation}
          />
          <ScrollView style={{ flex: 1 }} />
          <MessagePostBox
            postAction={handleMessage}
            disabeld={disabeld}
            onExtension={handleExtension}
            extension={extensionType}
            navigation={navigation}
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

export default MakeRoom;
