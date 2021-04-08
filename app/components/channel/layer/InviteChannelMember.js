import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ProfileBox from '@C/common/ProfileBox';
import { inviteMember } from '@/modules/channel';
import ContactList from '@C/contact/ContactList';
import OrgChartList from '@C/orgchart/OrgChartList';
import { getAllUserWithGroup } from '@API/room';
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
import { getJobInfo } from '@/lib/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';

const cancelBtnImg = require('@C/assets/ico_cancelbutton.png');

const InviteChannelMember = ({ route, navigation }) => {
  const { colors, sizes } = useTheme();
  const {
    headerName,
    roomId,
    roomType,
    isNewRoom,
    oldMemberList,
    callBack,
  } = route.params;

  const { viewType, channels, selectId, myInfo } = useSelector(
    ({ channel, login }) => ({
      viewType: channel.viewType,
      channels: channel.channels,
      selectId: channel.selectId,
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
      if (roomType == 'M' || isNewRoom)
        oldMemberList.forEach(item => {
          addInviteMember({
            ...item,
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
          if (
            isNewRoom &&
            members.length > 1 &&
            (userInfo.type == 'G' || members[0].type == 'G')
          ) {
            Alert.alert(
              null,
              getDic('Msg_GroupSelectOne'),
              [
                {
                  text: getDic('Ok'),
                },
              ],
              { cancelable: true },
            );
          } else {
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

  const delInviteMember = useCallback(memberId => {
    setMembers(prevState => prevState.filter(item => item.id != memberId));
  }, []);

  const handleClose = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, []);

  const handleAddBtn = () => {
    let inviteMembers = [];

    if (members.find(item => item.isShow == true) != undefined) {
      const groupItem = members.find(item => item.type == 'G');
      if (groupItem != undefined) {
        getAllUserWithGroup(groupItem.id).then(({ data }) => {
          inviteMembers = inviteMembers.concat(data.result);
          handleAddBtnCallback(inviteMembers);
        });
      } else {
        members.forEach(item => {
          inviteMembers.push(item);
        });
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
    if (inviteMembers.length > 0) {
      const params = {
        roomId: roomId,
        // members: inviteMembers.map(item => item.id),
        members: inviteMembers,
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
              <Image source={cancelBtnImg} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.titleView}>
          <Text style={styles.modaltit}>{headerName}</Text>
        </View>
        <View style={styles.okbtnView}>
          <TouchableOpacity onPress={handleAddBtn}>
            <View style={{ ...styles.topBtn, fontSize: sizes.default }}>
              <Text
                style={{
                  ...styles.colortxt,
                  fontSize: sizes.default,
                  color: colors.primary,
                }}
              >
                {roomType == 'M' || isNewRoom
                  ? members.length - oldMembers.length
                  : members.length}
              </Text>
              <Text>{getDic('Ok')}</Text>
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
                      style={styles.selectTxt}
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
        <View
          style={[
            styles.tabItem,
            selectTab == 'C' ? styles.tabItemActive : null,
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              setSelectTab('C');
            }}
          >
            <Text>{getDic('Contact')}</Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.tabItem,
            selectTab == 'O' ? styles.tabItemActive : null,
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              setSelectTab('O');
            }}
          >
            <Text>{getDic('OrgChart')}</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 13,
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

export default InviteChannelMember;
