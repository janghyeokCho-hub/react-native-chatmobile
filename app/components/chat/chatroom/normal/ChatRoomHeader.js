import React, { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ProfileBox from '@/components/common/ProfileBox';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import Svg, { Path, G, Rect, Circle } from 'react-native-svg';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getDic } from '@/config';
import { getJobInfo } from '@/lib/common';
import { useTheme } from '@react-navigation/native';
import { Alert } from 'react-native';
import RoomMemberBox from '@C/chat/RoomMemberBox';

const makeRoomName = (room, id, isInherit, sizes) => {
  // 방 이름 생성하는 규칙 처리 필요
  if (room && (room.members || room.groups)) {
    // 그룹단위로 선택된 경우 ( 방생성시에만 유효 )
    if (room.roomType === 'M' || room.roomType === 'O') {
      let filterMember = null;

      if (room.roomType === 'M') {
        filterMember = room.members.filter(item => {
          if (item.id === id) return false;
          return true;
        });
      } else if (room.roomType === 'O') {
        filterMember = room.members;
      }
      const target = filterMember && filterMember[0];

      if (target) {
        return (
          <>
            <ProfileBox
              userId={target.id}
              userName={target.name}
              presence={target.presence}
              isInherit={isInherit} // 새방 생성 시 프레젠스 목록에 추가
              img={target.photoPath}
              style={styles.headerProfile}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', width: "50%" }}>
              <Text style={{ fontSize: sizes.default, maxWidth:'100%' }} numberOfLines={2}>
                {getJobInfo(target)}
              </Text>
              {target.isMobile === 'Y' && (
                <View style={{ paddingLeft: 5 }}>
                  <Svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="9"
                    height="12"
                    viewBox="0 0 7 10"
                  >
                    <G transform="translate(-185 -231)">
                      <Rect
                        width="7"
                        height="10"
                        transform="translate(185 231)"
                        fill="#4f5050"
                      />
                      <Rect
                        width="5"
                        height="6"
                        transform="translate(186 232)"
                        fill="#fff"
                      />
                      <Circle
                        cx="0.5"
                        cy="0.5"
                        r="0.5"
                        transform="translate(188 239)"
                        fill="#fff"
                      />
                    </G>
                  </Svg>
                </View>
              )}
            </View>
          </>
        );
      } else {
        return <></>;
      }
    } else if (room.roomType === 'A') {
      const target = room.members[0];

      return (
        <>
          <ProfileBox
            userId={target.id}
            userName={target.name}
            presence={null}
            isInherit={false} // 새방 생성 시 프레젠스 목록에 추가
            img={target.photoPath}
            style={styles.headerProfile}
          />
          <View>
            <Text style={{ fontSize: sizes.default }}>{target.name}</Text>
          </View>
        </>
      );
    } else {
      return (
        <>
          <RoomMemberBox
            type="G"
            data={room.members}
            roomID={room.roomID}
            style={styles.headerProfile}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 10,
            }}
          >
            <Text style={{ fontSize: sizes.default }} numberOfLines={1}>
              {room.roomName == ''
                ? getDic('GroupChatRoom', '그룹채팅방')
                : room.roomName}{' '}
              ({room.members.length})
            </Text>
          </View>
        </>
      );
    }
  } else {
    return <Text />;
  }
};

const ChatRoomHeader = ({
  roomInfo,
  isMakeRoom,
  onSearchBox,
  openSideMenu,
  navigation,
  cancelToken
}) => {
  const { colors, sizes } = useTheme();
  const { tempMessage, id } = useSelector(({ message, login }) => ({
    id: login.id,
    tempMessage: message.tempMessage,
  }));

  const roomName = useMemo(
    () => makeRoomName(roomInfo, id, !isMakeRoom, sizes),
    [roomInfo, id, isMakeRoom, sizes],
  );

  const handleLayerBox = () => {
    openSideMenu();
  };

  const viewSearchBox = () => {
    onSearchBox(true);
  };

  const backButtonHandler = useCallback(() => {
    if (tempMessage && tempMessage.length > 0) {
      const hasPendingFile = tempMessage.some(
        item => item.sendFileInfo && item.sendFileInfo.files.length > 0,
      );

      if (hasPendingFile) {
        Alert.alert(getDic('Eumtalk'), getDic('Msg_FileSendingClose'), [
          {
            text: getDic('Ok'),
            onPress: () => {
              cancelToken.cancel();
              navigation.dispatch(CommonActions.goBack);
            },
          },
          { text: getDic('Cancel') },
        ]);

        return true;
      }
    }

    navigation.dispatch(CommonActions.goBack);
  }, [tempMessage, cancelToken, navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backButtonHandler,
    );

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    };
  }, [backButtonHandler]);

  return (
    <>
      <View style={styles.top}>
        <TouchableOpacity
          style={styles.topBackBtn}
          onPress={() => {
            if (tempMessage && tempMessage.length > 0) {
              tempMessage.map(item => {
                if (item.sendFileInfo && item.sendFileInfo.files.length > 0) {
                  Alert.alert(
                    getDic('Eumtalk'),
                    getDic('Msg_FileSendingClose'),
                    [
                      {
                        text: getDic('Ok'),
                        onPress: () => {
                          cancelToken.cancel();
                          navigation.dispatch(CommonActions.goBack);
                        },
                      },
                      {
                        text: getDic('Cancel'),
                      },
                    ],
                  );
                }
              });
            } else navigation.dispatch(CommonActions.goBack);
          }}
        >
          <Svg width="7.131" height="12.78" viewBox="0 0 7.131 12.78">
            <Path
              id="패스_2901"
              data-name="패스 2901"
              d="M698.2,291.6a.524.524,0,0,0-.742.741l5.579,5.592-5.579,5.4a.524.524,0,0,0,.742.742l6.236-6.139Z"
              transform="translate(704.432 304.223) rotate(180)"
              fill="#222"
            />
          </Svg>
        </TouchableOpacity>

        {roomInfo && roomName}

        <View style={styles.leftMenuBox}>
          <>
            {/* 검색 버튼 */}
            {onSearchBox &&
              (!isMakeRoom && roomInfo) &&
              roomInfo.roomType != 'A' && (
                <TouchableOpacity onPress={viewSearchBox}>
                  <View style={styles.searchBtn}>
                    <Svg width="18" height="18" viewBox="0 0 13.364 13.364">
                      <Path
                        d="M304.2,2011.439l-3.432-3.432a5.208,5.208,0,0,0,.792-2.728,5.279,5.279,0,1,0-5.28,5.279,5.208,5.208,0,0,0,2.728-.792l3.432,3.432a.669.669,0,0,0,.88,0l.88-.88A.669.669,0,0,0,304.2,2011.439Zm-7.919-2.64a3.52,3.52,0,1,1,3.52-3.52A3.53,3.53,0,0,1,296.279,2008.8Z"
                        transform="translate(-291 -2000)"
                        fill="#ababab"
                      />
                    </Svg>
                  </View>
                </TouchableOpacity>
              )}
          </>

          {/* 확장 메뉴 버튼 */}
          {roomInfo && roomInfo.roomType != 'A' && (
            <TouchableOpacity onPress={handleLayerBox}>
              <View style={styles.menuBtn}>
                <Svg width="18" height="16" viewBox="0 0 13.25 10.25">
                  <Path
                    d="M3,16.25H16.25V14.542H3Zm0-4.271H16.25V10.271H3ZM3,6V7.708H16.25V6Z"
                    transform="translate(-3 -6)"
                    fill="#ababab"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  top: {
    width: '100%',
    height: hp('9%'),
    backgroundColor: '#F6F6F6',
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBackBtn: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  searchBtn: {
    padding: 20,
    paddingRight: 0,
    height: '100%',
    justifyContent: 'center',
  },
  menuBtn: {
    padding: 20,
    paddingLeft: 22,
    height: '100%',
    justifyContent: 'center',
  },
  leftMenuBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerProfile: {
    width: 40,
    height: 40,
    margin: 5,
  },
});

export default ChatRoomHeader;
