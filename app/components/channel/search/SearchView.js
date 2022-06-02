import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, StyleSheet, Alert } from 'react-native';
import { getTopPadding } from '@/lib/device/common';
import { getChannelMessage } from '@/lib/messageUtil';
import { setUnreadCountForSync } from '@/modules/room';
import SearchHeader from '@C/channel/search/SearchHeader';
import ChannelSearchList from '@C/channel/search/SearchList';
import SearchIndexBox from '@C/chat/chatroom/search/SearchIndexBox';
import { getDic } from '@/config';
import * as messageApi from '@/lib/api/message';
import { setSearchKeyword } from '@/modules/channel';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';

const SearchView = ({ onSearchBox, navigation }) => {
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  console.log('SearchView : ', chineseWall);
  const { roomID, currentChannel } = useSelector(({ channel }) => ({
    roomID: channel.currentChannel.roomId,
    currentChannel: channel.currentChannel,
  }));

  const [searchText, setSearchText] = useState('');
  const [moveData, setMoveData] = useState(null);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeywordText, setSearchKeywordText] = useState('');

  const dispatch = useDispatch();

  const handleSearchBox = useCallback(() => {
    setMoveData(null);
    setSearchResult([]);
    setSearchText('');

    dispatch(
      setSearchKeyword({
        keyword: null,
      }),
    );

    onSearchBox(false);
  }, [onSearchBox]);

  useEffect(() => {
    if (currentChannel && currentChannel.searchKeyword) {
      onSearchBox(true);
      setSearchText(currentChannel.searchKeyword);
      setSearchKeywordText(currentChannel.searchKeyword);
      handleSearch(currentChannel.searchKeyword);
    }
  }, [currentChannel]);

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
    searchText => {
      setLoading(true);
      setSearchText(searchText);
      setSearchResult([]);
      setMoveData({ firstPage: [], moveId: -1 });

      // 검색된 messageId 및 첫 페이지 데이터
      const param = {
        roomId: roomID,
        search: searchText,
        loadCnt: 100,
      };
      try {
        messageApi
          .searchChannelMessage(param)
          .then(({ data }) => {
            if (data.search == null || data.search.length == 0) {
              setMoveMessagesData(data);
              setSearchText('');
              Alert.alert(null, getDic('Msg_noSearchResult'), [
                {
                  text: getDic('Ok'),
                },
              ]);
            } else {
              setMoveMessagesData(data);
            }
          })
          .catch(e => {
            console.log(e);
            // 초기화
            setSearchKeywordText('');
            setSearchText('');
          });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [roomID, searchText, chineseWall],
  );

  const handleIndex = useCallback(
    index => {
      setLoading(true);
      setMoveData({
        firstPage: [],
        moveId: -1,
      });
      const getCenterMessage = async () => {
        try {
          const response = await getChannelMessage(
            roomID,
            searchResult[index],
            'CENTER',
            param => {
              dispatch(setUnreadCountForSync(param));
            },
            false,
            50,
          );

          if (response.data.status == 'SUCCESS') {
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
    [roomID, searchResult, dispatch],
  );

  return (
    <>
      <View style={styles.statusBar} />
      <View style={styles.contanier}>
        <SearchHeader
          value={searchKeywordText}
          onSearchBox={handleSearchBox}
          onSearch={handleSearch}
          disabled={loading}
        />

        <ChannelSearchList
          moveData={moveData}
          markingText={searchText}
          roomID={roomID}
          navigation={navigation}
          chineseWall={chineseWall}
        />

        <SearchIndexBox length={searchResult.length} onChange={handleIndex} />
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
