import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header from '@COMMON/Header';
import { useSelector, useDispatch } from 'react-redux';
import { updateRooms, getRooms, openRoom } from '@/modules/room';
import RoomItems from './RoomItems';
import NewChatIcon from '../common/icons/NewChatIcon';
import SearchBar from '../common/SearchBar';
import { getDic } from '@/config';
import { getChineseWall } from '@/lib/api/orgchart';

const ChatList = ({ navigation, route }) => {
  const roomList = useSelector(({ room }) => room.rooms);
  const loading = useSelector(({ loading }) => loading['room/GET_ROOMS']);
  const userId = useSelector(({ login }) => login.id);
  const myInfo = useSelector(({ login }) => login.userInfo);
  const chineseWall = useSelector(({ login }) => login.chineseWall);

  const [searchText, setSearchText] = useState('');
  const [listMode, setListMode] = useState('N'); //Normal, Search
  const [searchList, setSearchList] = useState([]);
  const [chineseWallState, setChineseWallState] = useState([]);

  const dispatch = useDispatch();

  const handleRoomChange = useCallback(
    room => {
      dispatch(openRoom({ roomID: room.roomID }));
      navigation.navigate('ChatRoom', { roomID: room.roomID });
    },
    [dispatch, navigation],
  );

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

  useEffect(() => {
    if (listMode == 'S') {
      handleSearch(searchText);
    }
  }, [handleSearch, listMode, searchText]);

  const handleSearch = useCallback(
    changeVal => {
      setSearchText(changeVal);

      if (changeVal == '') {
        setListMode('N');
      } else {
        const filterList = roomList.filter(item => {
          let returnVal = false;

          if (item.roomName && item.roomName.indexOf(changeVal) > -1) {
            return true;
          } else {
            if (item.members) {
              item.members.forEach(member => {
                if (
                  member.id != userId &&
                  member.name.indexOf(changeVal) > -1
                ) {
                  returnVal = true;
                  return false;
                }
              });
            } else {
              returnVal = false;
            }
          }

          return returnVal;
        });

        setSearchList(filterList);
        setListMode('S');
      }
    },
    [roomList],
  );

  useEffect(() => {
    // roomList가 변할때 updatedate가 null인 속성들을 찾아 요청 및 데이터 채워줌
    let updateList = [];
    if (roomList) {
      roomList.forEach(r => {
        if (r.updateDate === null) updateList.push(r.roomID);
      });
    }
    if (updateList.length > 0) {
      dispatch(updateRooms({ updateList }));
    }
  }, [roomList]);

  useEffect(() => {
    if (roomList == null || roomList.length == 0) dispatch(getRooms());
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title={getDic('Chat')}
        style={styles.header}
        topButton={
          myInfo &&
          myInfo.isExtUser !== 'Y' && [
            {
              code: 'startChat',
              onPress: () => {
                navigation.navigate('InviteMember', {
                  headerName: getDic('StartChat'),
                  isNewRoom: true,
                });
              },
              svg: <NewChatIcon />,
            },
          ]
        }
      />
      <View style={styles.contentWrap}>
        <SearchBar
          style={styles.searchBarContainer}
          placeholder={getDic('Msg_chatSearch')}
          onChangeText={text => {
            handleSearch(text);
          }}
          searchText={searchText}
        />
        <View style={styles.contents}>
          {listMode == 'N' && (
            <>
              {roomList && roomList.length > 0 && (
                <RoomItems
                  rooms={roomList}
                  loading={loading}
                  onRoomChange={handleRoomChange}
                  navigation={navigation}
                  chineseWall={chineseWallState}
                />
              )}
              {(!roomList || roomList.length === 0) && (
                <View style={styles.blankList}>
                  <Text style={styles.blankText}>
                    {getDic('Msg_NoChatRoom')}
                  </Text>
                </View>
              )}
            </>
          )}
          {listMode == 'S' && (
            <RoomItems
              rooms={searchList}
              loading={false}
              onRoomChange={handleRoomChange}
              navigation={navigation}
              chineseWall={chineseWallState}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentWrap: {
    padding: 15,
    flex: 1,
  },
  contents: {
    marginTop: 15,
    flex: 8,
  },
  blankList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blankText: { color: '#999', fontSize: 15 },
  wrapButton: {
    width: wp('100%'),
    height: hp('8%'),
    paddingLeft: wp('8%'),
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  searchBarContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
});

export default ChatList;
