import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { CommonActions } from '@react-navigation/native';
import OrgChartList from '../orgchart/OrgChartList';
import ProfileBox from '../common/ProfileBox';
import {
  addContactList,
  editGroupContactList,
  getApplyGroupInfo,
} from '@/lib/contactUtil';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { getJobInfo } from '@/lib/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';
import TitleInputBox from '@COMMON/TitleInputBox';
import { addCustomGroup } from '@/modules/contact';
import { withSecurityScreen } from '@/withSecurityScreen';

const AddContact = ({ navigation, route }) => {
  const { colors, sizes } = useTheme();
  const { userID, contacts } = useSelector(({ login, contact }) => ({
    userID: login.id,
    contacts: contact.contacts,
  }));

  const [selectors, setSelectors] = useState([]);
  const [groupName, setGroupName] = useState('');
  const useGroup = route.params.useGroup;
  const dispatch = useDispatch();

  let oldContactList = [{ id: userID }];

  if (!useGroup) {
    contacts.forEach(item => {
      if ((item.folderType == 'F' || item.folderType == 'C') && item.sub) {
        item.sub.forEach(itemSub => {
          oldContactList.push(itemSub);
        });
      } else if (item.folderType == 'G' || item.folderType == 'M') {
        oldContactList.push({ id: item.groupCode });
      }
    });
  }

  const addContact = selector => {
    setSelectors(prevState => prevState.concat(selector));
  };

  const delContact = selectorId => {
    setSelectors(prevState => prevState.filter(item => item.id != selectorId));
  };

  const checkObj = useMemo(
    () => ({
      name: 'addcontact_',
      onPress: (checked, userInfo) => {
        if (checked) {
          addContact(userInfo);
        } else {
          delContact(userInfo.id);
        }
      },
      disabledList: oldContactList,
      disabledKey: 'id',
      checkedList: [...selectors, ...oldContactList],
      checkedKey: 'id',
    }),
    [selectors, oldContactList],
  );

  const handleClose = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, []);

  const handleAddBtn = useCallback(() => {
    let paramList = [];

    selectors.forEach(item => {
      paramList.push({
        targetId: item.id,
        targetType: item.type,
        presence: item.presence,
        companyCode: item.companyCode,
        folderType: item.type == 'G' ? 'G' : 'C',
        userInfo: item,
      });
    });

    addContactList(dispatch, paramList);
    handleClose();
  }, [selectors]);

  const handleAddGroupBtn = useCallback(() => {
    /* 그룹명 미 입력시 Alert Msg*/
    if (groupName === '') {
      Alert.alert(
        '',
        getDic('Please_Input_GroupName', '그룹명을 입력해주세요.'),
        [{ text: getDic('Close', '닫기'), onPress: () => {} }],
      );
      return;
    }

    /* 그룹 생성 */
    editGroupContactList(
      dispatch,
      addCustomGroup,
      getApplyGroupInfo(selectors, groupName),
      selectors,
    );

    handleClose();
  }, [groupName, selectors]);

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
          <Text style={styles.modaltit}>
            {useGroup
              ? getDic('Create_Group', '그룹 생성')
              : getDic('AddContact')}
          </Text>
        </View>
        <View style={styles.okbtnView}>
          <TouchableOpacity
            onPress={useGroup ? handleAddGroupBtn : handleAddBtn}
          >
            <View style={styles.topBtn}>
              <Text
                style={{
                  ...styles.colortxt,
                  color: colors.primary,
                  fontSize: sizes.default,
                }}
              >
                {selectors.length}
              </Text>
              <Text style={{ fontSize: sizes.default }}>{getDic('Ok')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.selectList}>
        <FlatList
          data={selectors}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  delContact(item.id);
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
          }}
          horizontal
        />
      </View>
      {useGroup ? (
        <View>
          <TitleInputBox
            title={getDic('Group_Name', '그룹 이름')}
            placeholder={getDic('Input_Group_Name', '그룹명을 입력하세요.')}
            onChageTextHandler={text => {
              setGroupName(text);
            }}
            value={groupName}
          />
        </View>
      ) : null}
      <View style={styles.tabcontent}>
        <OrgChartList
          viewType="checklist"
          checkObj={checkObj}
          navigation={navigation}
        />
      </View>
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

export default withSecurityScreen(AddContact);
