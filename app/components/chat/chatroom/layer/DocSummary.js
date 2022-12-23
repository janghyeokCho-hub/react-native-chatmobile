import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getDic } from '@/config';
import { getRoomDicList } from '@/lib/api/shareDoc';
import { Alert } from 'react-native';
import { changeModal, openModal, closeModal } from '@/modules/modal';
import { withSecurityScreen } from '@/withSecurityScreen';

const DocSummary = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { room } = route.params;
  const roomId = room.roomType === 'C' ? room.roomId : room.roomID;

  const [refresh, setRefresh] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    async function getList() {
      try {
        const response = await getRoomDicList(roomId);
        const { result, status } = response?.data;
        if (status === 'SUCCESS' && response.status === 200) {
          if (result) {
            if (Array.isArray(result)) {
              setList(result);
            } else {
              const arr = new Array(result);
              setList(arr);
            }
          }
        } else {
          Alert.alert(
            getDic(
              'Msg_Error',
              '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
            ),
          );
        }
        setRefresh(false);
      } catch (e) {
        setRefresh(false);
      }
    }

    if (roomId) {
      setRefresh(true);
      getList();
    } else {
      setRefresh(false);
      setList([]);
    }

    return () => {
      setRefresh(false);
      setList([]);
    };
  }, [roomId]);

  const handleShareDocModal = useCallback(
    item => {
      dispatch(
        changeModal({
          modalData: {
            type: 'shareDoc',
            docItem: item,
            room: room,
            navigation: navigation,
          },
        }),
      );
      dispatch(openModal());
    },
    [dispatch, navigation, room],
  );

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.line}>
        <View style={styles.docItem} key={index}>
          <TouchableOpacity
            onPress={() => {
              handleShareDocModal(item);
            }}
          >
            <Text style={styles.docTitleStyle}>{item.docTitle}</Text>
            <Text style={styles.descriptionStyle}>{item.description}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const FlatListRender = useMemo(() => {
    return (
      <FlatList
        data={list}
        renderItem={renderItem}
        style={[styles.container, { flex: 1 }]}
        keyExtractor={item => {
          const key =
            (item.docId && item.docId.toString()) || `temp_${item.tempId}`;
          return key;
        }}
        onEndReachedThreshold={0.3}
        onStartReachedThreshold={0.5}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
        }}
        keyboardShouldPersistTaps="handled"
        refreshing={refresh}
        decelerationRate="fast"
        removeClippedSubviews={false}
      />
    );
  }, [list, refresh]);

  const handleClose = () => {
    navigation.dispatch(CommonActions.goBack());
  };

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
              {getDic('ShareDocSummary', '공동문서 모아보기')}
            </Text>
          </View>
        </View>
        {FlatListRender}
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
  docItem: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
    marginLeft: 20,
    flexDirection: 'column',
  },
  docTitleStyle: {
    fontSize: 16,
  },
  descriptionStyle: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 10,
  },
  line: {
    width: '100%',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E9',
    lineHeight: 0.1,
  },
  emptyListStyle: {},
});

export default withSecurityScreen(DocSummary);
