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

const SearchView = ({ onSearchBox, navigation }) => {
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

  const setMoveMessagesData = useCallback(data => {
    if (data.status == 'SUCCESS') {
      if (data.search.length > 0 && data.firstPage.length > 0) {
        // reverse
        /*
        const findId = data.firstPage.reverse().findIndex(
          item => item.messageID === data.search[0],
        );
          */

        const findId = data.search[0];
        setMoveData({
          firstPage: data.firstPage,
          moveId: findId,
        });
        setSearchResult(data.search);
      }
    } else {
      setSearchText('');
    }
    setLoading(false);
  }, []);

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
    [roomID, searchText],
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
