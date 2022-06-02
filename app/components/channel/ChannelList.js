import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useSelector, useDispatch } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import { useTheme } from '@react-navigation/native';
import Header from '@COMMON/Header';
import SearchBar from '@COMMON/SearchBar';
import { updateChannels, getChannels, openChannel } from '@/modules/channel';
import AddChannelIcon from '@COMMON/icons/AddChannelIcon';
import ChannelCategoryIcon from '@COMMON/icons/ChannelCategoryIcon';
import ChannelItems from './ChannelItems';
import { closeModal } from '@/modules/modal';
import NetworkError from '../common/NetworkError';
import { getDic } from '@/config';
import * as channelApi from '@/lib/api/channel';
import { moveToChannelRoom } from '@/lib/channelUtil';
import { getConfig } from '@/config';

const ChannelList = ({ navigation }) => {
  const { sizes } = useTheme();
  const myInfo = useSelector(({ login }) => login.userInfo);
  const channelList = useSelector(({ channel }) => channel.channels);
  const loading = useSelector(
    ({ loading: _loading }) => _loading['room/GET_ROOMS'],
  );
  const networkState = useSelector(({ app }) => app.networkState);

  const [searchText, setSearchText] = useState('');
  const [listMode, setListMode] = useState('N'); //Normal, Search
  const [searchList, setSearchList] = useState([]);

  const dispatch = useDispatch();

  const joinChannel = useCallback(
    params => {
      channelApi.joinChannel(params).then(({ data }) => {
        if (data.status === 'SUCCESS') {
          const { roomId } = params;
          dispatch(openChannel({ roomId }));
          moveToChannelRoom(navigation, 'ChannelRoom', { roomID: roomId });
        }
      });
    },
    [dispatch, navigation],
  );

  const handleChannelChange = useCallback(
    channel => {
      dispatch(
        openChannel({
          members: channel.members,
          openType: channel.openType,
          roomId: channel.roomId,
        }),
      );
      navigation.navigate('ChannelRoom', { roomID: channel.roomId });
      dispatch(closeModal());
    },
    [dispatch, navigation],
  );

  useEffect(() => {
    if (listMode == 'S') {
      handleSearch(searchText);
    }
  }, [handleSearch, listMode, searchText]);
  const IsSaaSClient = getConfig('IsSaaSClient', 'N');

  const searchChannel = useThrottledCallback(async changeVal => {
    const reqData = {
      type: 'name',
      value: changeVal,
      ...(IsSaaSClient && { copanyCode: myInfo.companyCode }),
    };
    const { data: response } = await channelApi.searchChannel(reqData);
    if (response.status !== 'SUCCESS') {
      return;
    }
    const searchResult = response.result?.map(chan => {
      const joinedChannel = channelList.findIndex(
        c => c.roomId === chan.roomId,
      );
      if (joinedChannel !== -1) {
        // 이미 가입한 채널일 경우 검새결과 대신 lastMessage, lastMessageDate 정보가 있는 local state로 교체
        return {
          ...channelList[joinedChannel],
          isJoin: false,
        };
      } else {
        // 미가입채널은 검색결과 데이터를 그대로 사용
        return {
          ...chan,
          isJoin: true,
        };
      }
    });
    return searchResult;
  }, 50);

  const handleSearch = useCallback(
    async changeVal => {
      setSearchText(changeVal);
      if (changeVal === '') {
        setListMode('N');
        return;
      } else {
        setListMode('S');
        const searchResult = await searchChannel(changeVal);
        console.log('SearchResult   ', searchResult[0]);
        setSearchList(searchResult);
      }
    },
    [searchChannel],
  );

  const onChannelJoin = useCallback(roomId => {
    setSearchList(prev => {
      const joinedChannel = prev.findIndex(chan => chan.roomId === roomId);
      if (joinedChannel !== -1) {
        prev[joinedChannel].isJoin = false;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    // channelList가 변할때 categoryCode가 null인 속성들을 찾아 요청 및 데이터 채워줌
    let updateList = [];
    if (channelList) {
      channelList.forEach(c => {
        if (c.categoryCode === null) updateList.push(c.roomId);
        else if (c.updateDate === null) updateList.push(c.roomId);
      });
    }
    if (updateList.length > 0) {
      dispatch(
        updateChannels({
          updateList,
        }),
      );
    }
  }, [dispatch, channelList]);

  useEffect(() => {
    if (channelList === null || channelList.length === 0) {
      dispatch(getChannels());
    }
  }, [dispatch, channelList]);

  return (
    <View style={styles.container}>
      <Header
        title={getDic('Channel')}
        style={styles.header}
        topButton={
          (networkState &&
            myInfo &&
            myInfo.isExtUser !== 'Y' && [
              {
                code: 'selectCategory',
                onPress: () => {
                  navigation.navigate('CategorySelect', {
                    headerName: getDic('Category'),
                    isNewRoom: true,
                  });
                },
                svg: <ChannelCategoryIcon color={'black'} />,
              },
              {
                code: 'startChannel',
                onPress: () => {
                  navigation.navigate('CreateChannel', {
                    headerName: getDic('CreateChannel'),
                    isNewRoom: true,
                  });
                },
                svg: <AddChannelIcon color={'black'} width="32" height="32" />,
              },
            ]) ||
          []
        }
      />
      {networkState && (
        <View style={styles.contentWrap}>
          <SearchBar
            style={styles.searchBarContainer}
            placeholder={getDic('Msg_channelSearch')}
            onChangeText={text => {
              handleSearch(text);
            }}
            disabled={myInfo && myInfo.isExtUser === 'Y'}
            searchText={searchText}
          />
          <Text
            style={{ color: '#666', fontSize: 13 + sizes.inc, marginTop: 3 }}
          >
            {getDic('SubscribedChannel')}
          </Text>
          <View style={styles.contents}>
            {listMode === 'N' && (
              <ChannelItems
                rooms={channelList}
                loading={loading}
                onRoomChange={handleChannelChange}
                navigation={navigation}
              />
            )}
            {listMode === 'S' && (
              <ChannelItems
                rooms={searchList}
                onChannelJoin={onChannelJoin}
                loading={false}
                onRoomChange={handleChannelChange}
                navigation={navigation}
              />
            )}
          </View>
        </View>
      )}
      {!networkState && (
        <NetworkError
          handleRefresh={() => {
            dispatch(getChannels());
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    marginTop: 15,
    flex: 8,
  },
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
  contentWrap: {
    padding: 15,
    flex: 1,
  },
});

export default ChannelList;
