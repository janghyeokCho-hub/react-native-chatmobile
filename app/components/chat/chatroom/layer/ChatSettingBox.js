import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import SlideCHeckedBox from '@COMMON/SlideCheckedBox';
import { CommonActions } from '@react-navigation/native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { getDic } from '@/config';
import Svg, { Path } from 'react-native-svg';
import { isJSONStr } from '@/lib/common';
import LoadingWrap from '@COMMON/LoadingWrap';
import { modifyRoomSetting } from '@/modules/room';
import { modifyChannelSetting } from '@/modules/channel';
const ChatSettingBox = ({ route, navigation }) => {
  const { info, isChannel } = route.params;

  const loading = useSelector(
    ({ loading }) => loading['room/MODIFY_ROOMSETTING'],
  );

  const [lockInput, setLockInput] = useState('N');
  const dispatch = useDispatch();

  useEffect(() => {
    if (info.setting) {
      let setting = null;

      if (typeof info.setting === 'object') {
        setting = info.setting;
      } else if (isJSONStr(info.setting)) {
        setting = JSON.parse(info.setting);
      }

      setLockInput(setting.lockInput);
    }
  }, []);

  const handleChangeSetting = useCallback(
    (key, value) => {
      let setting = null;

      if (info.setting === null) {
        setting = {};
      } else if (typeof info.setting === 'object') {
        setting = { ...info.setting };
      } else if (isJSONStr(info.setting)) {
        setting = JSON.parse(info.setting);
      }

      setting[key] = value;

      if (!isChannel) {
        dispatch(
          modifyRoomSetting({
            roomID: info.roomID,
            key: key,
            value: value,
            setting: JSON.stringify(setting),
          }),
        );
      } else {
        dispatch(
          modifyChannelSetting({
            roomID: info.roomId,
            key: key,
            value: value,
            setting: JSON.stringify(setting),
          }),
        );
      }
    },
    [info, dispatch],
  );

  const handleClose = () => {
    navigation.dispatch(CommonActions.goBack());
  };

  return (
    <>
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
              {getDic('ChatRoomSetting', '채팅방 설정')}
            </Text>
          </View>
        </View>
        <View style={styles.contentBox}>
          <SlideCHeckedBox
            title={getDic('LockInput', '입력창 잠금')}
            checkValue={lockInput === 'Y'}
            onPress={() => {
              const changeVal = lockInput === 'Y' ? 'N' : 'Y';
              handleChangeSetting('lockInput', changeVal);
              setLockInput(changeVal);
            }}
          />
        </View>
      </View>
      {loading && <LoadingWrap />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: getTopPadding(),
    paddingBottom: getBottomPadding(),
    flex: 1,
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
  contentBox: { flex: 1, backgroundColor: 'white', flexDirection: 'column' },
});

export default ChatSettingBox;
