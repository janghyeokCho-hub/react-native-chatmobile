import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ProfileBox from '@C/common/ProfileBox';
import { inviteMember, makeRoomView, openRoom } from '@/modules/room';
import ContactList from '@C/contact/ContactList';
import OrgChartList from '@C/orgchart/OrgChartList';
import { openChatRoomView, moveToRoom } from '@/lib/roomUtil';
import {
  Alert,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { getAllUserWithGroupList } from '@/lib/api/room';
import { getJobInfo } from '@/lib/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';

const InviteMember = ({ route, navigation }) => {
  const { colors, sizes } = useTheme();
  const {
    headerName,
    roomId,
    roomType,
    isNewRoom,
    oldMemberList,
    callBack,
  } = route.params;

  const { viewType, rooms, selectId, myInfo } = useSelector(
    ({ room, login }) => ({
      viewType: room.viewType,
      rooms: room.rooms,
      selectId: room.selectId,
      myInfo: login.userInfo,
    }),
  );
  const [members, setMembers] = useState([]);
  const [selectTab, setSelectTab] = useState('C');
  const [oldMembers, setOldMembers] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (oldMemberList) {
      setOldMembers(oldMemberList);
      if (roomType == 'M' || roomType == 'O' || isNewRoom)
        oldMemberList.forEach(item => {
          addInviteMember({
            ...item,
            type: 'U',
            isShow: false,
          });
        });
    } else {
      setOldMembers([
        {
          id: myInfo.id,
          name: myInfo.name,
          presence: myInfo.presence,
          photoPath: myInfo.photoPath,
          PN: myInfo.PN,
          LN: myInfo.LN,
          TN: myInfo.TN,
          dept: myInfo.dept,
          type: 'U',
        },
      ]);
      addInviteMember({
        id: myInfo.id,
        name: myInfo.name,
        presence: myInfo.presence,
        photoPath: myInfo.photoPath,
        PN: myInfo.PN,
        LN: myInfo.LN,
        TN: myInfo.TN,
        dept: myInfo.dept,
        type: 'U',
        isShow: false,
      });
    }
  }, []);

  const checkObj = useMemo(
    () => ({
      name: 'invite_',
      onPress: (checked, userInfo) => {
        if (checked) {
          if (userInfo.pChat == 'Y') {
            addInviteMember({
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
            });
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
          delInviteMember(userInfo.id);
        }
      },
      disabledList: oldMembers,
      disabledKey: 'id',
      checkedList: [...members, ...oldMembers],
      checkedKey: 'id',
    }),
    [oldMembers, members],
  );

  const addInviteMember = useCallback(member => {
    setMembers(prevState => prevState.concat(member));
  }, []);

  const delInviteMember = useCallback(
    memberId => {
      setMembers(prevState =>
        prevState.filter(item => {
          const includesOldMembers = oldMembers.findIndex(
            om => om.id === memberId,
          );
          /** 2022.01.12
           * 기존참여자를 클릭할 경우 체크박스가 해제되지 않으면서 members에서 제외되어 로직오류 발생
           * Problem Solve: 기존 참여자를 선택할 경우 members에서 필터되지 않도록 방어로직 추가
           */
          return includesOldMembers !== -1 || item.id !== memberId;
        }),
      );
    },
    [oldMembers],
  );

  const handleClose = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, []);

  const handleAddBtn = () => {
    let inviteMembers = [];

    if (members.find(item => item.isShow == true) != undefined) {
      inviteMembers = inviteMembers.concat(
        members.filter(item => item.type == 'U'),
      );

      let dupList = [];
      const groupIds = members
        .filter(item => item.type == 'G')
        .map(item => item.id);
      if (groupIds.length > 0) {
        getAllUserWithGroupList(groupIds).then(({ data }) => {
          if (data.result && data.result.length > 0) {
            inviteMembers = inviteMembers.concat(data.result);

            inviteMembers = inviteMembers.filter(
              (item, idx) =>
                inviteMembers.findIndex(i => i.id == item.id) == idx,
            );

            if (roomType == 'G' && !isNewRoom) {
              dupList = inviteMembers.filter(
                (item, idx) =>
                  oldMemberList.find(i => i.id == item.id) !== undefined,
              );

              inviteMembers = inviteMembers.filter(
                (item, idx) =>
                  oldMemberList.find(i => i.id == item.id) == undefined,
              );
            }
          }

          if (inviteMembers.length > 0) {
            if (dupList.length > 0) {
              let dupListTxt = dupList.reduce((acc, curr) => {
                acc = acc + curr.name + '님, ';
                return acc;
              }, '');

              dupListTxt = dupListTxt.substring(0, dupListTxt.length - 2);

              Alert.alert(
                null,
                dupListTxt + '은 이미 추가된 사용자이므로 제외하고 진행합니다.',
                [
                  {
                    text: getDic('Ok'),
                    onPress: () => {
                      handleAddBtnCallback(inviteMembers);
                    },
                  },
                ],
                { cancelable: true },
              );
            } else {
              handleAddBtnCallback(inviteMembers);
            }
          } else
            Alert.alert(null, getDic('Msg_ExceptExistEmpty'), [
              {
                text: getDic('Ok'),
                onPress: () => {
                  handleClose();
                },
              },
            ]);
        });
      } else {
        handleAddBtnCallback(inviteMembers);
      }
    } else {
      Alert.alert(
        null,
        getDic('Msg_InviteMemberError'),
        [
          {
            text: getDic('Ok'),
          },
        ],
        { cancelable: true },
      );
    }
  };

  const handleAddBtnCallback = inviteMembers => {
    if (
      roomType == 'M' ||
      roomType == 'O' ||
      (isNewRoom && inviteMembers.length > 2)
    ) {
      const makeInfo = {
        roomName: '',
        roomType: 'G',
        members: inviteMembers,
        memberType: 'G',
      };

      const makeData = {
        newRoom: true,
        makeInfo: makeInfo,
      };

      dispatch(openRoom(makeData));
      dispatch(makeRoomView(makeInfo));

      moveToRoom(navigation, 'MakeRoom', { makeData: makeData });
    } else if (isNewRoom && inviteMembers.length == 2) {
      openChatRoomView(
        dispatch,
        viewType,
        rooms,
        selectId,
        inviteMembers.find(item => item.id != myInfo.id),
        myInfo,
        navigation,
      );
    } else {
      const params = {
        roomID: roomId,
        members: inviteMembers.map(item => item.id),
      };
      dispatch(inviteMember(params));
      handleClose();
    }

    if (callBack) callBack();
  };

  return (
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
          <Text style={styles.modaltit}>{headerName}</Text>
        </View>
        <View style={styles.okbtnView}>
          <TouchableOpacity onPress={handleAddBtn}>
            <View style={styles.topBtn}>
              <Text
                style={{
                  ...styles.colortxt,
                  color: colors.primary,
                  fontSize: sizes.default,
                }}
              >
                {roomType == 'M' || isNewRoom
                  ? members.length - oldMembers.length
                  : members.length}
              </Text>
              <Text style={{ fontSize: sizes.default }}>{getDic('Ok')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.selectList}>
        <FlatList
          data={members}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            if (item.isShow) {
              return (
                <TouchableOpacity
                  onPress={() => {
                    delInviteMember(item.id);
                  }}
                >
                  <View style={styles.selectItem}>
                    <ProfileBox
                      userId={item.id}
                      img={item.photoPath}
                      presence={item.type == 'G' ? item.presence : null}
                      isInherit={item.type == 'U'}
                      userName={item.name}
                      handleClick={false}
                    />
                    <Text
                      style={{ ...styles.selectTxt, fontSize: 13 + sizes.inc }}
                      numberOfLines={1}
                      adjustsFontSizeToFit={Platform.OS == 'android'}
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
          horizontal
        />
      </View>
      <View style={styles.tab}>
        <TouchableOpacity
          onPress={() => {
            setSelectTab('C');
          }}
          style={[
            styles.tabItem,
            selectTab == 'C' ? styles.tabItemActive : null,
          ]}
        >
          <Text>{getDic('Contact')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelectTab('O');
          }}
          style={[
            styles.tabItem,
            selectTab == 'O' ? styles.tabItemActive : null,
          ]}
        >
          <Text>{getDic('OrgChart')}</Text>
        </TouchableOpacity>
      </View>
      {selectTab == 'C' && (
        <View style={styles.tabcontent}>
          <ContactList
            viewType="checklist"
            checkObj={checkObj}
            navigation={navigation}
          />
        </View>
      )}
      {selectTab == 'O' && (
        <View style={styles.tabcontent}>
          <OrgChartList
            viewType="checklist"
            checkObj={checkObj}
            navigation={navigation}
          />
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
    width: '50%',
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

export default InviteMember;
