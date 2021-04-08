import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useSelector, useDispatch } from 'react-redux';
import Header from '@COMMON/Header';
import SearchBar from '@COMMON/SearchBar';
import { updateChannels, getChannels, openChannel } from '@/modules/channel';
import AddChannelIcon from '@COMMON/icons/AddChannelIcon';
import ChannelCategoryIcon from '@COMMON/icons/ChannelCategoryIcon';
import ChannelItems from './ChannelItems';
import { openModal, changeModal, closeModal } from '@/modules/modal';
import NetworkError from '../common/NetworkError';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';
const ChannelList = ({ navigation }) => {
  const { sizes } = useTheme();
  const modalInfo = useSelector(({ modal }) => modal.modalData);
  const channelList = useSelector(({ channel }) => channel.channels);
  const loading = useSelector(({ loading }) => loading['room/GET_ROOMS']);
  const userId = useSelector(({ login }) => login.id);
  const networkState = useSelector(({ app }) => app.networkState);
  const myInfo = useSelector(({ login }) => login.userInfo);

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
    [dispatch],
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
      // if (channel.openType === 'O' || channel.openType === 'P') {

      // } else {
      //   if (modalInfo.channel) {
      //     dispatch(
      //       changeModal({
      //         modalData: {
      //           closeOnTouchOutside: true,
      //           type: 'channelPasswordInput',
      //           channel: modalInfo.channel,
      //           navigation: navigation,
      //         },
      //       }),
      //     );
      //   } else {
      //     dispatch(
      //       changeModal({
      //         modalData: {
      //           closeOnTouchOutside: true,
      //           type: 'channelPasswordInput',
      //           channel: channel,
      //           navigation: navigation,
      //         },
      //       }),
      //     );
      //     dispatch(openModal());
      //   }
      // }
    },
    [dispatch, navigation],
  );

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
        const filterList = channelList.filter(item => {
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
    [channelList],
  );

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
  }, [channelList]);

  useEffect(() => {
    if (channelList == null || channelList.length == 0) dispatch(getChannels());
  }, []);

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
            {listMode == 'N' && (
              <ChannelItems
                rooms={channelList}
                loading={loading}
                onRoomChange={handleChannelChange}
                navigation={navigation}
              />
            )}
            {listMode == 'S' && (
              <ChannelItems
                rooms={searchList}
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
