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
import { getDic } from '@/config';
import { getChineseWall, isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr } from '@/lib/common';

const SearchView = ({ onSearchBox, navigation }) => {
  const myInfo = useSelector(({ login }) => login.userInfo);
  const { chineseWall } = useSelector(({ login }) => login.chineseWall);
  const roomID = useSelector(({ room }) => room.currentRoom.roomID);
  const currentRoom = useSelector(({ room }) => room.currentRoom);

  const [searchText, setSearchText] = useState('');
  const [moveData, setMoveData] = useState(null);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chineseWallState, setChineseWallState] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const getChineseWallList = async () => {
      const { result, status } = await getChineseWall({
        userId: myInfo?.id,
        myInfo,
      });
      if (status === 'SUCCESS') {
        setChineseWallState(result);
      } else {
        setChineseWallState([]);
      }
    };

    if (chineseWall?.length) {
      setChineseWallState(chineseWall);
    } else {
      getChineseWallList();
    }

    return () => {
      setChineseWallState([]);
    };
  }, [myInfo, chineseWall]);

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

  const setMoveMessagesData = useCallback(
    data => {
      if (data.status === 'SUCCESS') {
        // 차이니즈월 적용
        let { firstPage, search } = data;
        if (chineseWallState?.length) {
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
              chineseWall: chineseWallState,
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
    [chineseWallState],
  );

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
    [roomID, searchText, chineseWallState],
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
          chineseWall={chineseWallState}
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
