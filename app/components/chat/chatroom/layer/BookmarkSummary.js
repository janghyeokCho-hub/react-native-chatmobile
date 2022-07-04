import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { getConfig, getDic } from '@/config';
import Svg, { Path } from 'react-native-svg';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr, getJobInfo } from '@/lib/common';
import { managesvr } from '@API/api';
import { changeModal, openModal } from '@/modules/modal';

const BookmarkSummary = ({ route, navigation }) => {
  const { roomID } = route.params;
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const [bookmarkList, setBookmarkList] = useState([]);
  const dispatch = useDispatch();

  const handleMoveChat = (roomID, messageID) => {
    navigation.navigate('MoveChat', { roomID, messageID });
  };

  const handleClose = () => {
    navigation.dispatch(CommonActions.goBack());
  };

  const getList = async () => {
    try {
      const response = await managesvr('get', `/bookmark/${roomID}`);
      if (response.data.status === 'SUCCESS') {
        let list = response.data.list;
        list = list.filter((item = {}) => {
          let isBlock = false;
          if (chineseWall?.length) {
            const senderInfo = isJSONStr(item.senderInfo)
              ? JSON.parse(item.senderInfo)
              : item.senderInfo;
            const { blockChat } = isBlockCheck({
              targetInfo: {
                ...senderInfo,
                id: item?.sender || senderInfo?.sender,
              },
              chineseWall,
            });
            isBlock = blockChat;
          }
          return isBlock === false;
        });
        list.sort((a, b) => b.sendDate - a.sendDate);

        console.log('list', list);
        setBookmarkList(list);
        await console.log('bookmarkList[0]', bookmarkList[0]);
      } else {
        return;
      }
    } catch (error) {
      console.log('Send Error   ', error);
    }
  };

  const handleDeleteBookmark = async item => {
    try {
      const { data } = await managesvr(
        'delete',
        `/bookmark/${item.roomId}/${item.bookmarkId}`,
      );

      if (data.status === 'SUCCESS') {
        setBookmarkList([]);
        getList();
      }
    } catch (error) {
      console.log('Send Error   ', error);
    }
  };

  const getDate = idx => {
    let returnDate = '';

    if (idx === 0) {
      returnDate = format(new Date(bookmarkList[idx].sendDate), 'yyyy.MM.dd');
    } else {
      let preDate = format(
        new Date(bookmarkList[idx - 1].sendDate),
        'yyyy.MM.dd',
      );
      let currDate = format(new Date(bookmarkList[idx].sendDate), 'yyyy.MM.dd');

      if (preDate !== currDate)
        returnDate = format(new Date(bookmarkList[idx].sendDate), 'yyyy.MM.dd');
    }
    return returnDate;
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.bookmarkList}>
        <Text style={getDate(index) && styles.datetxt}>{getDate(index)} </Text>

        <TouchableOpacity
          style={styles.bookmark}
          onPress={() => handleMoreOptins(item)}
        >
          <View style={styles.contents}>
            <Text style={styles.context}>{item.context}</Text>
            <Text style={styles.profile}>{getJobInfo(item.senderInfo)}</Text>
          </View>

          <TouchableOpacity onPress={() => handleDeleteBookmark(item)} style={styles.delIcon}>
            <Svg
              width="20px"
              height="20px"
              viewBox="0 0 200 200"
              data-name="Layer 1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              fill="#222"
            >
              <Path d="M170,47.5H30a10,10,0,0,0,0,20h5.5l9,88a29.91,29.91,0,0,0,30,27h51c15.5,0,28-11.5,30-27l9-88H170a10,10,0,0,0,0-20Zm-34.5,106a10.23,10.23,0,0,1-10,9h-51a10.23,10.23,0,0,1-10-9l-9-86h89l-9,86Zm-50.5-6a10,10,0,0,0,10-10V90a10,10,0,0,0-20,0v47.5A10,10,0,0,0,85,147.5Zm30,0a10,10,0,0,0,10-10V90a10,10,0,0,0-20,0v47.5A10,10,0,0,0,115,147.5ZM85,37.5h27.5a10,10,0,0,0,0-20H85a10,10,0,0,0,0,20Z" />
            </Svg>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const handleMoreOptins = useCallback(
    item => {
      var modalBtn = [];
      modalBtn = [
        {
          code: 'showContent',
          title: getDic('ShowChat'),
          onPress: () => {
            handleMoveChat(item.roomId, item.messageId);
          },
        },
      ];

      dispatch(
        changeModal({
          modalData: {
            closeOnTouchOutside: true,
            type: 'normal',
            buttonList: modalBtn,
          },
        }),
      );
      dispatch(openModal());
    },
    [dispatch],
  );

  useEffect(() => {
    getList();
  }, []);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.exitBtnView}>
            <TouchableOpacity onPress={handleClose}>
              <View style={styles.topBtn}>
                <Svg width="7.131" height="12.78" viewBox="0 0 7.131 12.78">
                  <Path
                    id="패스_2901"
                    data-name="패스 2901"
                    d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
                    transform="translate(704.432 304.223) rotate(180)"
                    fill="#222"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.titleView}>
            <Text style={styles.modaltit}>
              {getDic('BookmarkSummary', '책갈피 모아보기')}
            </Text>
          </View>
        </View>
        <FlatList
          data={bookmarkList}
          renderItem={renderItem}
          keyExtractor={bookmarkList => bookmarkList.bookmarkListId}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: getTopPadding(),
    paddingBottom: getBottomPadding(),
  },
  header: {
    width: '100%',
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  exitBtnView: { width: '20%', alignItems: 'flex-start' },
  titleView: { width: '60%', alignItems: 'center' },
  modaltit: {
    fontSize: 18,
  },
  topBtn: {
    marginLeft: 10,
    padding: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bookmarkList: {
    paddingHorizontal: 10,
  },
  bookmark: {
    flexDirection: 'row',
  },
  contents: {
    flex: 4,
  },
  datetxt: { marginVertical: 15, flex: 1 },
  profile: {
    color: 'grey',
  },
  fileBox: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default BookmarkSummary;
