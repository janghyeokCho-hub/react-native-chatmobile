import React, { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as socketConnector from '@/lib/socket/socketConnect';
import * as socketActions from '@/lib/socket/socketActions';
import AppStateHandler from '@C/AppStateHandler';
import { useNoteList } from '@/lib/note/state';
import { navigationRef } from '@/components/RootNavigation';

const SocketContainer = () => {
  const token = useSelector(({ login }) => login.token);
  const userInfo = useSelector(({ login }) => login.userInfo);
  const accessid = useSelector(({ login }) => login.id);
  const fixedUsers = useSelector(({ presence }) => presence.fixedUsers);
  const { mutate: setNoteList } = useNoteList({ viewTyoe: 'receive' });
  const dispatch = useDispatch();

  const socketActionsObj = useMemo(() => {
    return {
      onNewMessage: socketActions.handleNewMessage(dispatch, userInfo),
      onNewNoteMessage: socketActions.handleNewNoteMessage(
        setNoteList,
        navigationRef,
      ),
      onChatRoomInvitation: socketActions.handleChatRoomInvite(dispatch),
      onChatRoomExit: socketActions.handleChatRoomExit(dispatch, userInfo),
      onReadCountChanged: socketActions.handleReadCountChanged(
        dispatch,
        userInfo,
      ),
      onReadChannel: socketActions.handleReadChannel(dispatch),
      onPresenceChanged: socketActions.handlePresenceChanged(dispatch),
      // onNewLinkThumbnail: socketActions.handleNewLinkThumbnail(dispatch),
      onForceToLogout: socketActions.handleForceToLogout(dispatch),
      onNewNotice: socketActions.handleNewNotice(dispatch),
      onNewChannelMessage: socketActions.handleNewChannelMessage(
        dispatch,
        userInfo,
      ),
      onChannelInvitation: socketActions.handleChannelInvite(dispatch),
      onChannelExit: socketActions.handleChannelExit(dispatch, userInfo),
      onChannelReadCountChanged: socketActions.handleChannelReadCountChanged(
        dispatch,
      ),
      onDelChannelMessage: socketActions.handleDelChannelMessage(dispatch),
      onDelChannelNotice: socketActions.handleDelChannelNotice(dispatch),
      onNewChannelNotice: socketActions.handleNewChannelNotice(
        dispatch,
        userInfo,
      ),
      onChannelClosure: socketActions.handleChannelClosure(dispatch),
      onAuthChanged: socketActions.handleAuthChanged(dispatch),
      onDelMessage: socketActions.handleDelChatroomMessage(dispatch),
    };
  }, [userInfo, dispatch, setNoteList]);

  useEffect(() => {
    if (token) {
      socketConnector.getSocketInstance(
        { token, accessid },
        socketActionsObj,
        socketActions.handleConnect(dispatch), // connect callback
        socketActions.handleDisconnect(dispatch), // disconnect callback
        socketActions.handleReconnect(dispatch, Object.keys(fixedUsers)), // reconnect callback
      );
    }
  }, [token, accessid]);

  const getConnectObj = useCallback(() => {
    return {
      auth: { token, accessid }, 
      socketActionsObj,
      handleConnect: socketActions.handleConnect(dispatch),
      handleDisconnect: socketActions.handleDisconnect(dispatch),
      handleReconnect: socketActions.handleReconnect(
        dispatch,
        Object.keys(fixedUsers),
      ),
    };
  }, [token, accessid, socketActionsObj, dispatch]);

  return (
    <>
      <AppStateHandler connObj={getConnectObj()} />
    </>
  );
};

export default SocketContainer;
