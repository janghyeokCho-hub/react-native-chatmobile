import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ProfileBox from './ProfileBox';
import ToggleButton from './buttons/ToggleButton';
import { changeModal, openModal } from '@/modules/modal';
import { useDispatch, useSelector } from 'react-redux';
import { addContact, addFavorite } from '@/lib/contactUtil';
import { getContactList } from '@/lib/api/contact';
import { openChatRoomView } from '@/lib/roomUtil';
import Svg, { G, Path, Rect, Circle } from 'react-native-svg';
import { getJobInfo, getDictionary } from '@/lib/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';

const UserInfoBox = ({
  userInfo,
  isInherit,
  onPress,
  onLongPress,
  checkObj,
  disableMessage,
  navigation,
}) => {
  const { colors, sizes } = useTheme();
  const contacts = useSelector(({ contact }) => contact.contacts);
  const viewType = useSelector(({ room }) => room.viewType);
  const rooms = useSelector(({ room }) => room.rooms);
  const selectId = useSelector(({ room }) => room.selectId);
  const myInfo = useSelector(({ login }) => login.userInfo);
  const absenceInfo = useSelector(({ absence }) => absence.absence);

  const [myAbsence, setMyAbsence] = useState({});

  const isLong = text => {
    let tempText = text.length > 16 ? `${text.substr(0, 15)}..` : text;
    return tempText;
  };

  const getDeptName = useCallback(() => {
    let jobjParsedDept = '';
    try {
      jobjParsedDept = JSON.parse(userInfo.dept);
    } catch (e) {
      return getDictionary(userInfo.dept);
    }
    if (Array.isArray(jobjParsedDept)) {
      let arrDeptDics = [];
      jobjParsedDept.forEach(item => {
        if (item == null) {
          return false;
        }
        arrDeptDics.push(getDictionary(item));
      });
      return arrDeptDics.join('/');
    }
    return getDictionary(userInfo.dept);
  }, [userInfo]);

  useEffect(() => {
    if (absenceInfo.length > 0)
      absenceInfo.forEach(targetAbsence => {
        const absenceInfo = JSON.parse(targetAbsence);
        if (absenceInfo.id === userInfo.id) {
          setMyAbsence(absenceInfo);
        }
      });
  }, [absenceInfo]);

  const dispatch = useDispatch();

  const drawUserInfoBox = () => {
    if (userInfo.type == 'G') {
      return (
        <>
          <View style={styles.profileImage}>
            <Svg width="25.983" height="25.184" viewBox="0 0 19.983 18.184">
              <G transform="translate(3651 -1491)">
                <Path
                  d="M20.983,18.886a1.8,1.8,0,0,1-1.8,1.8H4.8a1.8,1.8,0,0,1-1.8-1.8V6.3A1.8,1.8,0,0,1,4.8,4.5h4.5l1.8,2.7h8.092a1.8,1.8,0,0,1,1.8,1.8Z"
                  transform="translate(-3653 1487.5)"
                  fill="none"
                  stroke="#979797"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
                <G transform="translate(-3647.003 1499.467)">
                  <Path
                    d="M14.331,10.495A1.481,1.481,0,1,1,12.85,9.014,1.481,1.481,0,0,1,14.331,10.495Zm-3.163,4.39a.686.686,0,0,1-.686-.686v-.387a1.5,1.5,0,0,1,1.506-1.495h1.725a1.5,1.5,0,0,1,1.5,1.495V14.2a.686.686,0,0,1-.686.686Z"
                    transform="translate(-10.482 -9.014)"
                    fill={colors.primary}
                  />
                </G>
              </G>
            </Svg>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{getDictionary(userInfo.name)}</Text>
            <Text style={styles.subtitle}>{getDeptName()}</Text>
          </View>
        </>
      );
    } else {
      return (
        <>
          <ProfileBox
            userId={userInfo.id}
            img={userInfo.photoPath}
            userName={getDictionary(userInfo.name)}
            presence={userInfo.presence}
            isInherit={isInherit}
          />
          <View
            style={{
              ...styles.titleContainer,
            }}
          >
            <View style={styles.titleView}>
              <Text style={{ ...styles.title, fontSize: sizes.default }}>
                {/* {getJobInfo(userInfo)} */}
                {isLong(getJobInfo(userInfo))}
              </Text>
              {userInfo.isMobile === 'Y' && (
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
            <Text
              style={{
                ...styles.subtitle,
                fontSize: sizes.default,
              }}
            >
              {isLong(getDeptName())}
            </Text>
          </View>
          {!disableMessage && userInfo.work && userInfo.work.length > 0 ? (
            <View
              style={[
                myAbsence.id
                  ? styles.rightMessageAbsenceBox
                  : styles.rightMessageBox,
                { maxWidth: wp('55') - 80 },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  adjustsFontSizeToFit={Platform.OS == 'android'}
                  // style={{ ...styles.rightMessage, fontSize: 13 + sizes.inc }}
                  style={{
                    ...styles.rightMessage,
                    fontSize: 13 + sizes.inc,
                  }}
                  numberOfLines={1}
                >
                  {isLong(userInfo.work)}
                  {/* {userInfo.work} */}
                </Text>
                {myAbsence.id && <View style={styles.absenceDot} />}
              </View>
            </View>
          ) : (
            myAbsence.code && (
              <View style={styles.rightMessageAbsenceBox}>
                <Text
                  adjustsFontSizeToFit={Platform.OS == 'android'}
                  style={{
                    ...styles.rightAbsenceMessage,
                    fontSize: 13 + sizes.inc,
                  }}
                  numberOfLines={1}
                >
                  {getDic('Ab_' + myAbsence.code)}
                </Text>
              </View>
            )
          )}
        </>
      );
    }
  };

  const handlePress = () => {
    if (userInfo.type == 'G') {
      handleLongPress();
    } else {
      navigation.navigate('ProfilePopup', {
        targetID: userInfo.id,
      });
    }
  };

  const handleLongPress = useCallback(() => {
    let buttons = [];

    if (myInfo.id != userInfo.id) {
      if (userInfo.type == 'U') {
        const favoriteList = contacts.find(item => item.folderType == 'F').sub;
        const contactList = contacts.find(item => item.folderType == 'C').sub;
        let orgType = '';

        if (
          !favoriteList ||
          favoriteList.find(item => item.id == userInfo.id) === undefined
        ) {
          if (
            !contactList ||
            contactList.find(item => item.id == userInfo.id) === undefined
          ) {
            buttons.push({
              code: 'addContact',
              title: getDic('AddContact'),
              onPress: () => {
                addContact(dispatch, userInfo);
              },
            });
          } else {
            orgType = 'C';
          }
          buttons.push({
            code: 'addFavorite',
            title: getDic('AddFavorite'),
            onPress: () => {
              addFavorite(dispatch, userInfo, orgType);
            },
          });
        }
      } else {
        if (
          contacts.find(item => item.groupCode == userInfo.id) === undefined
        ) {
          buttons.push({
            code: 'addContact',
            title: getDic('AddContact'),
            onPress: () => {
              addContact(dispatch, userInfo);
            },
          });
        }
      }

      buttons.push({
        code: 'startChat',
        title: getDic('StartChat'),
        onPress: () => {
          if (userInfo.pChat == 'Y')
            openChatRoomView(
              dispatch,
              viewType,
              rooms,
              selectId,
              userInfo,
              myInfo,
              navigation,
            );
          else
            Alert.alert(
              null,
              getDic('Msg_GroupInviteError'),
              [{ text: getDic('Ok') }],
              { cancelable: true },
            );
        },
      });
    } else {
      buttons.push({
        code: 'startChat',
        title: getDic('StartChat'),
        onPress: () => {
          if (userInfo.pChat == 'Y')
            openChatRoomView(
              dispatch,
              viewType,
              rooms,
              selectId,
              userInfo,
              myInfo,
              navigation,
            );
          else
            Alert.alert(
              null,
              getDic('Msg_GroupInviteError'),
              [{ text: getDic('Ok') }],
              { cancelable: true },
            );
        },
      });
    }

    if (buttons.length > 0) {
      dispatch(
        changeModal({
          modalData: {
            closeOnTouchOutside: true,
            type: 'normal',
            buttonList: buttons,
          },
        }),
      );
      dispatch(openModal());
    }
  }, [contacts, rooms]);

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          // userInfo.type == 'G' --> 그룹은 클릭 시 목록 추가 x, depth만 들어감
          checkObj &&
            userInfo.type != 'G' &&
            checkObj.onPress(
              !checkObj.checkedList.find(
                item =>
                  item[checkObj.checkedKey] === userInfo[checkObj.checkedKey],
              ),
              userInfo,
            );
          if (onPress == undefined) handlePress();
          else if (onPress) onPress();
        }}
        onLongPress={() => {
          if (onLongPress == undefined) handleLongPress();
          else if (onLongPress) onLongPress();
        }}
      >
        <View style={styles.container}>
          {drawUserInfoBox()}
          {checkObj && (
            <ToggleButton
              data={userInfo}
              checked={
                checkObj.checkedList.find(
                  item =>
                    item[checkObj.checkedKey] === userInfo[checkObj.checkedKey],
                ) != undefined
              }
              onPress={checkObj.onPress}
              disabled={
                checkObj.disabledList.find(
                  item =>
                    item[checkObj.disabledKey] ===
                    userInfo[checkObj.disabledKey],
                ) != undefined
              }
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const rem = wp('100%') / 375;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
    marginLeft: 15,
    // backgroundColor: 'green',
    maxWidth: wp('100%') - 95,
  },
  titleView: { flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '500' },
  subtitle: {
    color: '#999',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightMessage: {
    color: '#666',
  },
  rightMessageBox: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    marginLeft: 'auto',
    borderWidth: 0.5,
    borderColor: '#BFBFBF',
    // backgroundColor: 'blue',
    maxWidth: wp('100%') - 95,
    borderRadius: 15,
    overflow: 'hidden',
  },
  rightAbsenceMessage: {
    color: '#ff2000',
  },
  rightMessageAbsenceBox: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    marginLeft: 'auto',
    borderWidth: 0.5,
    borderColor: '#ff4000',
    maxWidth: wp('100%') - 95,
    borderRadius: 15,
  },
  absenceDot: {
    width: 10,
    height: 10,
    borderRadius: 50,
    marginLeft: 5,
    borderWidth: 1.5,
    borderColor: '#ff2000',
  },
});

export default React.memo(UserInfoBox);
