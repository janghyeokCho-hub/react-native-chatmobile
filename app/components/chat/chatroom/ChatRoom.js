import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getRoomInfo,
  rematchingMember,
  readMessage,
  closeRoom,
} from '@/modules/room';
import { addTargetUserList, delTargetUserList } from '@/modules/presence';
import { sendMessage, clearFiles, setPostAction } from '@/modules/message';
import LoadingWrap from '@COMMON/LoadingWrap';
import MessageView from '@C/chat/chatroom/normal/MessageView';
import SearchView from '@C/common/search/SearchView';
import * as fileUtil from '@/lib/fileUtil';
import { Text } from 'react-native';
import { withSecurityScreen } from '@/withSecurityScreen';

const ChatRoom = ({ navigation, route }) => {
  const userId = useSelector(({ login }) => login.id);
  const blockUser = useSelector(({ login }) => login.blockList);
  let roomID;
  if (route.params && route.params.roomID) {
    roomID = parseInt(route.params.roomID);
  } else {
    roomID = null;
  }

  const { room, moveVisible, loading } = useSelector(
    ({ room, loading, message }) => ({
      room: room.currentRoom,
      moveVisible: message.moveVisible,
      loading: loading['room/GET_ROOM_INFO'],
    }),
  );

  const [searchVisible, setSearchVisible] = useState(false);
  const [cancelToken, setCancelToken] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const fileCtrl = fileUtil.getInstance();
    fileCtrl.clear();
    dispatch(clearFiles());

    return () => {
      dispatch(closeRoom());
    };
  }, [dispatch]);

  useEffect(() => {
    // init
    dispatch(getRoomInfo({ roomID }));
    setSearchVisible(false);
  }, [dispatch, roomID]);

  useEffect(() => {
    // presence - room members
    if (room && room.roomType != 'A' && room.members) {
      dispatch(
        addTargetUserList(
          room.members.map(item => ({ userId: item.id, state: item.presence })),
        ),
      );
    }
    return () => {
      if (room && room.roomType != 'A' && room.members) {
        dispatch(delTargetUserList(room.members.map(item => item.presence)));
      }
    };
  }, [dispatch, room]);

  const handleMessage = async ({
    message,
    filesObj,
    linkObj,
    messageType,
    reply,
  }) => {
    const members = room?.members?.map(item => item.id !== userId && item.id);
    let blockList = [];
    if (members?.length && blockUser) {
      blockList = blockUser.filter(
        item => item !== userId && members.includes(item),
      );
    }

    const data = {
      roomID: roomID,
      context: message,
      roomType: room.roomType,
      sendFileInfo: filesObj,
      linkInfo: linkObj,
      messageType: messageType ? messageType : 'N',
      blockList: blockList,
      ...reply,
      onSubmitCancelToken: token => {
        setCancelToken(token);
      },
    };

    // sendMessage ?????? ?????? RoomType??? M?????? ???????????? ?????????????????? ???????????? ????????? ?????? ?????????.
    if (room.roomType === 'M' && room.realMemberCnt === 1) {
      dispatch(rematchingMember(data));
    } else {
      // rematchingMember ????????? ?????? ?????? ??? sendMessage ??????????????? ??????
      dispatch(sendMessage(data));
    }
    dispatch(setPostAction(true));
  };

  const handleSearchBox = visible => {
    setSearchVisible(visible);
  };

  useEffect(() => {
    if (room && room.searchKeyword) {
      setSearchVisible(true);
    }
  }, [room]);

  const handleReadMessage = useCallback(
    (roomID, isNotice) => {
      dispatch(readMessage({ roomID, isNotice }));
    },
    [roomID],
  );

  return (
    <>
      {loading && <LoadingWrap />}
      {!loading && roomID && (
        <>
          {(searchVisible && (
            <>
              <SearchView
                onSearchBox={handleSearchBox}
                navigation={navigation}
              />
            </>
          )) || (
            <>
              {room && (
                <MessageView
                  roomInfo={room}
                  onSearchBox={handleSearchBox}
                  postAction={handleMessage}
                  onRead={handleReadMessage}
                  navigation={navigation}
                  cancelToken={cancelToken}
                />
              )}
            </>
          )}
        </>
      )}
      {!loading && !roomID && <Text>????????? ???????????????.</Text>}
    </>
  );
};

export default withSecurityScreen(ChatRoom);
