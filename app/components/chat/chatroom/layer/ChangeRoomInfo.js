import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { modifyRoomName } from '@/modules/room';
import { getDic } from '@/config';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';
import { withSecurityScreen } from '@/withSecurityScreen';

const ChangeRoomInfo = ({ route, navigation }) => {
  const { sizes } = useTheme();
  const { roomID, roomInfo } = route.params;
  const [roomName, setRoomName] = useState(roomInfo.roomName);
  const dispatch = useDispatch();

  const handleClose = () => {
    navigation.dispatch(CommonActions.goBack());
  };

  const handleSave = useCallback(
    roomName => {
      dispatch(
        modifyRoomName({
          roomId: roomID,
          roomName: roomName,
        }),
      );

      navigation.dispatch(CommonActions.goBack());
    },
    [roomID, dispatch],
  );

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
          <Text style={styles.modaltit}>{getDic('RoomNameChange')}</Text>
        </View>
        <View style={styles.okbtnView}>
          <TouchableOpacity
            onPress={e => {
              handleSave(roomName);
            }}
          >
            <View style={{ ...styles.topBtn, fontSize: sizes.default }}>
              <Text>{getDic('Ok')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.contentBox}>
        <TextInput
          autoCompleteType="off"
          clearButtonMode="always"
          defaultValue={roomName}
          maxLength={50}
          multiline={false}
          style={styles.inputBox}
          placeholderTextColor="#AAA"
          onChangeText={text => setRoomName(text)}
        />
      </View>
    </View>
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
  contentBox: { width: '100%', alignItems: 'center', marginTop: 30 },
  inputBox: {
    width: '90%',
    height: 70,
    borderBottomColor: '#888',
    borderBottomWidth: 0.5,
    color: '#222',
    fontSize: 15,
  },
});

export default withSecurityScreen(ChangeRoomInfo);
