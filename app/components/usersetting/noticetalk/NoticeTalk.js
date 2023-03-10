import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import NoteHeader from '@C/note/NoteHeader';
import { getDic } from '@/config';
import OrgList from '@/components/common/orgList';
import ChannelList from '@/components/common/ChannelList';
import ContextBox from '@/components/usersetting/noticetalk/ContextBox';
import { useSelector } from 'react-redux';
import { chatsvr } from '@API/api';
import { useTheme } from '@react-navigation/native';
import LoadingWrap from '../../common/LoadingWrap';
import { checkURL } from '@/lib/common';
import { withSecurityScreen } from '@/withSecurityScreen';

const NoticeTalk = ({ navigation, route }) => {
  const { params = {} } = route;
  const { channelName, channelId, channelPhoto } = params;
  const { colors } = useTheme();
  const { userInfo } = useSelector(({ login }) => ({
    userInfo: login.userInfo,
  }));
  const [changeText, setChangeText] = useState('');
  const [allCheck, setAllCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipient, setRecipient] = useState([]);
  const [url, setUrl] = useState('');
  const [validURL, setValidURL] = useState(false);

  useEffect(() => {
    if (url && checkURL(url).isURL) {
      setValidURL(true);
    } else {
      setValidURL(false);
    }
  }, [url]);

  async function handleSend() {
    let subjectId = '';
    const selectTargets = [];
    let context = '';

    if (isLoading === true) {
      return;
    }
    setIsLoading(true);

    if (recipient) {
      recipient.forEach(target => {
        selectTargets.push({ targetCode: target.id, targetType: target.type });
      });
    }

    let userCompanyCode = [
      { targetCode: userInfo.CompanyCode, targetType: 'G' },
    ];

    if (channelId) {
      subjectId = channelId;
    } else {
      setIsLoading(false);
      Alert.alert(
        getDic('NoticeTalk', '?????????'),
        getDic('Msg_Noti_EnterChannel', '?????? ????????? ???????????????'),
      );
      return;
    }

    if (changeText) {
      context = changeText;
    } else {
      setIsLoading(false);
      Alert.alert(
        getDic('NoticeTalk', '?????????'),
        getDic('Msg_Note_EnterContext'),
      );
      return;
    }

    if (url && !validURL) {
      setIsLoading(false);
      Alert.alert(
        getDic('NoticeTalk', '?????????'),
        getDic('CheckURL', '????????? url????????? ???????????? ????????? ???????????????'),
      );
      return;
    }

    var objLink = {
      title: '????????? ??????',
      context: context.trim(),
      func: {
        name: '???????????? ??????',
        type: 'link',
        data: {
          baseURL: checkURL(url).url,
        },
      },
    };

    if (recipient.length === 0 && !allCheck) {
      setIsLoading(false);
      Alert.alert(
        getDic('NoticeTalk', '?????????'),
        getDic('Msg_Note_EnterRecipient'),
      );
      return;
    }

    try {
      const sendData = {
        subjectId: subjectId.toString(),
        targets: allCheck ? userCompanyCode : selectTargets,
        message: url ? JSON.stringify(objLink) : context.trim(),
        companyCode: userInfo.CompanyCode,
        push: 'Y',
      };

      //????????? ??????
      const { data } = await chatsvr('post', '/notice/talk', sendData);

      if (data) {
        setIsLoading(false);
        Alert.alert(
          getDic('NoticeTalk', '?????????'),
          getDic('Msg_Noti_SendSuccess', '?????? ????????? ??????????????????.'),
        );
        navigation.navigate('UserSetting', {});
        return;
      } else {
        setIsLoading(false);
        Alert.alert(
          getDic('NoticeTalk', '?????????'),
          getDic('Msg_Noti_SendFail', '?????? ????????? ??????????????????.'),
        );
      }
    } catch (err) {
      console.log('Send Error   ', err);
    }
  }

  const customMenus = [
    {
      switch: getDic('All_Recipient', '????????????'),
      iconStyle: styles.button,
    },
  ];

  return (
    <SafeAreaView style={styles.contanier}>
      <View style={{ flex: 0.9 }}>
        <NoteHeader
          title={getDic('All_Recipient', '?????????')}
          menus={customMenus}
          setAllCheck={setAllCheck}
        />
        <ScrollView>
          <ChannelList
            channelName={channelName}
            channelId={channelId}
            channelPhoto={channelPhoto}
          />
          <OrgList
            setRecipient={setRecipient}
            allCheck={allCheck}
            setAllCheck={setAllCheck}
          />
          <ContextBox
            setChangeText={setChangeText}
            changeText={changeText}
            url={url}
            setUrl={setUrl}
          />
        </ScrollView>
      </View>
      <View style={{ flex: 0.1 }}>
        <TouchableOpacity
          onPress={() => {
            handleSend();
          }}
          style={{ alignItems: 'center' }}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              width: '90%',
              height: 50,
              borderRadius: 3,
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <LoadingWrap />
            ) : (
              <Text style={styles.sendBtnTxt}>{getDic('Send')}</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  sendBtnTxt: {
    color: 'white',
    fontSize: 18,
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default withSecurityScreen(NoticeTalk);
