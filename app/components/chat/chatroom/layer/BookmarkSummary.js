import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import { getDic } from '@/config';
import Svg, { Path } from 'react-native-svg';
import { isBlockCheck } from '@/lib/api/orgchart';
import { isJSONStr, getJobInfo } from '@/lib/common';
import { managesvr } from '@API/api';

const BookmarkSummary = ({ route, navigation }) => {
  const { roomID } = route.params;
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const [bookmarkList, setBookmarkList] = useState([]);
  const [edit, setEdit] = useState(false);

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

  const renderItem = ({ item }) => {
    return (
      <View style={styles.bookmarkList}>
        <TouchableOpacity
          style={styles.bookmark}
          onPress={() => handleMoveChat(item.roomId, item.messageId)}
        >
          <View style={styles.contents}>
            <Text style={styles.context}>{item.context}</Text>
            <Text style={styles.sendProfile}>
              {`${getJobInfo(item.senderInfo)} ·  ${format(
                new Date(item.sendDate),
                'M월dd일 HH:mm ',
              )}`}
            </Text>
          </View>
          {edit && (
            <TouchableOpacity
              onPress={() => handleDeleteBookmark(item)}
              style={styles.delView}
            >
              <Text style={styles.delBtn}>삭제</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  };

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
          <View style={styles.editView}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={()=> setEdit(!edit)}
            >
              {edit ? <Text>{getDic('Completion', '완료')}</Text> : <Text>{getDic('Modify', '수정')}</Text>}
            </TouchableOpacity>
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
  exitBtnView: { flex: 1, alignItems: 'flex-start' },
  titleView: { flex: 2, alignItems: 'center' },
  modaltit: {
    fontSize: 18,
  },
  editView: {
    alignItems: 'flex-end',
    flex: 1,
  },
  editBtn: {
    alignItems: 'flex-end',
    marginRight: 20,
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
    paddingVertical: 10,
  },
  bookmark: {
    marginVertical: 5,
    marginHorizontal: 4,
    flexDirection: 'row',
  },
  contents: {
    flex: 4,
  },
  context: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  sendProfile: {
    color: 'grey',
    marginRight: 10,
    fontSize: 13,
  },
  delView: {
    alignSelf: 'center',
  },
  delBtn: {
    borderColor: '#D0D0D0',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 13,
    textAlign: 'center',
    fontSize: 13,
  },
});

export default BookmarkSummary;
