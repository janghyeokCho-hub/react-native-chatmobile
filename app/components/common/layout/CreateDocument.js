import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CommonActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import LoadingWrap from '@COMMON/LoadingWrap';
import TitleInputBox from '@COMMON/TitleInputBox';
import { getDic, getConfig } from '@/config';
import { useTheme } from '@react-navigation/native';
import { createDocument } from '@/lib/api/shareDoc';
import { rematchingMember } from '@/modules/room';
import { sendChannelMessage } from '@/modules/message';
import { sendMessage } from '@/modules/message';
import { withSecurityScreen } from '@/withSecurityScreen';

const CreateDocument = ({ navigation, route, postAction }) => {
  const { colors, sizes } = useTheme();
  const { headerName } = route.params;
  const handleClose = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, [navigation]);

  const [loading, setLoading] = useState(false);

  const [docTitle, setDocTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const userInfo = useSelector(({ login }) => login.userInfo);

  const currentRoom = useSelector(({ room, channel }) => {
    if (room.currentRoom) {
      return room.currentRoom;
    } else if (channel.currentChannel) {
      return channel.currentChannel;
    } else {
      return {
        members: [],
      };
    }
  });

  const forbiddenUrls = getConfig('forbidden_url_mobile', []);

  const dispatch = useDispatch();

  const handleMessage = useCallback(
    async message => {
      const roomType = currentRoom.roomType;
      const data = {
        roomID: roomType === 'C' ? currentRoom.roomId : currentRoom.roomID,
        context: message,
        roomType: roomType,
        messageType: 'A',
      };

      if (roomType === 'C') {
        dispatch(sendChannelMessage(data));
      } else {
        // sendMessage ?????? ?????? RoomType??? M?????? ???????????? ?????????????????? ???????????? ????????? ?????? ?????????.
        if (roomType === 'M' && currentRoom.realMemberCnt === 1) {
          dispatch(rematchingMember(data));
        } else {
          // rematchingMember ????????? ?????? ?????? ??? sendMessage ??????????????? ??????
          dispatch(sendMessage(data));
        }
      }

      if (window.covi?.listBottomBtn) {
        window.covi.listBottomBtn.click();
      }
    },
    [dispatch, currentRoom],
  );

  const handleCreate = useCallback(async () => {
    setLoading(true);

    if (!docTitle) {
      Alert.alert(
        getDic('Eumtalk'),
        getDic('Msg_Note_EnterTitle', '????????? ???????????????.'),
        [{ text: getDic('Ok') }],
        {
          cancelable: true,
        },
      );
      setLoading(false);
      return;
    } else if (!description) {
      Alert.alert(
        getDic('Eumtalk'),
        getDic('Msg_InputDescription', '????????? ???????????????.'),
        [{ text: getDic('Ok') }],
        {
          cancelable: true,
        },
      );
      setLoading(false);
      return;
    }

    const ownerCode = userInfo.id;
    const { members, roomType } = currentRoom;
    const roomID = roomType === 'C' ? currentRoom.roomId : currentRoom.roomID;
    const targetList = members.map(({ id }) => id);
    const params = {
      roomId: roomID,
      docTitle,
      description,
      category,
      ownerCode,
      targetList,
    };

    const response = await createDocument(params);
    const { status, result } = response.data;
    if (status === 'SUCCESS') {
      const { docURL } = result;
      let allowOpenUrl = true;
      // ????????? ????????? url?????? ??????
      forbiddenUrls.some(f_url => {
        if (docURL.includes(f_url) === true) {
          allowOpenUrl = false;
          return true;
        }
        return false;
      });

      // ????????? url??? ?????? ??????????????? ?????? ??????
      if (allowOpenUrl !== false) {
        Linking.canOpenURL(docURL).then(supported => {
          if (supported) {
            Linking.openURL(docURL);
          }
        });
      }

      const msgObj = {
        title: getDic('JointDoc', '????????????'),
        context: result.docTitle,
        func: [
          {
            name: getDic('docEdit', '?????? ??????'),
            type: 'link',
            data: {
              baseURL: result.docURL,
            },
          },
          {
            name: getDic('ViewProperties', '?????? ??????'),
            type: 'openLayer',
            data: {
              componentName: 'DocPropertyView',
              item: result,
              room: currentRoom,
            },
          },
          {
            name: getDic('InviteEditor', '????????? ??????'),
            type: 'openLayer',
            data: {
              componentName: 'InviteMember',
              headerName: getDic('InviteEditor', '????????? ??????'),
              roomId: currentRoom.roomID,
              roomType: currentRoom.roomType,
              isNewRoom: false,
            },
          },
        ],
      };

      handleMessage(JSON.stringify(msgObj));
      handleClose();
    } else {
      Alert.alert(
        getDic(
          'Msg_Error',
          '????????? ??????????????????.<br/>??????????????? ??????????????????.',
        ),
      );
    }

    setLoading(false);
  }, [
    docTitle,
    description,
    category,
    userInfo,
    currentRoom,
    handleMessage,
    handleClose,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.exitBtnView}>
          <TouchableOpacity onPress={handleClose}>
            <View style={styles.topBtn}>
              <Svg width="7.131" height="12.78" viewBox="0 0 7.131 12.78">
                <Path
                  id="??????_2901"
                  data-name="?????? 2901"
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
      <ScrollView>
        <View>
          <TitleInputBox
            title={getDic('DocTitle', '?????? ??????')}
            placeholder={getDic('Msg_Note_EnterTitle', '????????? ???????????????.')}
            onChageTextHandler={text => {
              setDocTitle(text);
            }}
            value={docTitle}
          />
          <TitleInputBox
            title={getDic('DocDescription', '?????? ??????')}
            placeholder={getDic('Msg_InputDescription', '????????? ???????????????.')}
            onChageTextHandler={text => {
              setDescription(text);
            }}
            value={description}
          />
          <TitleInputBox
            title={getDic('Category', '????????????')}
            placeholder={getDic('Msg_InputCategory', '???????????????  ???????????????.')}
            onChageTextHandler={text => {
              setCategory(text);
            }}
            value={category}
          />
        </View>
        <View style={{ marginBottom: 20 }} />
        <View style={{ marginTop: -15 }}>
          <TouchableOpacity
            onPress={() => {
              handleCreate();
            }}
          >
            <View
              style={{
                backgroundColor: colors.primary,
                margin: 21,
                height: 50,
                borderRadius: 3,
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 18,
                  alignContent: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  textAlignVertical: 'center',
                }}
              >
                {getDic('Ok', '??????')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  topRightBtn: {
    marginLeft: 'auto',
    right: -5,
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
  dropdownContainer: {
    marginTop: 13,
    borderRadius: 3,
    borderWidth: 1,
    height: 35,
    borderColor: '#ddd',
  },
  dropdownText: {
    fontSize: 17,
    marginLeft: 9,
    marginTop: 9,
  },
  dropdownPlaceholder: {
    fontSize: 17,
    marginLeft: 9,
    marginTop: 9,
    color: '#AAA',
  },
  dropdownMenuText: {
    fontSize: 17,
    marginLeft: 9,
    marginTop: 9,
  },
  dropdownMenuContainer: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 100,
  },
});

export default withSecurityScreen(CreateDocument);
