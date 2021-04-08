import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, StyleSheet, Alert } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { getTopPadding } from '@/lib/device/common';
import { getMessage } from '@/lib/messageUtil';
import { setUnreadCountForSync } from '@/modules/room';
import SearchHeader from '@C/chat/chatroom/search/SearchHeader';
import SearchList from '@C/chat/chatroom/search/SearchList';
import SearchIndexBox from '@C/chat/chatroom/search/SearchIndexBox';
import * as dbAction from '@/lib/appData/action';
import { setSearchKeywordRoom } from '@/modules/room';

const SearchView = ({ onSearchBox, navigation }) => {
  const roomID = useSelector(({ room }) => room.currentRoom.roomID);
  const currentRoom = useSelector(({ room }) => room.currentRoom);

  const [searchText, setSearchText] = useState('');
  const [moveData, setMoveData] = useState(null);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleSearchBox = useCallback(() => {
    setMoveData(null);
    setSearchResult([]);
    setSearchText('');

    dispatch(
      setSearchKeywordRoom({
        keyword: null,
      }),
    );

    onSearchBox(false);
  }, [onSearchBox]);

  useEffect(() => {
    if (currentRoom != null && currentRoom.searchKeyword != null) {
      handleSearch(currentRoom.searchKeyword);
    }
  }, [currentRoom]);

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
        roomID,
        search: searchText,
        loadCnt: 50,
      };

      try {
        dbAction
          .reqGetSearchMessages(param)
          .then(result => {
            setMoveMessagesData(result);
            if (result.search == null || result.search.length == 0) {
              Alert.alert(getDic('Eumtalk'), getDic('Msg_noSearchResult'), {
                cancelable: true,
              });
              setMoveData(null);
            }
          })
          .catch(() => {
            setMoveData(null);
          });
      } catch (e) {
        console.log(e);
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
          const response = await getMessage(
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
          value={searchText}
          onSearchBox={handleSearchBox}
          onSearch={handleSearch}
          disabled={loading}
        />

        <SearchList
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
