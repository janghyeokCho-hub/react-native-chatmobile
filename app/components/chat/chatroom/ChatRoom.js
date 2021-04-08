import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getRoomInfo,
  rematchingMember,
  readMessage,
  closeRoom,
} from '@/modules/room';
import { addTargetUserList, delTargetUserList } from '@/modules/presence';
import { sendMessage, clearFiles } from '@/modules/message';
import LoadingWrap from '@COMMON/LoadingWrap';
import MessageView from '@C/chat/chatroom/normal/MessageView';
import SearchView from '@C/chat/chatroom/search/SearchView';
import * as fileUtil from '@/lib/fileUtil';
import { Text } from 'react-native';

const ChatRoom = ({ navigation, route }) => {
  let roomID;
  if (route.params && route.params.roomID)
    roomID = parseInt(route.params.roomID);
  else roomID = null;

  const { room, moveVisible, loading } = useSelector(
    ({ room, loading, message }) => ({
      room: room.currentRoom,
      moveVisible: message.moveVisible,
      loading: loading['room/GET_ROOM_INFO'],
    }),
  );

  const [searchVisible, setSearchVisible] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const fileCtrl = fileUtil.getInstance();
    fileCtrl.clear();
    dispatch(clearFiles());

    return () => {
      dispatch(closeRoom());
    };
  }, []);

  useEffect(() => {
    // init
    dispatch(getRoomInfo({ roomID }));
    setSearchVisible(false);

    // file control 초기화
    /*const fileCtrl = coviFile.getInstance();
    fileCtrl.clear();
    dispatch(clearFiles());
    setViewFileUpload(false);*/
  }, [roomID]);

  useEffect(() => {
    // presence - room members
    if (room && room.roomType != 'A' && room.members)
      dispatch(
        addTargetUserList(
          room.members.map(item => ({ userId: item.id, state: item.presence })),
        ),
      );
    return () => {
      if (room && room.roomType != 'A' && room.members)
        dispatch(delTargetUserList(room.members.map(item => item.presence)));
    };
  }, [room]);

  const handleMessage = (message, filesObj, linkObj) => {
    const data = {
      roomID: roomID,
      context: message,
      roomType: room.roomType,
      sendFileInfo: filesObj,
      linkInfo: linkObj,
    };

    // sendMessage 하기 전에 RoomType이 M인데 참가자가 자기자신밖에 없는경우 상대를 먼저 초대함.
    if (room.roomType === 'M' && room.realMemberCnt === 1) {
      dispatch(rematchingMember(data));
    } else {
      // rematchingMember 내에서 서버 호출 후 sendMessage 호출하도록 변경
      dispatch(sendMessage(data));
    }
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
      {/*!loading && roomID && (
        <>
          <FileDownloadLayer />
          {(moveVisible && (
            <>
              <MoveView />
            </>
          )) ||
            (searchVisible && (
              <>
                <SearchView onSearchBox={handleSearchBox} />
              </>
            )) || (
              <>
                {room &&
                  ((room.roomType == 'A' && (
                    <NoticeView roomInfo={room} onRead={handleReadMessage} />
                  )) || (
                    <MessageView
                      roomInfo={room}
                      onSearchBox={handleSearchBox}
                      handleUploadBox={handleUploadBox}
                      postAction={handleMessage}
                      onRead={handleReadMessage}
                      view={viewFileUpload}
                    />
                  ))}
              </>
            )}
        </>
      )*/}
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
                />
              )}
            </>
          )}
        </>
      )}
      {!loading && !roomID && <Text>잘못된 접근입니다.</Text>}
    </>
  );
};

export default ChatRoom;
