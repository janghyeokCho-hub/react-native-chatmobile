import { getDic } from '@/config';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CommonActions } from '@react-navigation/native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import TitleInputBox from '@/components/common/TitleInputBox';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { updateDocument } from '@/lib/api/shareDoc';
import { sendMessage, sendChannelMessage } from '@/modules/message';
import { rematchingMember } from '@/modules/room';
import { getDocItem as getDocItemAPI } from '@API/shareDoc';

const DocPropertyView = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { room, item } = route.params;
  const { colors } = useTheme();
  const [docTitle, setDocTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const userId = useSelector(({ login }) => login.id);
  const [isOwner, setIsOwner] = useState(false);
  const [docItem, setDocItem] = useState(null);

  useEffect(() => {
    if (item?.ownerCode === userId) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [userId, item]);

  useEffect(() => {
    async function getDocItem(docID) {
      const response = await getDocItemAPI(docID);
      const { result, status } = response?.data;

      if (status === 'SUCCESS' && response.status === 200) {
        if (result) {
          setDocItem(result);
        }
      } else {
        Alert.alert(
          null,
          getDic(
            'Msg_Error',
            '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
          ),
        );
      }
    }

    if (item?.docID) {
      getDocItem(item?.docID);
    }

    return () => {
      setDocItem(null);
    };
  }, [item]);

  useEffect(() => {
    if (docItem) {
      setDocTitle(docItem.docTitle);
      setDescription(docItem.description);
      setCategory(docItem.category);
    }

    return () => {
      setDocTitle('');
      setDescription('');
      setCategory('');
    };
  }, [docItem]);

  const handleClose = () => {
    navigation.dispatch(CommonActions.goBack());
  };

  const handleMessage = useCallback(
    async message => {
      const data = {
        roomID: room.roomType === 'C' ? room.roomId : room.roomID,
        context: message,
        roomType: room.roomType,
        messageType: 'A',
      };
      if (room.roomType === 'C') {
        dispatch(sendChannelMessage(data));
      } else {
        // sendMessage 하기 전에 RoomType이 M인데 참가자가 자기자신밖에 없는경우 상대를 먼저 초대함.
        if (room.roomType === 'M' && room.realMemberCnt === 1) {
          dispatch(rematchingMember(data));
        } else {
          // rematchingMember 내에서 서버 호출 후 sendMessage 호출하도록 변경
          dispatch(sendMessage(data));
        }
      }
    },
    [dispatch, room],
  );

  const handleDocUpdate = useCallback(async () => {
    if (isOwner) {
      if (!docTitle) {
        Alert.alert(null, getDic('Msg_Note_EnterTitle', '제목을 입력하세요.'));
        return;
      } else if (!description) {
        Alert.alert(null, getDic('Msg_InputDescription', '설명을 입력하세요.'));
        return;
      }
    }

    if (
      docTitle !== docItem.docTitle ||
      description !== docItem.description ||
      category !== docItem.category
    ) {
      const response = await updateDocument({
        roomID: docItem.roomID,
        roomType: docItem.roomType,
        docID: docItem.docID,
        docURL: docItem.docURL,
        docTitle: docTitle,
        description: description,
        category: category,
      });
      const { status, result } = response?.data;
      if (result && status === 'SUCCESS') {
        if (
          isOwner &&
          (docTitle !== docItem.docTitle || description !== docItem.description)
        ) {
          const msgObj = {
            title: getDic('JointDoc', '공동문서'),
            context: result.docTitle,
            func: [
              {
                name: getDic('docEdit', '문서 편집'),
                type: 'link',
                data: {
                  baseURL: result.docURL,
                },
              },
              {
                name: getDic('ViewProperties', '속성 보기'),
                type: 'openLayer',
                data: {
                  componentName: 'DocPropertyView',
                  item: result,
                  room: room,
                },
              },
              {
                name: getDic('InviteEditor', '편집자 초대'),
                type: 'openLayer',
                data: {
                  componentName: 'InviteMember',
                  headerName: getDic('InviteEditor', '편집자 초대'),
                  roomId: result.roomID,
                  roomType: room.roomType,
                  isNewRoom: false,
                },
              },
            ],
          };
          handleMessage(JSON.stringify(msgObj));
        }
        Alert.alert(null, getDic('Msg_ModifySuccess', '수정되었습니다.'));
        handleClose();
      } else {
        Alert.alert(
          null,
          getDic(
            'Msg_Error',
            '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
          ),
        );
        return;
      }
    } else {
      handleClose();
    }
  }, [isOwner, docTitle, description, category, room, item.docID, docItem]);
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
              {getDic('ViewProperties', '속성 보기')}
            </Text>
          </View>
        </View>
        <ScrollView>
          <View>
            <TitleInputBox
              editable={isOwner}
              title={getDic('DocTitle', '문서 제목')}
              placeholder={getDic('Msg_Note_EnterTitle', '제목을 입력하세요.')}
              onChageTextHandler={text => {
                setDocTitle(text);
              }}
              value={docTitle}
            />
            <TitleInputBox
              editable={isOwner}
              title={getDic('DocDescription', '문서 설명')}
              placeholder={getDic('Msg_InputDescription', '설명을 입력하세요.')}
              onChageTextHandler={text => {
                setDescription(text);
              }}
              value={description}
            />
            <TitleInputBox
              title={getDic('Category', '카테고리')}
              placeholder={getDic(
                'Msg_InputCategory',
                '카테고리를 입력하세요.',
              )}
              onChageTextHandler={text => {
                setCategory(text);
              }}
              value={category}
            />
          </View>
          <View style={{ marginBottom: 20 }} />
          <View style={{ marginTop: -15 }}>
            <TouchableOpacity
              onPress={async () => {
                handleDocUpdate();
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
                  {getDic('Ok', '확인')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
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
});
export default DocPropertyView;
