import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { getConfig, getDic } from '@/config';
import { Linking } from 'react-native';
import { getDocItem } from '@/lib/api/shareDoc';
import { useDispatch } from 'react-redux';
import { sendMessage, sendChannelMessage } from '@/modules/message';
import { rematchingMember } from '@/modules/room';

const ShareDocExtension = ({ onClose, btnStyle, item, room, navigation }) => {
  const dispatch = useDispatch();
  const handleMessage = useCallback(
    message => {
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

  const buttons = useMemo(() => {
    let modalBtn = [
      {
        title: getDic('DocEdit', '문서 편집'),
        onPress: async () => {
          const forbiddenUrls = getConfig('forbidden_url_mobile', []);
          const url = item.docURL;

          let allowOpenUrl = true;
          // 열기가 금지된 url인지 확인
          forbiddenUrls.some(f_url => {
            if (url.includes(f_url) === true) {
              allowOpenUrl = false;
              return true;
            }
            return false;
          });

          // 금지된 url일 경우 브라우저로 열지 않음
          if (allowOpenUrl === false) {
            Alert.alert(
              null,
              getDic('Msg_ForbiddenUrl', 'PC에서 확인해주세요.'),
              [{ text: getDic('Ok') }],
            );
            return;
          }

          Linking.canOpenURL(url).then(supported => {
            if (supported) {
              Linking.openURL(url);
            }
          });
        },
      },
      {
        title: getDic('ViewProperties', '속성 보기'),
        onPress: () => {
          navigation.navigate('DocPropertyView', {
            item: item,
            room: room,
            navigation: navigation,
          });
        },
      },
      {
        title: getDic('ShareAgain', '다시 공유하기'),
        onPress: async () => {
          const response = await getDocItem(item.docID);
          const { status, result } = response?.data;
          if (status === 'SUCCESS' && result) {
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
            onClose();
          } else {
            Alert.alert(
              null,
              getDic(
                'Msg_Error',
                '오류가 발생했습니다.<br/>관리자에게 문의해주세요.',
              ),
            );
          }
        },
      },
      {
        title: getDic('Cancel', '취소'),
        onPress: () => {
          onClose();
        },
      },
    ];

    return modalBtn;
  }, [onClose, item, room, navigation]);

  return (
    <View>
      {buttons &&
        buttons.map(modalInfo => {
          return (
            <View key={`msgext_${modalInfo.type}`}>
              <TouchableOpacity
                onPress={() => {
                  modalInfo.onPress();
                  onClose();
                }}
              >
                <Text style={btnStyle}>{modalInfo.title}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
    </View>
  );
};

export default ShareDocExtension;
