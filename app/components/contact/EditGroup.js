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
  Button,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { getJobInfo } from '@/lib/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';
import TitleInputBox from '@COMMON/TitleInputBox';
import { editGroupContactList, getApplyGroupInfo } from '@/lib/contactUtil';
import { modifyGroupMember, modifyCustomGroupName } from '@/modules/contact';
import { getDictionary } from '@/lib/common';
import GroupList from '@/components/contact/GroupList';
import { withSecurityScreen } from '@/withSecurityScreen';

const EditGroup = ({ route, navigation }) => {
  const { colors, sizes } = useTheme();
  const { headerName, folderID } = route.params;
  const groupInfo = useSelector(({ contact }) => {
    const groupIdx = contact.contacts.findIndex(
      contact => contact.folderType == 'R',
    );
    return contact.contacts[groupIdx].sub;
  }).find(groupInfo => groupInfo.folderID === folderID);
  const [members, setMembers] = useState([]);
  const [selectTab, setSelectTab] = useState('GM');
  const [oldMembers, setOldMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (groupInfo?.folderName) {
      setGroupName(getDictionary(groupInfo.folderName));
    }

    /* 그룹인원 0명처리 */
    if (!groupInfo.sub) {
      groupInfo.sub = [];
    }
  }, [groupInfo]);

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
              pChat: userInfo.pChat,
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

  const delInviteMember = useCallback(memberId => {
    setMembers(prevState => prevState.filter(item => item.id != memberId));
  }, []);

  const handleClose = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, []);

  const handleGroupEditBtn = useCallback(() => {
    let groupMembers = groupInfo.sub ? [...groupInfo.sub] : [];

    /* 그룹 멤버 리스트 */
    if (selectTab == 'GM') {
      groupMembers = groupMembers.filter(user => {
        let flag = true;
        members.forEach(m => {
          if (m.id == user.id) {
            flag = false;
          }
        });
        return flag;
      });
    } else {
      groupMembers = groupMembers.concat(members);
    }

    editGroupContactList(
      dispatch,
      modifyGroupMember,
      getApplyGroupInfo(
        members,
        groupName,
        groupInfo,
        selectTab == 'GM' ? 'D' : 'A',
      ),
      groupMembers,
    );

    setMembers([])
  
  },[members, groupInfo]);

  const handleModidyCustomGroupName = useCallback(() => {
    let data = {
      displayName: groupInfo.folderName
        .replace(/[^\;]/g, '')
        .replace(/[\;]/g, groupName + ';'),
      folderId: groupInfo.folderID,
    };
    dispatch(modifyCustomGroupName(data));

    Alert.alert('', getDic('Modify_Group_Name', '그룹명이 변경되었습니다.'), [
      { text: getDic('Close', '닫기'), onPress: () => {} },
    ]);

  }, [groupName, groupInfo]);

  const checkEditGroup = useCallback(() => {
    if (members && members.length > 0) {
      Alert.alert(
        '',
        getDic(
          'Msg_Not_Moving_Editing',
          '멤버 추가/제거중에는 탭을 이동 할 수 없습니다.',
        ),
        [{ text: getDic('Close', '닫기'), onPress: () => {} }],
      );
      return false;
    }
    return true;
  }, [members]);

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
      <View style={styles.groupInput}>
        <View style={styles.ginput}>
          <TitleInputBox
            title={getDic('Group_Name', '그룹 이름')}
            placeholder={getDic('Input_Group_Name', '그룹명을 입력하세요.')}
            onChageTextHandler={text => {
              setGroupName(text);
            }}
            value={groupName}
          />
        </View>
        <View style={styles.gbutton}>
          <TouchableOpacity
            onPress={() => {
              handleModidyCustomGroupName();
            }}
          >
            <Text style={styles.gbuttonText}>{'변경'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tab}>
        <TouchableOpacity
          onPress={() => {
            if (checkEditGroup()) {
              setSelectTab('GM');
            }
          }}
          style={[
            styles.tabItem,
            selectTab == 'GM' ? styles.tabItemActive : null,
          ]}
        >
          <Text>{getDic('Group_Member', '그룹 멤버')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (checkEditGroup()) {
              setSelectTab('GA');
            }
          }}
          style={[
            styles.tabItem,
            selectTab == 'GA' ? styles.tabItemActive : null,
          ]}
        >
          <Text>{getDic('Add_Group_Member', '그룹원 추가')}</Text>
        </TouchableOpacity>
      </View>
      {selectTab == 'GM' && (
        <View style={styles.tabcontent}>
          <GroupList
            group={groupInfo}
            viewType="checklist"
            checkObj={checkObj}
            navigation={navigation}
          />
        </View>
      )}
      {selectTab == 'GA' && (
        <View style={styles.tabcontent}>
          <OrgChartList
            viewType="checklist"
            checkObj={checkObj}
            group={groupInfo}
            navigation={navigation}
          />
        </View>
      )}
      {members?.length > 0 && (
        <TouchableOpacity onPress={() => handleGroupEditBtn(selectTab)}>
          <View style={styles.editButton}>
            <Text style={styles.editTextInfo}>
              {selectTab == 'GM'
                ? getDic('Remove', '제거')
                : getDic('Add', '추가')}
            </Text>
          </View>
        </TouchableOpacity>
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
  groupInput: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  ginput: {
    flex: 10,
  },
  gbutton: {
    flex: 2,
    margin: 20,
  },
  gbuttonText: {
    color: '#2bebf5',
    fontSize: 15,
  },
  editButton: {
    height: 45,
    backgroundColor: '#2bebf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editTextInfo: {
    color: 'white',
    fontSize: 25,
  },
});

export default withSecurityScreen(EditGroup);
