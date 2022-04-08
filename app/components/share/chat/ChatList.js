import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import ChatItems from './ChatItems';
import SearchBar from '@COMMON/SearchBar';
import { getDic } from '@/config';

const ChatList = ({ checkObj, roomList }) => {
  const userId = useSelector(({ login }) => login.id);

  const [searchText, setSearchText] = useState('');
  const [listMode, setListMode] = useState('N'); //Normal, Search
  const [searchList, setSearchList] = useState([]);

  useEffect(() => {
    if (listMode === 'S') {
      handleSearch(searchText);
    }
  }, [handleSearch, listMode, searchText]);

  const handleSearch = useCallback(
    changeVal => {
      setSearchText(changeVal);

      if (changeVal === '') {
        setListMode('N');
      } else {
        const filterList = roomList.filter(item => {
          let returnVal = false;

          if (item.roomName && item.roomName.indexOf(changeVal) > -1) {
            return true;
          } else {
            if (item.members) {
              item.members.forEach(member => {
                console.log(
                  member.name,
                  changeVal,
                  member.name.indexOf(changeVal),
                );
                if (
                  member.id !== userId &&
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
    [roomList, userId],
  );

  return (
    <View style={styles.container}>
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
          {listMode === 'N' && (
            <>
              {roomList && roomList.length && (
                <ChatItems rooms={roomList} checkObj={checkObj} />
              )}
              {(!roomList || !roomList.length) && (
                <View style={styles.blankList}>
                  <Text style={styles.blankText}>
                    {getDic('Msg_NoChatRoom')}
                  </Text>
                </View>
              )}
            </>
          )}
          {listMode === 'S' && (
            <ChatItems rooms={searchList} checkObj={checkObj} />
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
