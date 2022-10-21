import React, { useCallback, useEffect, useState, useMemo } from 'react';

import {
  View,
  StyleSheet,
  UIManager,
  Platform,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getDic } from '@/config';
import { useSelector } from 'react-redux';
import { getDocItem, getRoomDicList } from '@/lib/api/shareDoc';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ShareDocLayer = ({ handleDocumentControl, postAction }) => {
  const currentRoom = useSelector(({ room, channel }) => {
    if (room.currentRoom) {
      return room.currentRoom;
    } else if (channel.currentChannel) {
      return channel.currentChannel;
    } else {
      return {
        members: [],
      };
    }
  });

  const [refresh, setRefresh] = useState(false);
  const [space, setSpace] = useState(0);
  const [list, setList] = useState([]);
  const [roomID, setRoomID] = useState(0);

  useEffect(() => {
    if (currentRoom) {
      setRoomID(
        currentRoom.roomType === 'C' ? currentRoom.roomId : currentRoom.roomID,
      );
    }
  }, [currentRoom]);

  useEffect(() => {
    async function getList() {
      try {
        const response = await getRoomDicList(roomID);
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
        setSpace(300);
      } catch (e) {
        setRefresh(false);
        setSpace(300);
      }
    }

    if (roomID) {
      setRefresh(true);
      getList();
    } else {
      setRefresh(false);
      setSpace(0);
      setList([]);
    }

    return () => {
      setRefresh(false);
      setSpace(0);
      setList([]);
    };
  }, [roomID]);

  const handleShareDoc = useCallback(
    async item => {
      const response = await getDocItem(item.docID);
      const { status, result } = response?.data;
      if (result && status === 'SUCCESS') {
        console.log(currentRoom);
        const msgObj = JSON.stringify({
          title: getDic('JointDoc', '공동문서'),
          context: result.docTitle,
          func: [
            {
              name: getDic('docEdit', '문서 편집'),
              type: 'link',
              data: {
                baseURL: result.docURL,
              },
            },
            {
              name: getDic('ViewProperties', '속성 보기'),
              type: 'openLayer',
              data: {
                componentName: 'DocPropertyView',
                item: result,
                roomID: roomID,
              },
            },
            {
              name: getDic('InviteEditor', '편집자 초대'),
              type: 'openLayer',
              data: {
                componentName: 'InviteMember',
                headerName: getDic('InviteEditor', '편집자 초대'),
                roomId: result.roomID,
                roomType: currentRoom?.roomType,
                isNewRoom: false,
              },
            },
          ],
        });

        postAction({
          message: msgObj,
          messageType: 'A',
        });
      } else {
        Alert.alert(
          null,
          getDic(
            'Msg_Error',
            '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
          ),
        );
      }
    },
    [currentRoom, roomID, postAction],
  );

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.line}>
        <View style={styles.docItem} key={index}>
          <TouchableOpacity
            onPress={() => {
              handleShareDoc(item);
              handleDocumentControl();
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

  return <View style={{ height: space }}>{FlatListRender}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
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

export default ShareDocLayer;
