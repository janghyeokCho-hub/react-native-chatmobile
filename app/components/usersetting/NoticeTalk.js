import React, {  useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import NoteHeader from '@C/note/NoteHeader';
import { getDic } from '@/config';
import OrgList from '@/components/common/orgList';
import ChannelList from '@/components/common/ChannelList';
import { useSelector } from 'react-redux';
import { chatsvr } from '@API/api';

const NoticeTalk = ({ navigation, route }) => {
  const { params = {} } = route;
  const { channelName, channelId, channelPhoto } = params;
  const [changeText, setChangeText] = useState('');

  const { userInfo } = useSelector(({ login }) => ({
    userInfo: login.userInfo,
  }));

  const [recipient, setRecipient] = useState([]);

  async function handleSend() {
    let subjectId = '';
    const selectTargets = [];
    let context = '';

    if (recipient) {
      recipient.forEach(target => {
        selectTargets.push({ targetCode: target.id, targetType: target.type });
      });
    }

    if (channelId) {
      subjectId = channelId;
    }

    if (changeText) {
      context = changeText;
      console.log('dd', changeText, context);
    }

    if (!subjectId) {
      Alert.alert(
        getDic('NoticeTalk', '알림톡'),
        getDic('Msg_Noti_EnterChannel', '알림 채널을 선택하세요'),
      );
      return;
    }

    if (!recipient?.length) {
      Alert.alert(
        getDic('NoticeTalk', '알림톡'),
        getDic('Msg_Note_EnterRecipient'),
      );
      return;
    }

    if (!context?.length) {
      Alert.alert(
        getDic('NoticeTalk', '알림톡'),
        getDic('Msg_Note_EnterContext'),
      );
      return;
    }
    try {
      const sendData = {
        subjectId: subjectId.toString(),
        targets: selectTargets,
        message: context.trim(),
        companyCode: userInfo.CompanyCode,
        push: 'Y',
      };

      //데이터 전송
      const { data } = await chatsvr('post', '/notice/talk', sendData);

      if (data) {
        Alert.alert(
          getDic('NoticeTalk', '알림톡'),
          getDic('Msg_Noti_SendSuccess', '알림 전송에 성공했습니다.'),
        );

        navigation.navigate('UserSetting', {});
        return;
      } else {
        Alert.alert(
          getDic('NoticeTalk', '알림톡'),
          getDic('Msg_Noti_SendFail', '알림 전송에 실패했습니다.'),
        );
      }
    } catch (err) {
      console.log('Send Error   ', err);
    }
  }

  const handleRecipient = targetList => {
    setRecipient(targetList);
  };

  const customMenus = [
    {
      icon: 'Send',
      iconStyle: styles.button,
      onPress: handleSend,
    },
  ];

  return (
    <SafeAreaView style={{ flexDirection: 'column' }}>
      <NoteHeader title={getDic('NoticeTalk', '알림톡')} menus={customMenus} />
      <ScrollView style={styles.contanier} nestedScrollEnabled>
        <ChannelList
          style={styles.rowContainer}
          channelName={channelName}
          channelId={channelId}
          channelPhoto={channelPhoto}
        />
        <OrgList
          style={styles.rowContainer}
          handleRecipient={handleRecipient}
        />
        <View style={styles.textInputBox}>
          <TextInput
            style={styles.textInput}
            onChangeText={text => setChangeText(text)}
            multiline
            numberOfLines={24}
            value={changeText}
            placeholder="내용을 입력해주세요."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NoticeTalk;

const styles = StyleSheet.create({
  contanier: {
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  button: {
    color: '#444',
    width: 22,
    height: 22,
  },
  rowContainer: {
    flexDirection: 'row',
    paddingHorizontal: '4%',
    alignItems: 'center',
    borderBottomColor: '#cecece',
    borderBottomWidth: 1,
    paddingVertical: '2%',
  },
  textInputBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  textInput: {
    width: '95%',
    height: 500,
    paddingHorizontal: 15,
    textAlignVertical: 'top',
  },
});
