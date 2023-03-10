import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import { CommonActions } from '@react-navigation/native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';

import * as Profile from '@API/profile';
import ProfileBox from '@COMMON/ProfileBox';
import { openChatRoomView } from '@/lib/roomUtil';
import { useDispatch, useSelector } from 'react-redux';

import { getDic } from '@/config';
import ImageModal from '@COMMON/layout/ImageModal';
import NetworkError from './NetworkError';
import Svg, { G, Path, Rect, Circle } from 'react-native-svg';
import { linkCall } from '@/lib/device/common';
import { getJobInfo, getDictionary } from '@/lib/common';
import { useTheme } from '@react-navigation/native';
import { makePhotoPath } from '@/lib/util/paramUtil';
import { isBlockCheck } from '@/lib/api/orgchart';
import { FlatList } from 'react-native-bidirectional-infinite-scroll';
import { withSecurityScreen } from '@/withSecurityScreen';

const cancelBtnImg = require('@C/assets/ico_cancelbutton.png');

function ProfilePopupContent({ data }) {
  const { sizes } = useTheme();
  if (!data || typeof data !== 'object') {
    return <></>;
  }
  return (
    <FlatList
      data={Object.keys(data)}
      keyExtractor={item => `AddInfo_${item}`}
      contentContainerStyle={styles.profileContainer}
      renderItem={({ item }) => {
        return (
          <View style={styles.profileInfoWrap}>
            <View style={styles.profileSubTitle}>
              <Text
                style={{
                  ...styles.profileSubTitle_text,
                  fontSize: sizes.large,
                }}
                numberOfLines={2}
              >
                {getDic(item, item)}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text
                style={{
                  ...styles.profileInfo_text,
                  fontSize: sizes.large,
                }}
                numberOfLines={2}
              >
                {data?.[item]}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const ProfilePopup = ({ route, navigation }) => {
  const { colors, sizes } = useTheme();
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const viewType = useSelector(({ room }) => room.viewType);
  const rooms = useSelector(({ room }) => room.rooms);
  const selectId = useSelector(({ room }) => room.selectId);
  const myInfo = useSelector(({ login }) => login.userInfo);
  const networkState = useSelector(({ app }) => app.networkState);

  const { targetID } = route.params;
  const [targetInfo, setTargetInfo] = useState({});
  const userInfos = useMemo(() => {
    let addInfos = {};
    try {
      const addInfoType = typeof targetInfo?.addInfo;
      if (addInfoType === 'string') {
        addInfos = JSON.parse(targetInfo.addInfo);
      } else if (addInfoType === 'object') {
        addInfos = targetInfo.addInfo;
      }
    } catch (err) {
      // ...
    }
    return {
      Mobile: targetInfo.phoneNumber,
      Phone: targetInfo.companyNumber,
      Email: targetInfo.mailAddress,
      Work: targetInfo.work,
      ...addInfos,
    };
  }, [targetInfo]);

  const [showModal, setShowModal] = useState(false);
  const [targetAbsenceInfo, setTargetAbsenceInfo] = useState({});
  const photoPath = useMemo(() => makePhotoPath(targetInfo?.photoPath), [
    targetInfo,
  ]);

  const dispatch = useDispatch();

  useEffect(() => {
    getTargetInformation();
  }, [networkState]);

  useEffect(() => {
    if (targetAbsenceInfo == null || targetAbsenceInfo === {}) {
      Profile.getProfileInfo(targetID).then(({ data }) => {
        setTargetAbsenceInfo(JSON.parse(data.result.absenceInfo));
        setTargetInfo(data.result);
      });
    }
  }, []);

  const getTargetInformation = () => {
    if (networkState) {
      Profile.getProfileInfo(targetID).then(({ data }) => {
        setTargetAbsenceInfo(JSON.parse(data.result.absenceInfo));
        setTargetInfo(data.result);
      });
    }
  };

  const goBack = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, []);

  const opneChatRoomView = () => {
    const { blockChat, blockFile } = isBlockCheck({ targetInfo, chineseWall });
    if (blockChat && blockFile) {
      Alert.alert(null, getDic('Msg_BlockTarget', '????????? ???????????????.'));
    } else {
      openChatRoomView(
        dispatch,
        viewType,
        rooms,
        selectId,
        targetInfo,
        myInfo,
        navigation,
      );
    }
  };

  const handlePhotoPreview = () => {
    setShowModal(true);
  };

  const handleHiddenPhotoPreview = () => {
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {networkState && (
        <>
          <View style={styles.simpleInfo}>
            <TouchableOpacity style={styles.cancelBtnWrap} onPress={goBack}>
              <View style={styles.cancelBtn}>
                <Image source={cancelBtnImg} />
              </View>
            </TouchableOpacity>
            <View
              style={{
                ...styles.backgroundContainer,
                backgroundColor: colors.primary,
              }}
            >
              <View style={styles.profileImageContainer}>
                <TouchableOpacity
                  style={styles.profileImageWrap}
                  onPress={() => {
                    handlePhotoPreview();
                  }}
                >
                  <ProfileBox
                    userId={targetID}
                    img={photoPath}
                    userName={targetInfo.name}
                    presence={targetInfo.presence}
                    isInherit={false}
                    style={styles.profileImage}
                  />
                  {showModal && (
                    <ImageModal
                      type="NORMAL"
                      show={showModal}
                      image={photoPath}
                      hasDownload={false}
                      onClose={handleHiddenPhotoPreview}
                    />
                  )}
                </TouchableOpacity>
                <View style={styles.profileImageInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        ...styles.profileTitle,
                        fontSize: 22 + sizes.inc,
                      }}
                      numberOfLines={1}
                    >
                      {getJobInfo(targetInfo)}
                    </Text>
                    {targetInfo.isMobile === 'Y' && (
                      <View style={{ paddingLeft: 5 }}>
                        <Svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="15"
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
                    style={{ ...styles.profileDeptInfo, fontSize: sizes.large }}
                  >
                    {getDictionary(targetInfo.dept)}
                  </Text>
                  {targetAbsenceInfo &&
                    Object.keys(targetAbsenceInfo).length > 0 && (
                      <View style={{ marginTop: 10 }}>
                        <Text
                          style={{
                            ...styles.profileDeptInfo,
                            fontSize: sizes.large,
                          }}
                        >
                          {getDic(
                            'Ab_' + targetAbsenceInfo.code,
                            targetAbsenceInfo.code,
                          )}
                        </Text>
                        <Text
                          style={{
                            ...styles.profileDeptInfo,
                            marginTop: 7,
                            fontSize: sizes.medium,
                          }}
                        >
                          {format(
                            new Date(targetAbsenceInfo.startDate),
                            'yyyy.MM.dd',
                          ) +
                            ' ~ ' +
                            format(
                              new Date(targetAbsenceInfo.endDate),
                              'yyyy.MM.dd',
                            )}
                        </Text>
                      </View>
                    )}
                </View>
              </View>
            </View>
          </View>
          <ProfilePopupContent data={userInfos} />
          <View style={styles.startChat}>
            <View style={styles.bottomBtn}>
              {(myInfo.id !== targetID && (
                <>
                  <TouchableOpacity onPress={opneChatRoomView}>
                    <View style={styles.btnChat}>
                      <Svg
                        width="22.67"
                        height="22.272"
                        viewBox="0 0 22.67 22.272"
                      >
                        <G transform="translate(-2.711)">
                          <Path
                            d="M29.6,21.523a1.58,1.58,0,0,1,.215-.8,2.2,2.2,0,0,1,.137-.2,10.564,10.564,0,0,0,1.8-5.888A11.091,11.091,0,0,0,20.431,3.75a11.247,11.247,0,0,0-11.1,8.665,10.478,10.478,0,0,0-.241,2.23A11.06,11.06,0,0,0,20.235,25.67a13.428,13.428,0,0,0,3.077-.5c.737-.2,1.467-.469,1.656-.541a1.724,1.724,0,0,1,.606-.111,1.7,1.7,0,0,1,.659.13l3.7,1.311a.882.882,0,0,0,.254.065.519.519,0,0,0,.522-.522.838.838,0,0,0-.033-.176Z"
                            transform="translate(-6.375 -3.75)"
                            fill="#585757"
                          />
                        </G>
                      </Svg>
                      <Text
                        style={{
                          ...styles.textChat,
                          fontSize: sizes.default,
                        }}
                      >
                        {getDic('StartChat', '????????????')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      linkCall(targetInfo.phoneNumber);
                    }}
                  >
                    <View style={styles.btnCall}>
                      <Svg
                        width="20.254"
                        height="20.252"
                        viewBox="0 0 20.254 20.252"
                      >
                        <Path
                          d="M24.158,20.36A17.012,17.012,0,0,0,20.6,17.982c-1.065-.511-1.455-.5-2.209.042-.627.453-1.033.875-1.756.717a10.474,10.474,0,0,1-3.527-2.61A10.4,10.4,0,0,1,10.5,12.6c-.153-.728.269-1.128.717-1.756.543-.754.559-1.144.042-2.209A16.675,16.675,0,0,0,8.884,5.086c-.775-.775-.949-.606-1.376-.453a7.831,7.831,0,0,0-1.26.67A3.8,3.8,0,0,0,4.735,6.9c-.3.649-.649,1.856,1.123,5.009a27.949,27.949,0,0,0,4.914,6.554h0l.005.005.005.005h0a28.058,28.058,0,0,0,6.554,4.914c3.153,1.772,4.36,1.424,5.009,1.123A3.737,3.737,0,0,0,23.942,23a7.83,7.83,0,0,0,.67-1.26C24.765,21.309,24.939,21.135,24.158,20.36Z"
                          transform="translate(-4.49 -4.503)"
                          fill="#585757"
                        />
                      </Svg>
                      <Text
                        style={{
                          ...styles.textChat,
                          fontSize: sizes.default,
                        }}
                      >
                        {getDic('Call')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )) || (
                <TouchableOpacity onPress={opneChatRoomView}>
                  <View style={styles.btnChatCenter}>
                    <Svg
                      width="22.67"
                      height="22.272"
                      viewBox="0 0 22.67 22.272"
                    >
                      <G transform="translate(-2.711)">
                        <Path
                          d="M29.6,21.523a1.58,1.58,0,0,1,.215-.8,2.2,2.2,0,0,1,.137-.2,10.564,10.564,0,0,0,1.8-5.888A11.091,11.091,0,0,0,20.431,3.75a11.247,11.247,0,0,0-11.1,8.665,10.478,10.478,0,0,0-.241,2.23A11.06,11.06,0,0,0,20.235,25.67a13.428,13.428,0,0,0,3.077-.5c.737-.2,1.467-.469,1.656-.541a1.724,1.724,0,0,1,.606-.111,1.7,1.7,0,0,1,.659.13l3.7,1.311a.882.882,0,0,0,.254.065.519.519,0,0,0,.522-.522.838.838,0,0,0-.033-.176Z"
                          transform="translate(-6.375 -3.75)"
                          fill="#585757"
                        />
                      </G>
                    </Svg>
                    <Text
                      style={{ ...styles.textChat, fontSize: sizes.default }}
                    >
                      {getDic('StartChat', '????????????')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}
      {!networkState && (
        <>
          <View>
            <TouchableOpacity style={styles.cancelBtnWrap} onPress={goBack}>
              <View style={styles.cancelBtn}>
                <Image source={cancelBtnImg} />
              </View>
            </TouchableOpacity>
          </View>
          <NetworkError handleRefresh={getTargetInformation} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  simpleInfo: {
    height: '35%',
  },
  closeButton: {
    margin: 15,
  },
  backgroundContainer: {
    paddingTop: getTopPadding(),
    justifyContent: 'center',
  },
  cancelBtnWrap: {
    position: 'absolute',
    top: getTopPadding(),
    left: 0,
    width: 40,
    height: 40,
    zIndex: 10,
  },
  cancelBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    padding: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageInfo: {
    marginLeft: 30,
    flexDirection: 'column',
  },
  profileContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: getBottomPadding(),
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 8,
  },
  profileInfoWrap: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginVertical: 8,
    alignItems: 'center',
  },
  profileImage: {
    flex: 1,
    borderRadius: 35,
  },
  profileImageWrap: {
    width: 150,
    height: 150,
  },
  profileTitle: {
    color: '#FFF',
    marginBottom: 8,
    fontWeight: '600',
    maxWidth: 150,
  },
  profileSubTitle: {
    flex: 3,
  },
  profileSubTitle_text: {
    color: '#666',
  },
  profileInfo: {
    flex: 7,
  },
  profileInfo_text: {
    color: '#000',
    fontWeight: '600',
  },
  startChat: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  bottomBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnChat: { alignItems: 'center', marginRight: 15 },
  btnCall: { alignItems: 'center', marginLeft: 15 },
  btnChatCenter: { alignItems: 'center' },
  textChat: { paddingTop: 5, fontWeight: '700', color: '#585757' },
  profileDeptInfo: {
    color: '#EEE',
  },
});

export default withSecurityScreen(ProfilePopup);
