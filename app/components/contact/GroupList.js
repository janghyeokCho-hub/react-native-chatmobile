import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import UserInfoBox from '@COMMON/UserInfoBox';
import SearchBar from '@COMMON/SearchBar';
import NetworkError from '../common/NetworkError';
import { getDic } from '@/config';
import { getContacts } from '@/modules/contact';

const GroupList = ({ viewType, checkObj, group, navigation }) => {
  const groupUsers = group.sub;
  const oViewType = useSelector(({ room }) => room.viewType);
  const rooms = useSelector(({ room }) => room.rooms);
  const selectId = useSelector(({ room }) => room.selectId);
  const myInfo = useSelector(({ login }) => login.userInfo);
  const networkState = useSelector(({ app }) => app.networkState);

  const [searchHandleFlag, setSearchHandleFlag] = useState(true);

  const [type, setType] = useState(viewType);
  const [searchList, setSearchList] = useState(null);
  const [searchText, setSearchText] = useState('');

  const dispatch = useDispatch();

  const handleSearch = useCallback(
    value => {
      if (searchHandleFlag) {
        if (value && value != '') {
          setSearchList([]);
          setSearchText(value);
          if (networkState) {
            //그룹내 유저 검색
            setSearchList(group.sub.filter((user)=> (user.name.split(";")[0]).includes(value)));
          } else {
            setSearchList([]);
          }
        } else {
          setSearchList(null);
          setSearchText('');
          dispatch(getContacts({ DeptCode: myInfo.DeptCode }));
        }
      }
    },
    [type, searchList, networkState],
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentWrap}>
        <SearchBar
          style={styles.searchBarContainer}
          placeholder={getDic('Msg_contactSearch')}
          onChangeText={handleSearch}
          searchText={searchText}
        />
        {searchList ? (
          <>
            {networkState && (
              <FlatList
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={150}
                initialNumToRender={5}
                data={searchList}
                keyExtractor={item =>
                  item.id + '_' + (Math.floor(Math.random() * 100000) + 1)
                }
                renderItem={({ item }) => {
                  return (
                    <View style={styles.userBoxContainer}>
                      <UserInfoBox
                        userInfo={item}
                        isInherit={false}
                        onPress={type == 'list' ? null : false}
                        onLongPress={type == 'list' ? null : false}
                        checkObj={type == 'checklist' ? checkObj : null}
                        disableMessage={type == 'checklist'}
                        navigation={navigation}
                      />
                    </View>
                  );
                }}
              />
            )}
            {!networkState && <NetworkError />}
          </>
        ) : (
          <>
            {groupUsers && (
              <FlatList
                data={groupUsers}
                keyExtractor={item => item.id + '_' + (Math.floor(Math.random() * 100000) + 1)}
                renderItem={({ item }) => {
                  return (
                    <View style={styles.userBoxContainer}>
                      <UserInfoBox
                        userInfo={item}
                        isInherit={false}
                        onPress={false}
                        onLongPress={false}
                        checkObj={checkObj}
                        disableMessage={type == 'checklist'}
                        navigation={navigation}
                      />
                    </View>
                  );
                }}
              />
            )}
          </>
        )}
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
  searchBarContainer: {
    marginTop: 5,
    marginBottom: 20,
  },
  userBoxContainer: {
    marginBottom: 20,
  },
});

export default GroupList;
