import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getRooms, rematchingMember } from '@/modules/room';
import { useTheme } from '@react-navigation/native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { CommonActions } from '@react-navigation/native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { getDic, getServer } from '@/config';
import ProfileBox from '@C/common/ProfileBox';
import {
  getJobInfo,
  getSysMsgFormatStr,
  getBackgroundColor,
} from '@/lib/common';
import RoomMemberBox from '@C/chat/RoomMemberBox';
import LockIcon from '@COMMON/icons/LockIcon';
import OrgChartList from '@C/orgchart/OrgChartList';
import ChatList from '@C/share/chat/ChatList';
import ChannelList from '@C/share/channel/ChannelList';
import { makeParams, handleMessage, handleShareFile } from '@C/share/share';

const ShareContainer = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const { id: userId } = useSelector(({ login }) => ({
    id: login.id,
  }));
  const blockUser = useSelector(({ login }) => login.blockList);

  const headerName = getDic('Msg_Note_Forward');
  const { messageData, messageType } = route.params;
  /**
   * chatclient 와 통일
   * orgchart : 조직도
   * chat : 대화방
   * channel : 채널
   */
  const [selectTab, setSelectTab] = useState('orgchart');
  const { sizes } = useTheme();

  const [members, setMembers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [channels, setChannels] = useState([]);

  const roomList = useSelector(({ room }) => room.rooms).filter(
    room => room.roomType !== 'A',
  );
  const channelList = useSelector(({ channel }) => channel.channels);

  const handleClose = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, [navigation]);

  const orgCheckObj = useMemo(
    () => ({
      name: 'invite_',
      onPress: (checked, userInfo) => {
        if (checked) {
          if (userInfo.pChat === 'Y') {
            addInvite(
              {
                id: userInfo.id,
                name: userInfo.name,
                presence: userInfo.presence,
                photoPath: userInfo.photoPath,
                PN: userInfo.PN,
                LN: userInfo.LN,
                TN: userInfo.TN,
                dept: userInfo.dept,
                type: userInfo.type,
                isShow: true,
              },
              'orgchart',
            );
          } else {
            Alert.alert(
              null,
              getDic('Msg_GroupInviteError'),
              [
                {
                  text: getDic('Ok'),
                },
              ],
              { cancelable: true },
            );
          }
        } else {
          delInvite(userInfo.id, 'orgchart');
        }
      },
      disabledList: [],
      disabledKey: 'id',
      checkedList: [...members],
      checkedKey: 'id',
    }),
    [members, addInvite, delInvite],
  );

  const roomCheckObj = useMemo(
    () => ({
      name: 'invite_',
      onPress: (checked, room, filterMember) => {
        if (checked) {
          if (rooms.length) {
            Alert.alert(
              null,
              getDic(
                'Msg_SelectOnlyOneChatRoom',
                '대화방은 1개만 선택할 수 있습니다.',
              ),
            );
          } else {
            addInvite(
              {
                roomID: room.roomID,
                roomType: room.roomType,
                roomName: room.roomName,
                realMemberCnt: room.realMemberCnt,
                filterMember: filterMember,
              },
              'chat',
            );
          }
        } else {
          delInvite(room.roomID, 'chat');
        }
      },
      disabledKey: 'roomID',
      checkedList: [...rooms],
      checkedKey: 'roomID',
    }),
    [rooms, addInvite, delInvite],
  );

  const channelCheckObj = useMemo(
    () => ({
      name: 'invite_',
      onPress: (checked, channel) => {
        if (checked) {
          if (channels.length) {
            Alert.alert(
              null,
              getDic(
                'Msg_SelectOnlyOneChatRoom',
                '대화방은 1개만 선택할 수 있습니다.',
              ),
            );
          } else {
            addInvite(
              {
                roomId: channel.roomId,
                iconPath: channel.iconPath,
                roomType: channel.roomType,
                roomName: channel.roomName,
              },
              'channel',
            );
          }
        } else {
          delInvite(channel.roomId, 'channel');
        }
      },
      disabledKey: 'roomId',
      checkedList: [...channels],
      checkedKey: 'roomId',
    }),
    [channels, addInvite, delInvite],
  );

  const addInvite = useCallback((data, type) => {
    switch (type) {
      case 'orgchart':
        setMembers(prevState => prevState.concat(data));
        break;
      case 'chat':
        setRooms(prevState => prevState.concat(data));
        break;
      case 'channel':
        setChannels(prevState => prevState.concat(data));
        break;
    }
  }, []);

  const delInvite = useCallback((id, type) => {
    switch (type) {
      case 'orgchart':
        setMembers(prevState => prevState.filter(item => item.id !== id));
        break;
      case 'chat':
        setRooms(prevState => prevState.filter(item => item.roomID !== id));
        break;
      case 'channel':
        setChannels(prevState => prevState.filter(item => item.roomId !== id));
        break;
    }
  }, []);

  useEffect(() => {
    if (roomList === null || roomList.length === 0) {
      dispatch(getRooms());
    }
  }, [roomList, dispatch]);

  const makeRoomName = useCallback(room => {
    if (room.roomType === 'M' || room.roomType === 'O') {
      // M의 경우 남은 값이 1개
      const target = room.filterMember[0];
      return getJobInfo(target);
    } else {
      if (room.roomName !== '') {
        return `${room.roomName} (${room.filterMember &&
          room.filterMember.length})`;
      }

      if (room.filterMember.length === 0) {
        return getDic('NoChatMembers', '대화상대없음');
      }

      return getSysMsgFormatStr(getDic('Tmp_andOthers'), [
        { type: 'Plain', data: getJobInfo(room.filterMember[0]) },
        { type: 'Plain', data: room.filterMember.length },
      ]);
    }
  }, []);

  const handleTabChange = useCallback(
    type => {
      if (selectTab === type) {
        return;
      }
      if (type !== 'orgchart') {
        setMembers([]);
      } else if (type !== 'chat') {
        setRooms([]);
      } else if (type !== 'channel') {
        setChannels([]);
      }
      setSelectTab(type);
    },
    [selectTab],
  );

  const handleShare = useCallback(async () => {
    const data =
      selectTab === 'orgchart'
        ? members
        : selectTab === 'chat'
        ? rooms
        : selectTab === 'channel'
        ? channels
        : [];

    if (!data.length) {
      Alert.alert(
        getDic('Msg_ForwardingFail', '전달 실패'),
        getDic('Msg_NoTargetSelected', '선택한 대상이 없습니다.'),
      );
      return;
    }

    try {
      const resp = await makeParams({
        selectTab,
        messageData,
        shareTarget: data,
        roomList,
        userId,
      });

      let { params, status, message } = resp;
      if (!params && status !== 'SUCCESS') {
        Alert.alert(
          getDic('Msg_ForwardingFail', '전달 실패'),
          message
            ? message
            : getDic(
                'Msg_Error',
                '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
              ),
        );
        return;
      }

      params.blockList = blockUser;

      if (
        params.targetType === 'CHAT' &&
        params.roomType === 'M' &&
        params.realMemberCnt === 1
      ) {
        // sendMessage 하기 전에 RoomType이 M인데 참가자가 자기자신밖에 없는경우 상대를 먼저 초대함.
        dispatch(rematchingMember(params));
      }

      let result;
      if (messageType === 'message') {
        result = await handleMessage(params);
      } else {
        result = await handleShareFile(params);
      }
      if (result.status === 'SUCCESS') {
        Alert.alert(
          getDic('Msg_ForwardingSuccess', '전달 성공'),
          result.message,
        );
        handleClose();
      } else {
        Alert.alert(getDic('Msg_ForwardingFail', '전달 실패'), result.message);
        return;
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        getDic('Msg_ForwardingFail', '전달 실패'),
        getDic(
          'Msg_Error',
          '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
        ),
      );
      return;
    }
  }, [
    dispatch,
    selectTab,
    members,
    rooms,
    channels,
    messageData,
    messageType,
    roomList,
    userId,
    handleClose,
    blockUser,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.exitBtnView}>
          <TouchableOpacity onPress={() => handleClose()}>
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
          <Text style={styles.modaltit}>{headerName}</Text>
        </View>
        <View style={styles.okbtnView}>
          <TouchableOpacity onPress={() => handleShare()}>
            <View style={styles.topBtn}>
              <Text style={{ fontSize: sizes.default }}>{getDic('Ok')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.selectList}>
        {selectTab === 'orgchart' && (
          <FlatList
            data={members}
            keyExtractor={item => item.id}
            horizontal
            renderItem={({ item }) => {
              if (item.isShow) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      delInvite(item.id, 'orgchart');
                    }}
                  >
                    <View style={styles.selectItem}>
                      <ProfileBox
                        userId={item.id}
                        img={item.photoPath}
                        presence={item.type === 'G' ? item.presence : null}
                        isInherit={item.type === 'U'}
                        userName={item.name}
                        handleClick={false}
                      />
                      <Text
                        style={{
                          ...styles.selectTxt,
                          fontSize: 13 + sizes.inc,
                        }}
                        numberOfLines={1}
                        adjustsFontSizeToFit={Platform.OS === 'android'}
                      >
                        {getJobInfo(item)}
                      </Text>
                      <View style={styles.selectDel}>
                        <Svg width="16" height="16" viewBox="0 0 16 16">
                          <G transform="translate(-223 -91)">
                            <Circle
                              cx="8"
                              cy="8"
                              r="8"
                              transform="translate(223 91)"
                              fill="#333"
                            />
                            <G transform="translate(228.225 96.224)">
                              <Path
                                d="M128.4,133.742a.393.393,0,0,0,.279.12.382.382,0,0,0,.279-.12l2.165-2.165,2.165,2.165a.393.393,0,0,0,.279.12.382.382,0,0,0,.279-.12.4.4,0,0,0,0-.565l-2.158-2.158,2.158-2.165a.4.4,0,0,0,0-.564.4.4,0,0,0-.564,0l-2.158,2.165-2.165-2.158a.4.4,0,0,0-.564.564l2.165,2.158-2.158,2.165A.385.385,0,0,0,128.4,133.742Z"
                                transform="translate(-128.279 -128.173)"
                                fill="#fff"
                              />
                            </G>
                          </G>
                        </Svg>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }
            }}
          />
        )}
        {selectTab === 'chat' && (
          <FlatList
            data={rooms}
            keyExtractor={item => item.roomID.toString()}
            horizontal
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    delInvite(item.roomID, 'chat');
                  }}
                >
                  <View style={styles.selectItem}>
                    {((item.roomType === 'M' ||
                      item.filterMember.length === 1) &&
                      ((item.roomType === 'A' && (
                        <ProfileBox
                          userId={item.filterMember[0].id}
                          userName={item.filterMember[0].name}
                          presence={null}
                          isInherit={false}
                          img={item.filterMember[0].photoPath}
                          handleClick={false}
                        />
                      )) || (
                        <ProfileBox
                          userId={item.filterMember[0].id}
                          userName={item.filterMember[0].name}
                          presence={item.filterMember[0].presence}
                          isInherit={true}
                          img={item.filterMember[0].photoPath}
                        />
                      ))) || (
                      <RoomMemberBox
                        type="G"
                        data={item.filterMember}
                        roomID={item.roomID}
                        key={`rmb_${item.roomID}`}
                      />
                    )}

                    <Text
                      style={{
                        ...styles.selectTxt,
                        fontSize: 13 + sizes.inc,
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit={Platform.OS === 'android'}
                    >
                      {makeRoomName(item)}
                    </Text>
                    <View style={styles.selectDel}>
                      <Svg width="16" height="16" viewBox="0 0 16 16">
                        <G transform="translate(-223 -91)">
                          <Circle
                            cx="8"
                            cy="8"
                            r="8"
                            transform="translate(223 91)"
                            fill="#333"
                          />
                          <G transform="translate(228.225 96.224)">
                            <Path
                              d="M128.4,133.742a.393.393,0,0,0,.279.12.382.382,0,0,0,.279-.12l2.165-2.165,2.165,2.165a.393.393,0,0,0,.279.12.382.382,0,0,0,.279-.12.4.4,0,0,0,0-.565l-2.158-2.158,2.158-2.165a.4.4,0,0,0,0-.564.4.4,0,0,0-.564,0l-2.158,2.165-2.165-2.158a.4.4,0,0,0-.564.564l2.165,2.158-2.158,2.165A.385.385,0,0,0,128.4,133.742Z"
                              transform="translate(-128.279 -128.173)"
                              fill="#fff"
                            />
                          </G>
                        </G>
                      </Svg>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
        {selectTab === 'channel' && (
          <FlatList
            data={channels}
            keyExtractor={item => item.roomId.toString()}
            horizontal
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    delInvite(item.roomId, 'channel');
                  }}
                >
                  <View style={styles.selectItem}>
                    {item.iconPath ? (
                      <Image
                        source={{ uri: `${getServer('HOST')}${item.iconPath}` }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.profileImage,
                          styles.profileText,
                          {
                            borderRadius: 15,
                            backgroundColor: getBackgroundColor(item.roomName),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.profileImageText,
                            {
                              fontSize: 17,
                              padding: 12,
                              textAlign: 'center',
                              color: '#fff',
                            },
                          ]}
                        >
                          {(item.roomName && item.roomName[0]) || ''}
                        </Text>
                      </View>
                    )}
                    <View style={styles.content}>
                      <View style={styles.title}>
                        {item.openType === 'L' || item.openType === 'P' ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <View
                              style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5',
                                width: 22,
                                borderRadius: 20,
                                padding: 2,
                                marginRight: 5,
                              }}
                            >
                              <LockIcon color="black" width="16" height="16" />
                            </View>
                            <Text
                              style={{
                                ...styles.titleTxt,
                                fontSize: 13 + sizes.inc,
                              }}
                              numberOfLines={1}
                            >
                              {item.roomName}
                            </Text>
                          </View>
                        ) : (
                          <Text
                            style={{
                              ...styles.titleTxt,
                              fontSize: 13 + sizes.inc,
                            }}
                            numberOfLines={1}
                          >
                            {item.roomName}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.selectDel}>
                      <Svg width="16" height="16" viewBox="0 0 16 16">
                        <G transform="translate(-223 -91)">
                          <Circle
                            cx="8"
                            cy="8"
                            r="8"
                            transform="translate(223 91)"
                            fill="#333"
                          />
                          <G transform="translate(228.225 96.224)">
                            <Path
                              d="M128.4,133.742a.393.393,0,0,0,.279.12.382.382,0,0,0,.279-.12l2.165-2.165,2.165,2.165a.393.393,0,0,0,.279.12.382.382,0,0,0,.279-.12.4.4,0,0,0,0-.565l-2.158-2.158,2.158-2.165a.4.4,0,0,0,0-.564.4.4,0,0,0-.564,0l-2.158,2.165-2.165-2.158a.4.4,0,0,0-.564.564l2.165,2.158-2.158,2.165A.385.385,0,0,0,128.4,133.742Z"
                              transform="translate(-128.279 -128.173)"
                              fill="#fff"
                            />
                          </G>
                        </G>
                      </Svg>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
      <View style={styles.tab}>
        <TouchableOpacity
          onPress={() => {
            handleTabChange('orgchart');
          }}
          style={[
            styles.tabItem,
            selectTab === 'orgchart' ? styles.tabItemActive : null,
          ]}
        >
          <Text>{getDic('OrgChart')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handleTabChange('chat');
          }}
          style={[
            styles.tabItem,
            selectTab === 'chat' ? styles.tabItemActive : null,
          ]}
        >
          <Text>{getDic('Chat')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handleTabChange('channel');
          }}
          style={[
            styles.tabItem,
            selectTab === 'channel' ? styles.tabItemActive : null,
          ]}
        >
          <Text>{getDic('Channel')}</Text>
        </TouchableOpacity>
      </View>
      {selectTab === 'orgchart' && (
        <View style={styles.tabcontent}>
          <OrgChartList
            viewType="checklist"
            checkObj={orgCheckObj}
            navigation={navigation}
          />
        </View>
      )}
      {selectTab === 'chat' && (
        <View style={styles.tabcontent}>
          <ChatList checkObj={roomCheckObj} roomList={roomList} />
        </View>
      )}
      {selectTab === 'channel' && (
        <View style={styles.tabcontent}>
          <ChannelList checkObj={channelCheckObj} channelList={channelList} />
        </View>
      )}
    </View>
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
  okbtnView: { width: '20%', alignItems: 'flex-end' },
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
  colortxt: {
    fontWeight: '700',
    paddingRight: 5,
  },
  tab: {
    flexDirection: 'row',
    width: '100%',
  },
  tabItem: {
    width: '33.3%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  tabItemActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#333',
  },
  selectList: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  selectItem: {
    width: 70,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectTxt: {
    marginTop: 7,
    width: '100%',
    textAlign: 'center',
  },
  selectDel: {
    position: 'absolute',
    right: 3,
    top: 0,
  },
  tabcontent: {
    flex: 1,
  },
});
export default ShareContainer;
