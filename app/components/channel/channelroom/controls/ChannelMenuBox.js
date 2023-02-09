import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import UserInfoBox from '@/components/common/UserInfoBox';
import { CommonActions } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { leaveChannelUtil } from '@/lib/channelUtil';
import { getBottomPadding } from '@/lib/device/common';
import MenuIcon from '@C/common/icons/MenuIcon';
import { openModal, changeModal } from '@/modules/modal';
import { modifyChannelMemberAuth, leaveChannel } from '@/modules/channel';
import MenuBoxBack from './MenuBoxBack';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { getConfig, getDic } from '@/config';
import { useTheme } from '@react-navigation/native';
import { getRoomNotification, modifyRoomNotification } from '@/lib/api/setting';

const ico_plus = require('@C/assets/ico_plus.png');

const ChannelMenuBox = ({ title, roomInfo, handleClose, navigation }) => {
  const { sizes, colors } = useTheme();
  const { id } = useSelector(({ login }) => ({
    id: login.id,
  }));
  const enabledExtUser = getConfig('EnabledExtUser', 'N');
  const useBookmark = getConfig('UseBookmark', 'N') === 'Y';
  const [channelAuth, setChannelAuth] = useState(false);
  const [channelAdminMembers, setChannelAdminMembers] = useState(false);
  const [notification, setNotification] = useState(true);
  const shareDocConfig = getConfig('ShareDoc');
  const useShareDoc = shareDocConfig?.use === 'Y';

  const initRoomNoti = async () => {
    try {
      const params = { pushID: await messaging().getToken() };
      const result = await getRoomNotification(roomInfo.roomId, params);
      if (result?.data?.status === 'SUCCESS') {
        setNotification(result?.data?.result);
      }
    } catch (err) {
      console.error('initRoomNoti Error: '.err);
    }
  };

  useEffect(() => {
    if (roomInfo && roomInfo.members) {
      // Get notification flag
      initRoomNoti();
      const tempAdmin = [];
      roomInfo.members.forEach(item => {
        if (item.channelAuth == 'Y') {
          tempAdmin.push(item);
          if (item.id == id) {
            setChannelAuth(true);
          }
        }
      });
      setChannelAdminMembers(tempAdmin);
    }
  }, [roomInfo, id]);

  const dispatch = useDispatch();

  const handleInvite = () => {
    navigation.navigate('InviteChannelMember', {
      headerName: getDic('AddChatMembers'),
      roomId: roomInfo.roomId,
      roomType: roomInfo.roomType,
      isNewRoom: false,
      oldMemberList: roomInfo.members,
      callBack: handleClose,
    });
  };

  const handleExtUsrInvite = () => {
    navigation.navigate('InviteExtUser', {
      headerName: getDic('InviteExtUser'),
      roomId: roomInfo.roomId,
    });
  };

  const handleLeaveRoom = () => {
    if (channelAdminMembers.length === 1 && channelAuth) {
      Alert.alert(
        null,
        getDic('Msg_DelChannelAdmin'),
        [
          {
            text: getDic('Ok'),
          },
        ],
        { cancelable: true },
      );
    } else {
      handleClose();
      leaveChannelUtil(dispatch, roomInfo, id, () => {
        navigation.dispatch(CommonActions.goBack());
      });
    }
  };

  const handlePhotoSummary = () => {
    handleClose();
    navigation.navigate('PhotoSummary', {
      roomID: roomInfo.roomId,
    });
  };

  const handleFileSummary = () => {
    handleClose();
    navigation.navigate('FileSummary', {
      roomID: roomInfo.roomId,
    });
  };

  const handleBookmarkSummary = () => {
    handleClose();
    navigation.navigate('BookmarkSummary', {
      roomID: roomInfo.roomId,
    });
  };

  const handleDocSummary = () => {
    handleClose();
    navigation.navigate('DocSummary', {
      room: roomInfo,
    });
  };

  const handleLeaveChannelByAdmin = member => {
    Alert.alert(
      null,
      getDic('Msg_DeportUser'),
      [
        {
          text: getDic('Deport'),
          onPress: () => {
            dispatch(
              leaveChannel({
                roomId: roomInfo.roomId,
                userId: member.id,
                roomType: 'C',
                leave: 'Y',
              }),
            );
          },
        },
        {
          text: getDic('Cancel'),
          onPress: () => {},
        },
      ],
      { cancelable: true },
    );
  };

  const handleMemberManagement = member => {
    const modalBtn = [
      {
        title: getDic('SelectAdmin'),
        onPress: () => {
          dispatch(
            modifyChannelMemberAuth({
              roomId: roomInfo.roomId,
              auth: 'Y',
              members: [member.id],
            }),
          );
        },
      },
      {
        title: getDic('Deport'),
        onPress: () => {
          handleLeaveChannelByAdmin(member);
        },
      },
    ];
    dispatch(
      changeModal({
        modalData: {
          closeOnTouchOutside: true,
          type: 'normal',
          buttonList: modalBtn,
        },
      }),
    );
    dispatch(openModal());
  };

  const handleAuthMemberManagement = member => {
    const modalBtn = [
      {
        title: getDic('GeneralDemotion'),
        onPress: () => {
          dispatch(
            modifyChannelMemberAuth({
              roomId: roomInfo.roomId,
              auth: 'N',
              members: [member.id],
            }),
          );
        },
      },
      {
        title: getDic('Deport'),
        onPress: () => {
          handleLeaveChannelByAdmin(member);
        },
      },
    ];
    dispatch(
      changeModal({
        modalData: {
          closeOnTouchOutside: true,
          type: 'normal',
          buttonList: modalBtn,
        },
      }),
    );
    dispatch(openModal());
  };

  const handleShowDetailChannelInfo = info => {
    // dispatch(
    //   changeModal({
    //     modalData: {
    //       closeOnTouchOutside: true,
    //       type: 'channelInfo',
    //       channelMenuInfo: info,
    //     },
    //   }),
    // );
    // dispatch(openModal());
    handleClose();
    navigation.navigate('ChannelInfo', {
      channelInfo: info,
    });
  };

  const handleChangeChannelInfo = info => {
    // dispatch(
    //   changeModal({
    //     modalData: {
    //       closeOnTouchOutside: true,
    //       type: 'channelChangeInfo',
    //       channelMenuInfo: info,
    //     },
    //   }),
    // );
    // dispatch(openModal());
    handleClose();
    navigation.navigate('ChangeChannelInfo', {
      channelInfo: info,
    });
  };

  const handleRoomOption = useCallback(() => {
    handleClose();
    navigation.navigate('ChatSettingBox', {
      info: roomInfo,
      isChannel: true,
    });
  }, [roomInfo]);

  const handleNotification = useCallback(async () => {
    const tempValue = !notification;
    setNotification(tempValue);
    try {
      const params = {
        pushID: await messaging().getToken(),
        value: tempValue,
      };

      await modifyRoomNotification(roomInfo.roomId, params);
    } catch (err) {
      // revoke state on error
      setNotification(notification);
      console.error('Handle Notification Err: ', err);
    }
  }, [roomInfo, notification]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.titleBox}>
          <Text style={{ ...styles.title, fontSize: sizes.large }}>
            {title}
          </Text>
        </View>
        {roomInfo && (
          <TouchableOpacity
            onPress={() => {
              handleShowDetailChannelInfo(roomInfo);
            }}
          >
            <View
              style={[
                styles.menuBox,
                { borderTopColor: '#D5D5D5', borderTopWidth: 0.5 },
              ]}
            >
              <Svg width="13.5" height="13.519" viewBox="0 0 13.5 13.519">
                <G transform="translate(0 0)">
                  <Path
                    d="M8.795.155.524,8.426a.571.571,0,0,0-.16.365L.3,13a.5.5,0,0,0,.16.374.532.532,0,0,0,.374.142H.844l4.087-.036a.517.517,0,0,0,.374-.142L13.647,5a.543.543,0,0,0,0-.757l-4.1-4.1A.552.552,0,0,0,8.795.155ZM4.7,12.433l-3.321.045.053-3.455L6.952,3.5l3.339,3.339Zm6.339-6.339L7.709,2.755,9.178,1.286l3.33,3.339Z"
                    transform="translate(-0.301 0)"
                    fill="#222"
                  />
                </G>
              </Svg>
              <Text style={{ ...styles.menuLabel, fontSize: sizes.default }}>
                {getDic('ShowChannelInfo')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        {channelAuth && roomInfo && (
          <TouchableOpacity
            onPress={() => {
              handleChangeChannelInfo(roomInfo);
            }}
          >
            <View
              style={[
                styles.menuBox,
                { borderTopColor: '#D5D5D5', borderTopWidth: 0.5 },
              ]}
            >
              <Svg width="13.5" height="13.519" viewBox="0 0 13.5 13.519">
                <G transform="translate(0 0)">
                  <Path
                    d="M8.795.155.524,8.426a.571.571,0,0,0-.16.365L.3,13a.5.5,0,0,0,.16.374.532.532,0,0,0,.374.142H.844l4.087-.036a.517.517,0,0,0,.374-.142L13.647,5a.543.543,0,0,0,0-.757l-4.1-4.1A.552.552,0,0,0,8.795.155ZM4.7,12.433l-3.321.045.053-3.455L6.952,3.5l3.339,3.339Zm6.339-6.339L7.709,2.755,9.178,1.286l3.33,3.339Z"
                    transform="translate(-0.301 0)"
                    fill="#222"
                  />
                </G>
              </Svg>
              <Text style={{ ...styles.menuLabel, fontSize: sizes.default }}>
                {getDic('ModChannelInfo')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        {roomInfo && roomInfo.roomType != 'A' && (
          <>
            <TouchableOpacity onPress={handlePhotoSummary}>
              <View style={styles.menuBox}>
                <Svg width="13.929" height="11.721" viewBox="0 0 13.929 11.721">
                  <Path
                    d="M13.929,37.343a.511.511,0,0,0-.51-.51H.51a.511.511,0,0,0-.51.51v10.7a.511.511,0,0,0,.51.51H13.42a.511.511,0,0,0,.51-.51Zm-1.019.51v6.523l-2.99-2.1a.5.5,0,0,0-.637.051L7.729,43.823,4.5,40.706a.506.506,0,0,0-.756.051L1.028,44.248v-6.4ZM1.019,47.535V45.9L4.2,41.836,7.372,44.9a.513.513,0,0,0,.7,0l1.6-1.546,3.236,2.268v1.911Z"
                    transform="translate(0 -36.833)"
                    fill="#222"
                  />
                  <Path
                    d="M242.1,136.27a.985.985,0,1,0-.985-.985A.986.986,0,0,0,242.1,136.27Z"
                    transform="translate(-233.888 -131.378)"
                    fill="#222"
                  />
                </Svg>
                <Text style={{ ...styles.menuLabel, fontSize: sizes.default }}>
                  {getDic('PhotoSummary')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFileSummary}>
              <View style={styles.menuBox}>
                <Svg width="13.057" height="14.54" viewBox="0 0 13.057 14.54">
                  <G transform="translate(0 0)">
                    <Path
                      d="M33.653,4.341a.518.518,0,0,0-.733-.733L27.5,9.031a1.664,1.664,0,0,0,2.353,2.353L35.532,5.7a.809.809,0,0,0,.155-.1c.759-.759,2.776-2.776.836-4.715A2.694,2.694,0,0,0,33.955.066,4.928,4.928,0,0,0,31.6,1.514L25.446,7.669a3.786,3.786,0,0,0-1.078,2.862,4.281,4.281,0,0,0,1.216,2.828,4.12,4.12,0,0,0,2.8,1.181h.086A3.823,3.823,0,0,0,31.2,13.428l6.069-6.069a.518.518,0,0,0-.733-.733l-6.069,6.069a2.841,2.841,0,0,1-2.069.81,3.064,3.064,0,0,1-2.224-5.1l6.155-6.155A4.005,4.005,0,0,1,34.17,1.083a1.662,1.662,0,0,1,1.621.543A1.345,1.345,0,0,1,36.239,3.1a3.805,3.805,0,0,1-.862,1.336,1.078,1.078,0,0,0-.1.078L29.127,10.66a.628.628,0,0,1-.888-.888Z"
                      transform="translate(-24.365 0)"
                      fill="#222"
                    />
                  </G>
                </Svg>
                <Text style={{ ...styles.menuLabel, fontSize: sizes.default }}>
                  {getDic('FileSummary')}
                </Text>
              </View>
            </TouchableOpacity>
            {useBookmark && (
              <TouchableOpacity onPress={handleBookmarkSummary}>
                <View style={styles.menuBox}>
                  <Svg
                    width="15px"
                    height="15px"
                    viewBox="-4.74 0 29.588 29.588"
                    id="_17_-_Add_Bookmark"
                    data-name="17 - Add Bookmark"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <Path
                      id="Path_196"
                      data-name="Path 196"
                      d="M26.059,4a3,3,0,0,0-3-3H8.941a3,3,0,0,0-3,3V27.588a3,3,0,0,0,4.628,2.52L16,26.6l5.431,3.509a3,3,0,0,0,4.628-2.52Zm-2,0V27.588a1,1,0,0,1-1.543.84l-5.973-3.859a1,1,0,0,0-1.086,0L9.484,28.428a1,1,0,0,1-1.543-.84V4a1,1,0,0,1,1-1H23.059a1,1,0,0,1,1,1Z"
                      transform="translate(-5.941 -1)"
                      fillRule="evenodd"
                      fill="#222"
                    />
                    <Path
                      id="Path_197"
                      data-name="Path 197"
                      d="M14.6,6.578v5.4a1,1,0,1,0,2,0V6.578a1,1,0,0,0-2,0Z"
                      transform="translate(-5.941 -1)"
                      fillRule="evenodd"
                      fill="#222"
                    />
                    <Path
                      id="Path_198"
                      data-name="Path 198"
                      d="M18.3,8.28H12.9a1,1,0,0,0,0,2H18.3a1,1,0,0,0,0-2Z"
                      transform="translate(-5.941 -1)"
                      fillRule="evenodd"
                      fill="#222"
                    />
                  </Svg>
                  <Text
                    style={{ ...styles.menuLabel, fontSize: sizes.default }}
                  >
                    {getDic('BookmarkSummary', '책갈피 모아보기')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {useShareDoc && (
              <TouchableOpacity onPress={handleDocSummary}>
                <View style={styles.menuBox}>
                  <Svg width="16" height="14" viewBox="0 0 23.115 23.532">
                    <G data-name="\uADF8\uB8F9 615" fill="#000">
                      <G data-name="\uADF8\uB8F9 584">
                        <Path
                          data-name="\uD0C0\uC6D0 728"
                          d="M2.606-.7A3.306 3.306 0 11-.7 2.606 3.31 3.31 0 012.606-.7zm0 5.213A1.906 1.906 0 10.7 2.606a1.909 1.909 0 001.906 1.907z"
                          transform="translate(9967.3 -3597.759) translate(-9963.135 3608.028) translate(7.043 1)"
                        />
                        <Path
                          data-name="\uD328\uC2A4 2913"
                          d="M10.476 21.668H6a.7.7 0 01-.7-.7V19.1a4.8 4.8 0 018.1-3.493.7.7 0 01-.961 1.018A3.4 3.4 0 006.7 19.1v1.165h3.776a.7.7 0 110 1.4z"
                          transform="translate(9967.3 -3597.759) translate(-9963.135 3608.028) translate(0 -8.778)"
                        />
                        <Path
                          data-name="\uD328\uC2A4 2914"
                          d="M25.442 13.458a.7.7 0 01.495.205l2.213 2.213a.7.7 0 010 .99l-4.434 4.442a.7.7 0 01-.5.205H21a.7.7 0 01-.7-.7v-2.221a.7.7 0 01.205-.5l4.442-4.434a.7.7 0 01.495-.2zm1.224 2.914l-1.224-1.224-3.742 3.734v1.231h1.231z"
                          transform="translate(9967.3 -3597.759) translate(-9963.135 3608.028) translate(-9.405 -8.25)"
                        />
                      </G>
                      <Path
                        data-name="\uD328\uC2A4 2915"
                        d="M.953 21.452V1.43A.477.477 0 011.43.953h11.918v2.384a1.43 1.43 0 001.43 1.43h2.384V10.2h.953V4.29a.476.476 0 00-.138-.338L14.163.138A.476.476 0 0013.825 0H1.43A1.43 1.43 0 000 1.43v20.022a1.43 1.43 0 001.43 1.43H7.1v-.953H1.43a.477.477 0 01-.477-.477zM14.3 1.626l2.19 2.188h-1.712a.477.477 0 01-.477-.477z"
                        transform="translate(9967.3 -3597.759) translate(-9967 3598.059)"
                      />
                      <Path
                        data-name="\uD328\uC2A4 2915 - \uC724\uACFD\uC120"
                        d="M7.4 23.182H1.43a1.732 1.732 0 01-1.73-1.73V1.43A1.732 1.732 0 011.43-.3h12.395a.774.774 0 01.549.225l3.815 3.815a.772.772 0 01.226.553v6.2h-1.553V5.067h-2.084a1.732 1.732 0 01-1.73-1.73V1.253H1.43a.177.177 0 00-.177.177v20.022a.177.177 0 00.177.177H7.4zM13.828.3H1.43A1.131 1.131 0 00.3 1.43v20.022a1.131 1.131 0 001.13 1.13H6.8v-.353H1.43a.778.778 0 01-.777-.777V1.43A.778.778 0 011.43.653h12.218v2.684a1.131 1.131 0 001.13 1.13h2.684V9.9h.353V4.29a.177.177 0 00-.052-.127L13.951.35a.175.175 0 00-.123-.05zm3.386 3.814h-2.436A.778.778 0 0114 3.337V.9zM14.6 2.35v.987a.177.177 0 00.177.177h.987z"
                        transform="translate(9967.3 -3597.759) translate(-9967 3598.059)"
                      />
                    </G>
                  </Svg>
                  <Text
                    style={{ ...styles.menuLabel, fontSize: sizes.default }}
                  >
                    {getDic('ShareDocSummary', '공동문서 모아보기')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </>
        )}
        {roomInfo && roomInfo.members && (
          <View style={styles.memberBox}>
            <View style={styles.memberCntBox}>
              <Text style={{ fontSize: sizes.default }}>
                {getDic('ChatMembers')}
              </Text>
              <Text style={{ ...styles.cnt, color: colors.primary }}>
                {roomInfo.members.length}
              </Text>
            </View>
            {channelAuth && (
              <>
                <TouchableOpacity onPress={handleInvite}>
                  <View style={styles.addBox}>
                    <View style={styles.addBtn}>
                      <Image source={ico_plus} style={styles.menuIco} />
                    </View>
                    <Text style={{ fontSize: sizes.default }}>
                      {getDic('AddChatMembers')}
                    </Text>
                  </View>
                </TouchableOpacity>
                {enabledExtUser === 'Y' && (
                  <TouchableOpacity onPress={handleExtUsrInvite}>
                    <View style={styles.addExtBox}>
                      <View style={styles.addBtn}>
                        <Svg
                          width="25.083"
                          height="25.071"
                          viewBox="0 0 25.083 25.071"
                        >
                          <G transform="translate(-3.375 -3.375)">
                            <Path
                              d="M17.357,22.416l-.072.006a1,1,0,0,0-.579.271l-3.893,3.893a4.389,4.389,0,0,1-6.207-6.207l4.134-4.134a4.363,4.363,0,0,1,.687-.56,4.43,4.43,0,0,1,.892-.452,4.22,4.22,0,0,1,.9-.223,4.273,4.273,0,0,1,.615-.042c.084,0,.169.006.277.012a4.377,4.377,0,0,1,2.82,1.266,4.321,4.321,0,0,1,1.031,1.645.949.949,0,0,0,1.163.609c.006,0,.012-.006.018-.006s.012,0,.012-.006a.941.941,0,0,0,.633-1.151,5.461,5.461,0,0,0-1.483-2.471A6.344,6.344,0,0,0,14.838,13.1c-.115-.018-.229-.036-.344-.048a6.22,6.22,0,0,0-.669-.036c-.157,0-.313.006-.464.018a6.078,6.078,0,0,0-.976.151c-.066.012-.127.03-.193.048a6.269,6.269,0,0,0-1.175.44,6.191,6.191,0,0,0-1.669,1.2L5.213,19.005A6.357,6.357,0,0,0,3.375,23.5a6.337,6.337,0,0,0,10.812,4.478l3.935-3.935A.954.954,0,0,0,17.357,22.416Z"
                              transform="translate(0 -1.377)"
                              fill="#999"
                            />
                            <Path
                              d="M28.038,5.225a6.351,6.351,0,0,0-8.962,0L15.237,9.064a.969.969,0,0,0,.609,1.651.979.979,0,0,0,.765-.277l3.845-3.833a4.389,4.389,0,0,1,6.207,6.207l-4.134,4.134a4.363,4.363,0,0,1-.687.56,4.43,4.43,0,0,1-.892.452,4.22,4.22,0,0,1-.9.223,4.273,4.273,0,0,1-.615.042c-.084,0-.175-.006-.277-.012a4.331,4.331,0,0,1-3.809-2.8.963.963,0,0,0-1.151-.591.974.974,0,0,0-.681,1.235,5.505,5.505,0,0,0,1.428,2.26h0l.012.012a6.345,6.345,0,0,0,3.815,1.814,6.219,6.219,0,0,0,.669.036q.235,0,.47-.018a6.89,6.89,0,0,0,1.163-.193,6.269,6.269,0,0,0,1.175-.44,6.191,6.191,0,0,0,1.669-1.2l4.134-4.134a6.344,6.344,0,0,0-.012-8.968Z"
                              transform="translate(-1.442)"
                              fill="#999"
                            />
                          </G>
                        </Svg>
                      </View>
                      <Text style={{ fontSize: sizes.default }}>
                        {getDic('InviteExUser')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
            <ScrollView style={styles.memberScroll}>
              {roomInfo.members.length > 0 &&
                roomInfo.members.map(member => {
                  return (
                    <View style={styles.userBoxContainer} key={member.id}>
                      <UserInfoBox
                        userInfo={member}
                        isInherit={true}
                        disableMessage={true}
                        navigation={navigation}
                      />
                      {member.channelAuth === 'Y' && (
                        <View
                          style={{
                            justifyContent: 'center',
                            borderColor: colors.primary,
                            borderWidth: 1.0,
                            width: 50,
                            height: 25,
                            borderRadius: 15,
                            marginLeft: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.primary,
                              fontSize: 13,
                              textAlign: 'center',
                            }}
                          >
                            {getDic('Admin')}
                          </Text>
                        </View>
                      )}
                      {/* 사용자가 관리자 일 때 */}
                      {member.id != id && channelAuth && (
                        <TouchableOpacity
                          style={{
                            justifyContent: 'center',
                            marginLeft: 'auto',
                            marginRight: 10,
                          }}
                          onPress={() => {
                            /* 다른 멤버가 일반인 아닐때 */
                            if (member.channelAuth == 'N')
                              handleMemberManagement(member);
                            /*다른 멤버가 일반인 일때 */
                            if (member.channelAuth == 'Y')
                              handleAuthMemberManagement(member);
                          }}
                        >
                          <MenuIcon color="#999" width="20" height="20" />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
            </ScrollView>
          </View>
        )}
        <View style={styles.funcBox}>
          <View style={styles.funcLeft}>
            <TouchableOpacity onPress={handleLeaveRoom}>
              <View style={styles.funcIcoWrap_left}>
                <Svg width="18" height="18.916" viewBox="0 0 12 10.916">
                  <G transform="translate(12) rotate(90)">
                    <G transform="translate(0)">
                      <Path
                        d="M67.509,4.227a.468.468,0,0,0,.658.023l2.95-2.71V8.594a.465.465,0,0,0,.929,0V1.517L75,4.258a.466.466,0,1,0,.635-.681L71.914.132a.473.473,0,0,0-.17-.1A.6.6,0,0,0,71.582,0a.47.47,0,0,0-.387.209l-3.662,3.36A.465.465,0,0,0,67.509,4.227Z"
                        transform="translate(-66.085)"
                        fill="#222"
                      />
                      <Path
                        d="M20.3,252.167a.466.466,0,0,0-.465.465v4.181a.466.466,0,0,0,.465.465h9.987a.466.466,0,0,0,.465-.465v-4.181a.465.465,0,1,0-.929,0v3.716H20.762v-3.716A.466.466,0,0,0,20.3,252.167Z"
                        transform="translate(-19.833 -245.276)"
                        fill="#222"
                      />
                    </G>
                  </G>
                </Svg>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.funcRight}>
            <TouchableOpacity onPress={handleNotification}>
              <View style={styles.funcIcoWrap_right}>
                {notification && (
                  <Svg width="20" height="22.12" viewBox="0 0 20 22.12">
                    <G transform="translate(9432 -494)">
                      <G
                        id="alarm-bell"
                        transform="translate(-9385.373 85.463)"
                      >
                        <G>
                          <G>
                            <Path
                              d="M-45.573,425.121a.707.707,0,0,0,.648.436h5.138a3.144,3.144,0,0,0,3.565,2.657,3.145,3.145,0,0,0,2.657-2.657h5.15a.343.343,0,0,0,.105-.016.718.718,0,0,0,.566-.448.693.693,0,0,0-.177-.742l-.035-.035a3.261,3.261,0,0,1-.625-1.061,10.507,10.507,0,0,1-.66-3.995c0-3.936-1.485-6.01-2.722-7.059a6.257,6.257,0,0,0-2.192-1.2,2.794,2.794,0,0,0-.589-1.67,2.364,2.364,0,0,0-1.909-.79,2.388,2.388,0,0,0-1.9.79,2.745,2.745,0,0,0-.6,1.709,6.3,6.3,0,0,0-2.192,1.178c-2.274,1.862-2.746,4.855-2.746,7.023a10.367,10.367,0,0,1-.672,3.959,4.365,4.365,0,0,1-.648,1.143h0A.706.706,0,0,0-45.573,425.121Zm8.909,1.709a1.756,1.756,0,0,1-1.67-1.273h3.347a1.758,1.758,0,0,1-1.678,1.273Z"
                              fill="#222"
                            />
                          </G>
                        </G>
                      </G>
                      <Rect
                        width="3"
                        height="4.12"
                        transform="translate(-9425 512)"
                        fill="none"
                      />
                      <Rect
                        width="20"
                        height="4.12"
                        transform="translate(-9432 511)"
                        fill="none"
                      />
                    </G>
                  </Svg>
                )}
                {!notification && (
                  <Svg
                    width="18.883"
                    height="18.163"
                    viewBox="0 0 12.883 14.163"
                  >
                    <G transform="translate(0)">
                      <Path
                        d="M21.446,11.919a.508.508,0,0,0,.466.313h3.693a2.26,2.26,0,0,0,4.473,0h3.7a.235.235,0,0,0,.076-.008.516.516,0,0,0,.407-.322.5.5,0,0,0-.127-.534l-.025-.025a2.376,2.376,0,0,1-.449-.762,7.566,7.566,0,0,1-.474-2.872c0-2.829-1.067-4.32-1.957-5.074a4.494,4.494,0,0,0-1.576-.864,2,2,0,0,0-.424-1.2A1.7,1.7,0,0,0,27.859,0a1.718,1.718,0,0,0-1.364.568A1.976,1.976,0,0,0,26.063,1.8a4.541,4.541,0,0,0-1.576.847,6.4,6.4,0,0,0-1.974,5.049,7.447,7.447,0,0,1-.483,2.846,3.112,3.112,0,0,1-.466.822h0A.509.509,0,0,0,21.446,11.919Zm6.4,1.228a1.263,1.263,0,0,1-1.2-.915h2.406A1.263,1.263,0,0,1,27.85,13.147ZM23.53,7.692c0-4.557,2.982-4.989,3.1-5.006a.518.518,0,0,0,.347-.195.526.526,0,0,0,.1-.39,1.254,1.254,0,0,1,.186-.9.686.686,0,0,1,.593-.212.726.726,0,0,1,.6.212,1.239,1.239,0,0,1,.178.864.5.5,0,0,0,.093.39.51.51,0,0,0,.347.2,3.308,3.308,0,0,1,1.516.745,5.341,5.341,0,0,1,1.593,4.3,7.987,7.987,0,0,0,.661,3.515h-10A8.366,8.366,0,0,0,23.53,7.692Z"
                        transform="translate(-21.409)"
                        fill="#222"
                      />
                    </G>
                  </Svg>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRoomOption}>
              <View style={styles.funcIcoWrap_right}>
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 57.102 56.844"
                >
                  <G transform="translate(0 0)">
                    <Path
                      d="M4.06,35.54l2.658,1.218a2.339,2.339,0,0,1,1.218,2.916L6.9,42.406a6.554,6.554,0,0,0,.775,6.164,6.665,6.665,0,0,0,5.537,2.916,6.734,6.734,0,0,0,2.4-.443l2.731-1.033a1.986,1.986,0,0,1,.812-.148,2.3,2.3,0,0,1,2.1,1.366l1.218,2.658a6.728,6.728,0,0,0,12.254,0l1.218-2.658a2.319,2.319,0,0,1,2.1-1.366,2.1,2.1,0,0,1,.812.148L41.6,51.08a6.778,6.778,0,0,0,2.4.48h0a6.9,6.9,0,0,0,5.537-2.953,6.745,6.745,0,0,0,.775-6.2l-1.033-2.731a2.339,2.339,0,0,1,1.218-2.916l2.658-1.218a6.728,6.728,0,0,0,0-12.255l-2.658-1.218a2.339,2.339,0,0,1-1.218-2.916L50.31,16.42a6.554,6.554,0,0,0-.775-6.164A6.665,6.665,0,0,0,44,7.34a6.734,6.734,0,0,0-2.4.443L38.867,8.816a1.986,1.986,0,0,1-.812.148,2.3,2.3,0,0,1-2.1-1.366L34.733,4.941A6.676,6.676,0,0,0,28.606.991a6.868,6.868,0,0,0-6.238,3.986L21.15,7.635A2.319,2.319,0,0,1,19.046,9a2.1,2.1,0,0,1-.812-.148L15.5,7.82a6.733,6.733,0,0,0-2.4-.443,6.861,6.861,0,0,0-5.537,2.916,6.684,6.684,0,0,0-.775,6.164l1.033,2.731A2.339,2.339,0,0,1,6.607,22.1L3.949,23.322A6.662,6.662,0,0,0,4.06,35.54Zm1.809-8.231,2.658-1.218a6.74,6.74,0,0,0,3.507-8.49L11,14.87a2.2,2.2,0,0,1,.258-2.1,2.254,2.254,0,0,1,2.731-.849l2.731,1.033a6.537,6.537,0,0,0,2.362.443h0a6.777,6.777,0,0,0,6.127-3.95l1.218-2.658a2.265,2.265,0,0,1,2.1-1.366,2.3,2.3,0,0,1,2.1,1.366l1.218,2.658a6.777,6.777,0,0,0,6.127,3.95,6.537,6.537,0,0,0,2.362-.443l2.731-1.033a2.365,2.365,0,0,1,2.731.849,2.2,2.2,0,0,1,.258,2.1L45.032,17.6a6.775,6.775,0,0,0,3.507,8.49L51.2,27.309a2.265,2.265,0,0,1,1.366,2.1,2.3,2.3,0,0,1-1.366,2.1l-2.658,1.218a6.74,6.74,0,0,0-3.507,8.49l1.033,2.731a2.2,2.2,0,0,1-.258,2.1,2.254,2.254,0,0,1-2.731.849l-2.731-1.033a6.537,6.537,0,0,0-2.362-.443,6.777,6.777,0,0,0-6.127,3.95L30.636,52.04a2.265,2.265,0,0,1-2.1,1.366,2.3,2.3,0,0,1-2.1-1.366L25.21,49.382a6.777,6.777,0,0,0-6.127-3.95,6.537,6.537,0,0,0-2.362.443l-2.731,1.033a2.365,2.365,0,0,1-2.731-.849,2.2,2.2,0,0,1-.258-2.1l1.033-2.731a6.775,6.775,0,0,0-3.507-8.49L5.869,31.517a2.265,2.265,0,0,1-1.366-2.1A2.3,2.3,0,0,1,5.869,27.309Z"
                      transform="translate(0 -0.991)"
                      fill="#222"
                    />
                    <Path
                      d="M154.663,164.685a9.6,9.6,0,1,0-9.6-9.6A9.625,9.625,0,0,0,154.663,164.685Zm0-14.764a5.168,5.168,0,1,1-5.168,5.168A5.183,5.183,0,0,1,154.663,149.921Z"
                      transform="translate(-126.167 -126.666)"
                      fill="#222"
                    />
                  </G>
                </Svg>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <MenuBoxBack handleClose={handleClose} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingBottom: getBottomPadding(),
  },
  menuBox: {
    width: '100%',
    height: 60,
    paddingLeft: 15,
    alignItems: 'center',
    borderBottomColor: '#D5D5D5',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
  },
  menuIco: {
    width: 17,
    height: 17,
  },
  menuLabel: {
    marginLeft: 10,
  },
  titleBox: {
    width: '100%',
    height: 60,
    paddingLeft: 15,
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
  },
  memberBox: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 10,
  },
  memberCntBox: {
    width: '100%',
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cnt: {
    marginLeft: 5,
  },
  addBox: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addExtBox: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  addBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#EEE',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  funcBox: {
    width: '100%',
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    borderTopColor: '#D5D5D5',
    borderTopWidth: 0.5,
    flexDirection: 'row',
  },
  memberScroll: {
    marginLeft: -10,
    marginTop: 10,
  },
  funcLeft: {
    width: '50%',
    height: '100%',
  },
  funcRight: {
    position: 'absolute',
    height: '100%',
    right: 0,
    paddingRight: 20,
    flexDirection: 'row',
  },
  funcIcoWrap_left: {
    width: 40,
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  funcIcoWrap_right: {
    width: 40,
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  funcIco: {
    width: 20,
    height: 20,
  },
  userBoxContainer: {
    paddingLeft: 10,
    marginBottom: 10,
    flexDirection: 'row',
  },
});

export default ChannelMenuBox;
