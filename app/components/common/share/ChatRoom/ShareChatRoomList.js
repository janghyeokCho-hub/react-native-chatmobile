import React, { useCallback, useEffect, useState } from 'react';
import * as api from '@COMMON/share/lib/api';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { FlatList, View, TextInput, Image, StyleSheet } from 'react-native';
import ShareRoom from '@COMMON/share/ChatRoom/ShareRoom';

const searchImg = require('@C/assets/search.png');

const ShareChatRoomList = ({ selectedItems, appendItem, deleteItem }) => {
  const [listMode, setListMode] = useState('N');
  const [rooms, setRooms] = useState([]);
  const [tempRooms, setTempRooms] = useState([]);
  useEffect(() => {
    const server = api.getServerUtil();

    server.getChat('/rooms').then(({ data }) => {
      if (data.status === 'SUCCESS') {
        setRooms(data.rooms);
      }
    });
  }, []);

  const handleSearch = useCallback(
    changeVal => {
      if (changeVal == '') {
        setListMode('N');
        setTempRooms([]);
      } else {
        const userId = api.getServerUtil().id;
        const filterList = rooms.filter(item => {
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

        setTempRooms(filterList);
        setListMode('S');
      }
    },
    [rooms],
  );

  const handleCheck = useCallback(
    (chk, obj) => {
      if (chk) {
        // 선택
        appendItem({ ...obj });
      } else {
        // 해제
        deleteItem({ type: 'R', id: obj.id });
      }
    },
    [appendItem, deleteItem],
  );

  return (
    <View style={styles.contentWrap}>
      <View>
        <View style={styles.searchBarContainer}>
          <TextInput style={styles.textInput} onChangeText={handleSearch} />
          <Image source={searchImg} style={styles.searchImg} />
        </View>
      </View>
      <View style={styles.contents}>
        <View>
          <FlatList
            data={(listMode === 'N' && rooms) || tempRooms}
            keyExtractor={item => item.roomID}
            renderItem={({ item }) => {
              let isSelected = false;

              if (selectedItems) {
                isSelected =
                  selectedItems.findIndex(
                    selItem =>
                      selItem.id === item.roomID && selItem.type === 'R',
                  ) > -1;
              }

              return (
                <ShareRoom
                  room={item}
                  onCheck={handleCheck}
                  checked={isSelected}
                />
              );
            }}
          />
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
  textInput: {
    fontSize: 14,
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 0.5,
    borderRadius: 20,
    paddingLeft: 25,
    paddingRight: 45,
    color: '#AAA',
  },
  textDisabled: {
    backgroundColor: '#ddd',
  },
  searchImg: {
    position: 'absolute',
    width: 25,
    height: 25,
    right: 10,
    top: 7,
  },
});

export default ShareChatRoomList;
