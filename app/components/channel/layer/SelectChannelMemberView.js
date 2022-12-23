import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ProfileBox from '@C/common/ProfileBox';
import ContactList from '@C/contact/ContactList';
import OrgChartList from '@C/orgchart/OrgChartList';
import { getAllUserWithGroup } from '@API/room';
import { getAesUtil } from '@/lib/AesUtil';
import { openChannel } from '@/modules/channel';
import LoadingWrap from '@COMMON/LoadingWrap';
import { createChannel, uploadChannelIcon } from '@/lib/api/channel';
import { moveToChannelRoom } from '@/lib/channelUtil';
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
import { getJobInfo } from '@/lib/common';
import { getDic } from '@/config';
import { withSecurityScreen } from '@/withSecurityScreen';

const cancelBtnImg = require('@C/assets/ico_cancelbutton.png');
const selectDelImg = require('@C/assets/ico_select_delete.png');

const SelectChannelMemberView = ({ route, navigation }) => {
  const {
    headerName,
    name,
    icon,
    description,
    categoryCode,
    openType,
    password,
  } = route.params;

  const { myInfo } = useSelector(({ login }) => ({
    myInfo: login.userInfo,
  }));

  const [members, setMembers] = useState([]);
  const [selectTab, setSelectTab] = useState('C');
  const [oldMembers, setOldMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    setMembers([myInfo]);
  }, []);

  const checkObj = useMemo(
    () => ({
      name: 'create_',
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
              getDic('Eumtalk'),
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

  const handleCreateNewChannelBtn = () => {
    let inviteMembers = [];

    if (members.find(item => item.isShow == true) != undefined) {
      const groupItem = members.find(item => item.type == 'G');
      if (groupItem != undefined) {
        getAllUserWithGroup(groupItem.id).then(({ data }) => {
          inviteMembers = inviteMembers.concat(data.result);
          handleCreateNewChannelCallback(inviteMembers);
        });
      } else {
        members.forEach(item => {
          inviteMembers.push(item);
        });
        handleCreateNewChannelCallback(inviteMembers);
      }
    } else {
      Alert.alert(
        getDic('Eumtalk'),
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

  // 채널 생성 핸들러
  const handleCreateNewChannelCallback = createNewMembers => {
    if (createNewMembers.length > 1) {
      setLoading(true);
      // 1. 채널 생성
      const AESUtil = getAesUtil();

      const data = {
        roomType: 'C',
        name: name,
        description: description,
        openType: openType,
        secretKey: AESUtil.encrypt(password),
        categoryCode: categoryCode.categoryCode,
        members: createNewMembers,
      };

      let invites = [];
      let targetArr = [];
      data.members.forEach(item => {
        invites.push(item.id);
        if (item.id != myInfo.id) {
          targetArr.push({
            targetCode: item.id,
            targetType: 'UR',
          });
        }
      });

      const reqData = {
        roomType: 'C',
        name: data.name,
        description: data.description,
        openType: data.openType,
        secretKey: data.secretKey,
        categoryCode: data.categoryCode,
        members: invites,
        targetArr,
      };

      createChannel(reqData)
        .then(({ data }) => {
          if (data.status === 'SUCCESS') {
            const { roomId } = data.result.room;
            if (icon) {
              const formData = new FormData();
              if (Platform.OS === 'ios') {
                formData.append('file', {
                  uri: icon.uri,
                  type: icon.type,
                  name: icon.name,
                });
              } else {
                formData.append('file', {
                  uri: icon.uri,
                  type: icon.type,
                  name: icon.name,
                });
              }
              formData.append('roomId', roomId);
              uploadChannelIcon(formData).then(({ data }) => {
                const params = { roomId };
                if (data.flag === true) {
                  params.iconPath = data.photoPath;
                }
                dispatch(openChannel(params));
                setLoading(false);
                moveToChannelRoom(navigation, 'ChannelRoom', {
                  roomID: roomId,
                });
              });
            } else {
              dispatch(openChannel({ roomId }));
              setLoading(false);
              moveToChannelRoom(navigation, 'ChannelRoom', { roomID: roomId });
            }
          } else {
            setLoading(false);
          }
        })
        .catch(error => {
          setLoading(false);
          Alert.alert(
            getDic('Eumtalk'),
            getDic('Msg_NetworkError)') + '\r\n' + error.result,
            [
              {
                text: getDic('Ok'),
              },
            ],
            { cancelable: true },
          );
        });
    }
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
          <TouchableOpacity onPress={handleCreateNewChannelBtn}>
            <View style={styles.topBtn}>
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
                      <Image source={selectDelImg} />
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
      {loading && <LoadingWrap />}
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
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectTxt: {
    width: '80%',
  },
  selectDel: {
    position: 'absolute',
    right: 5,
    top: 0,
  },
  tabcontent: {
    flex: 1,
    margin: 10,
  },
});

export default withSecurityScreen(SelectChannelMemberView);
