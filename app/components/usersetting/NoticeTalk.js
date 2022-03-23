import React, { useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import NoteHeader from '@C/note/NoteHeader';
import { getDic } from '@/config';
import OrgList from '@/components/common/orgList';
import ChannelList from '@/components/common/ChannelList';
import { useSelector } from 'react-redux';
import { chatsvr } from '@API/api';
import { useTheme } from '@react-navigation/native';

const NoticeTalk = ({ navigation, route }) => {
  const { params = {} } = route;
  const { channelName, channelId, channelPhoto } = params;
  const [changeText, setChangeText] = useState('');
  const [allCheck, setAllCheck] = useState(false)
  const { colors } = useTheme();

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

    let userCompanyCode = [{targetCode: userInfo.CompanyCode, targetType: 'G' }]

    if (channelId) {
      subjectId = channelId;
    } else {
      Alert.alert(
        getDic('NoticeTalk', '알림톡'),
        getDic('Msg_Noti_EnterChannel', '알림 채널을 선택하세요'),
      );
      return;
    }

    if (changeText) {
      context = changeText;
    } else {
      Alert.alert(
        getDic('NoticeTalk', '알림톡'),
        getDic('Msg_Note_EnterContext'),
      );
      return;
    }

    if (recipient.length === 0 && !allCheck) {
      Alert.alert(
        getDic('NoticeTalk', '알림톡'),
        getDic('Msg_Note_EnterRecipient'),
      );
      return;
    }
    try {
      const sendData = {
        subjectId: subjectId.toString(),
        targets: allCheck? userCompanyCode : selectTargets,
        message: context.trim(),
        companyCode: userInfo.CompanyCode,
        push: 'Y',
      };
      console.log('sendData', sendData)

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

  const customMenus = [
    {
      switch : getDic('allHands', '전체공지'),
      iconStyle: styles.button,
    },
  ];

  return (
    <SafeAreaView style={styles.contanier} >
      <View style={{flex:.9}}>
      <NoteHeader title={getDic('All_Recipient', '알림톡')} menus={customMenus} setAllCheck={setAllCheck} />
      <ScrollView>
        <ChannelList
          channelName={channelName}
          channelId={channelId}
          channelPhoto={channelPhoto}
        />
        <OrgList setRecipient={setRecipient} allCheck={allCheck} setAllCheck={setAllCheck} />
        <View style={styles.textInputBox}>
          <TextInput
            style={styles.textInput}
            onChangeText={text => setChangeText(text)}
            multiline
            numberOfLines={20}
            scrollEnabled
            value={changeText}
            placeholder={getDic('Msg_Note_EnterContext', '내용을 입력하세요')}
          />
        </View>
        </ScrollView>

        </View>
        <View style={{flex:.1}}>

      <TouchableOpacity
        onPress={() => {
          handleSend();
        }}
        style={{ alignItems:'center'}}
      >
        <View
          style={{
            backgroundColor: colors.primary,
            width:'90%',
            height: 50,
            borderRadius: 3,
            justifyContent: 'center',
          }}
        >
          <Text style={styles.sendBtnTxt}>{getDic('Send')}</Text>
        </View>
      </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default NoticeTalk;

const styles = StyleSheet.create({
  contanier: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: getTopPadding(),
    paddingBottom: getBottomPadding(),
  },
  button: {
    color: '#444',
    width: 22,
    height: 22,
  },
  textInputBox: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  textInput: {
    width: '95%',
    height: 400,
    paddingHorizontal: 15,
    textAlignVertical: 'top',
  },
  sendBtnTxt: {
    color: 'white',
    fontSize: 18,
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
