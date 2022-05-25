import React, {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { rematchingMember } from '@/modules/room';
import {
  getChannelInfo,
  getChannelNotice,
  readMessage,
  closeChannel
} from '@/modules/channel';
import { clearFiles, sendChannelMessage } from '@/modules/message';
import LoadingWrap from '@COMMON/LoadingWrap';
import ChannelMessageView from '@C/channel/channelroom/ChannelMessageView';
import * as fileUtil from '@/lib/fileUtil';
import SearchView from '@C/channel/search/SearchView';
import { Text } from 'react-native';

const ChannelRoom = ({ navigation, route }) => {
  let roomID;
  if (route.params && route.params.roomID) {
    roomID = Number(route.params.roomID);
  } else {
    roomID = null;
  }
  const channel = useSelector(state => state?.channel?.currentChannel);
  const loading = useSelector(
    state => state?.loading?.['channel/GET_CHANNEL_INFO'],
  );
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    const fileCtrl = fileUtil.getInstance();
    fileCtrl.clear();
    dispatch(clearFiles());

    if (channel?.roomId) {
      // 채널 공지 조회
      dispatch(
        getChannelNotice({
          roomId: channel.roomId,
          method: 'TOP',
        }),
      );
    }
    return () => {
      dispatch(closeChannel());
    };
  }, []);

  useEffect(() => {
    if (channel && channel.searchKeyword) {
      setSearchKeyword(channel.searchKeyword);
      setSearchVisible(true);
    }
  }, [channel]);

  useLayoutEffect(() => {
    if (channel) {
      dispatch(readMessage({ roomID: channel.roomId }));
    }
  }, [dispatch, channel]);

  useEffect(() => {
    handleSearchBox(true);
  }, [searchKeyword]);

  useEffect(() => {
    if (roomID != null && roomID > 0) {
      dispatch(getChannelInfo({ roomId: roomID }));
      setSearchVisible(false);
    }
  }, [roomID]);

  // useEffect(() => {
  //   // presence - channel members
  //   // 채널 멤버들의 프레젠스를 모두 확인해야하는가?
  //   // if (channel && channel.roomType != 'A' && channel.members)
  //   //     dispatch(
  //   //         addTargetUserList(
  //   //             channel.members.map(item => ({ userId: item.id, state: item.presence })),
  //   //         ),
  //   //     );
  //   // return () => {
  //   //     if (channel && channel.roomType != 'A' && channel.members)
  //   //         dispatch(delTargetUserList(channel.members.map(item => item.presence)));
  //   // };
  // }, [channel]);

  const handleMessage = (message, filesObj, linkObj, mentionArr) => {
    const data = {
      roomID: roomID,
      context: message,
      roomType: channel.roomType,
      sendFileInfo: filesObj,
      linkInfo: linkObj,
      mentionInfo: mentionArr,
    };

    // sendMessage 하기 전에 RoomType이 M인데 참가자가 자기자신밖에 없는경우 상대를 먼저 초대함.
    if (channel.roomType === 'M' && channel.realMemberCnt === 1) {
      dispatch(rematchingMember(data));
    } else {
      // rematchingMember 내에서 서버 호출 후 sendMessage 호출하도록 변경
      dispatch(sendChannelMessage(data));
    }
  };
  const handleSearchBox = visible => {
    setSearchVisible(visible);
  };

  const handleReadMessage = useCallback(
    (_roomID, isNotice) => {
      dispatch(readMessage({ roomID: _roomID, isNotice }));
    },
    [dispatch],
  );

  if (loading) {
    return <LoadingWrap />;
  }
  if (!roomID) {
    return <Text>잘못된 접근입니다.</Text>;
  }
  return (
    <>
      {roomID && (
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
              {channel && (
                <ChannelMessageView
                  roomInfo={channel}
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
    </>
  );
};

export default ChannelRoom;
