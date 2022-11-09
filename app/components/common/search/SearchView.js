import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, StyleSheet, Alert } from 'react-native';
import useSWR from 'swr';

import { getTopPadding } from '@/lib/device/common';
import { setUnreadCountForSync } from '@/modules/room';
import SearchHeader from '@C/common/search/SearchHeader';
import SearchIndexBox from '@C/chat/chatroom/search/SearchIndexBox';
import { getDic } from '@/config';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';

// room
import { getMessage } from '@/lib/messageUtil';
import { setSearchKeywordRoom } from '@/modules/room';
import { reqGetSearchMessages } from '@/lib/appData/action';
import RoomSearchList from '@C/chat/chatroom/search/SearchList';

// channel
import { getChannelMessage } from '@/lib/messageUtil';
import { setSearchKeyword } from '@/modules/channel';
import { searchChannelMessage } from '@/lib/api/message';
import ChannelSearchList from '@C/channel/search/SearchList';

async function requestSearchMessage(isChannel, searchOption, param) {
  if (isChannel) {
    const { data } = await searchChannelMessage(param, { searchOption });
    return data;
  }
  return reqGetSearchMessages(param, { searchOption });
}

const SearchView = ({ onSearchBox, navigation }) => {
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const currentRoom = useSelector(
    ({ room, channel }) => channel?.currentChannel || room?.currentRoom,
  );
  const currentLastMessage = useSelector(({ room, channel }) => {
    if (room?.currentRoom) {
      return room.messages[room.messages.length - 1];
    }
    return channel.messages[channel.messages.length - 1];
  });
  const { isChannel, roomId, SearchList } = useMemo(() => {
    const _isChannel = Boolean(currentRoom?.roomId);
    const _roomId = _isChannel ? currentRoom?.roomId : currentRoom?.roomID;
    const _SearchList = _isChannel ? ChannelSearchList : RoomSearchList;
    return {
      isChannel: _isChannel,
      roomId: _roomId,
      SearchList: _SearchList,
    };
  }, [currentRoom]);
  const [searchText, setSearchText] = useState('');
  const [moveData, setMoveData] = useState(null);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeywordText, setSearchKeywordText] = useState('');
  const dispatch = useDispatch();
  const { data: searchOptionState, mutate: setSearchOptionState } = useSWR(
    'message/search',
    null,
  );

  const handleSearchBox = useCallback(() => {
    setMoveData(null);
    setSearchResult([]);
    setSearchText('');
    setSearchOptionState(null);

    if (isChannel) {
      dispatch(
        setSearchKeyword({
          keyword: null,
        }),
      );
    } else {
      dispatch(
        setSearchKeywordRoom({
          keyword: null,
        }),
      );
    }

    onSearchBox(false);
  }, [onSearchBox]);

  useEffect(() => {
    if (currentRoom?.searchKeyword) {
      onSearchBox(true);
      setSearchText(currentRoom.searchKeyword);
      setSearchKeywordText(currentRoom.searchKeyword);
      handleSearch('Context', currentRoom.searchKeyword);
    }
    return () => {
      setSearchOptionState(null, false);
    };
  }, [currentRoom]);

  const setMoveMessagesData = useCallback(
    data => {
      if (data.status === 'SUCCESS') {
        // 차이니즈월 적용
        let { firstPage, search } = data;
        if (chineseWall?.length) {
          const blockList = firstPage?.map(item => {
            const senderInfo = isJSONStr(item.senderInfo)
              ? JSON.parse(item.senderInfo)
              : item.senderInfo;
            const targetInfo = {
              ...senderInfo,
              id: item.sender,
            };

            const { blockChat } = isBlockCheck({
              targetInfo,
              chineseWall,
            });
            return blockChat && item.messageID;
          });
          search = search.filter(item => !blockList.includes(item));
        }
        if (search?.length && firstPage?.length) {
          setMoveData({
            firstPage: firstPage,
            moveId: search[0],
          });
          setSearchResult(search);
        } else {
          Alert.alert(getDic('Eumtalk'), getDic('Msg_noSearchResult'), {
            cancelable: true,
          });
          setMoveData(null);
        }
      } else {
        setSearchText('');
      }
      setLoading(false);
    },
    [chineseWall],
  );

  const handleSearch = useCallback(
    async (searchOption, text) => {
      setLoading(true);
      setSearchText(text);
      setSearchResult([]);
      setMoveData({ firstPage: [], moveId: -1 });
      setSearchOptionState({
        type: searchOption,
        roomId,
        value: text,
      });
      try {
        const data = await requestSearchMessage(isChannel, searchOption, {
          roomId,
          roomID: roomId,
          search: text,
          loadCnt: 100,
          messageId: currentLastMessage?.messageID,
        });
        if (Array.isArray(data?.search)) {
          // Handle valid response
          setMoveMessagesData(data);
        } else {
          // Handle invalid response
          setMoveMessagesData(data);
          setSearchText('');
          Alert.alert(null, getDic('Msg_noSearchResult'), [
            {
              text: getDic('Ok'),
            },
          ]);
        }
      } catch (error) {
        console.log(error);
        setSearchKeywordText('');
        setSearchText('');
      } finally {
        setLoading(false);
      }
    },
    [
      isChannel,
      roomId,
      setMoveMessagesData,
      setSearchOptionState,
      currentLastMessage,
    ],
  );

  const handleRequestNext = useCallback(
    async length => {
      const lastSearchMessageId = searchResult?.[searchResult?.length - 1];
      if (!Number(lastSearchMessageId)) {
        return;
      }
      const param = {
        roomID: searchOptionState?.roomId,
        roomId: searchOptionState?.roomId,
        search: searchOptionState?.value,
        searchOption: searchOptionState?.type,
        loadCnt: 100,
        messageId: Math.max(0, lastSearchMessageId - 1), // for sender search
      };
      try {
        const response = await requestSearchMessage(
          isChannel,
          searchOptionState?.type,
          param,
        );
        if (response?.status === 'SUCCESS' || response?.search?.length) {
          setSearchResult(state => [...new Set(state.concat(response.search))]);
        } else {
          throw new Error('Searh result is empty');
        }
      } catch (err) {
        // handle error
        Alert.alert(null, getDic('Msg_noSearchResult'), [
          {
            text: getDic('Ok'),
          },
        ]);
      }
    },
    [searchResult, searchOptionState, isChannel],
  );

  const handleIndex = useCallback(
    index => {
      setLoading(true);
      setMoveData({
        firstPage: [],
        moveId: -1,
      });
      const fetchMessage = isChannel ? getChannelMessage : getMessage;
      const getCenterMessage = async () => {
        try {
          const response = await fetchMessage(
            roomId,
            searchResult[index],
            'CENTER',
            param => {
              dispatch(setUnreadCountForSync(param));
            },
            false,
            50,
          );

          if (response.data.status === 'SUCCESS') {
            const data = response.data.result;

            // reverse
            /*
              const findId = data.reverse().findIndex(
                item => item.messageID === searchResult[index],
              );
              */

            const findId = searchResult[index];

            setMoveData({
              firstPage: data,
              moveId: findId,
            });
          } else {
            setSearchText('');
          }

          setLoading(false);
        } catch (e) {
          // 초기화
          setSearchText('');
          setLoading(false);
          setMoveData(null);
          console.log(e);
        }
      };
      getCenterMessage();
    },
    [isChannel, roomId, searchResult, dispatch],
  );

  return (
    <>
      <View style={styles.statusBar} />
      <View style={styles.contanier}>
        <SearchHeader
          value={searchKeywordText}
          onSearchBox={handleSearchBox}
          onSearch={handleSearch}
          initialSearchData={currentRoom?.members}
          disabled={loading}
        />

        <SearchList
          moveData={moveData}
          markingText={searchText}
          roomID={roomId}
          navigation={navigation}
          chineseWall={chineseWall}
          roomInfo={currentRoom}
        />

        <SearchIndexBox
          length={searchResult.length}
          onChange={handleIndex}
          handleNext={handleRequestNext}
        />
      </View>
    </>
  );
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

export default SearchView;
