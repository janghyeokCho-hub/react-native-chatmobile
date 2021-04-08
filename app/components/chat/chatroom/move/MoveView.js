import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { getMessage, getChannelMessage } from '@/lib/messageUtil';
import { setUnreadCountForSync } from '@/modules/room';
import SearchList from '@C/chat/chatroom/search/SearchList';
import ChannelSearchList from '@C/channel/search/SearchList';
import { CommonActions } from '@react-navigation/native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';

const cancelBtnImg = require('@C/assets/ico_cancelbutton.png');

const MoveView = ({ route, navigation }) => {
  const { sizes } = useTheme();
  const { isRoom, isChannel } = useSelector(({ room, channel }) => ({
    isRoom: !!room.currentRoom,
    isChannel: !!channel.currentChannel,
  }));
  let roomID;
  let messageID;
  if (route.params && route.params.roomID)
    roomID = parseInt(route.params.roomID);
  else roomID = null;

  if (route.params && route.params.messageID)
    messageID = parseInt(route.params.messageID);
  else messageID = null;

  const [moveData, setMoveData] = useState(null);

  const dispatch = useDispatch();

  const closeMoveBox = useCallback(() => {
    setMoveData(null);
    navigation.dispatch(CommonActions.goBack());
  }, []);

  useEffect(() => {
    setMoveData({
      firstPage: [],
      moveId: -1,
    });
    const getCenterMessage = async () => {
      try {
        let response;
        if (isRoom) {
          response = await getMessage(
            roomID,
            messageID,
            'CENTER',
            param => {
              dispatch(setUnreadCountForSync(param));
            },
            false,
            50,
          );
        } else if (isChannel) {
          response = await getChannelMessage(roomID, messageID, 'CENTER');
        }

        if (response.data.status == 'SUCCESS') {
          const data = response.data.result;

          const findId = messageID;

          setMoveData({
            firstPage: data,
            moveId: findId,
          });
        }
      } catch (e) {
        // 초기화
        setMoveData(null);
        console.log(e);
      }
    };
    getCenterMessage();
  }, []);

  return (
    <>
      <View style={styles.statusBar} />
      <View style={styles.contanier}>
        <View style={styles.top}>
          <View style={styles.searchTextWrap}>
            <View style={styles.searchIcon}>
              <Svg width="18" height="18" viewBox="0 0 13.364 13.364">
                <Path
                  d="M304.2,2011.439l-3.432-3.432a5.208,5.208,0,0,0,.792-2.728,5.279,5.279,0,1,0-5.28,5.279,5.208,5.208,0,0,0,2.728-.792l3.432,3.432a.669.669,0,0,0,.88,0l.88-.88A.669.669,0,0,0,304.2,2011.439Zm-7.919-2.64a3.52,3.52,0,1,1,3.52-3.52A3.53,3.53,0,0,1,296.279,2008.8Z"
                  transform="translate(-291 -2000)"
                  fill="#ababab"
                />
              </Svg>
            </View>
            <View style={styles.searchInputWrap}>
              <Text
                style={{ ...styles.moveTitleHeader, fontSize: sizes.default }}
              >
                {getDic('ShowChat')}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={closeMoveBox}>
            <View style={styles.cancelBtn}>
              <Image source={cancelBtnImg} />
            </View>
          </TouchableOpacity>
        </View>

        {isRoom ? (
          <SearchList
            moveData={moveData}
            roomID={roomID}
            navigation={navigation}
          />
        ) : (
          <ChannelSearchList
            moveData={moveData}
            roomID={roomID}
            navigation={navigation}
          />
        )}

        <View style={styles.indexContainer} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  contanier: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  statusBar: {
    height: getTopPadding(),
    width: '100%',
    backgroundColor: '#F6F6F6',
  },
  top: {
    width: '100%',
    height: hp('9%'),
    backgroundColor: '#F6F6F6',
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 20,
    paddingBottom: 20,
  },
  searchTextWrap: {
    flexDirection: 'row',
    height: 35,
    flex: 1,
  },
  searchIcon: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputWrap: {
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
    flex: 1,
  },
  moveTitleHeader: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    width: 30,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexContainer: {
    width: '100%',
    height: 40 + getBottomPadding(),
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
  },
  indexText: {
    color: '#888',
  },
  indexArrowBox: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexBox: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 15,
  },
  indexArrowBtnWrap: {
    height: '100%',
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MoveView;
