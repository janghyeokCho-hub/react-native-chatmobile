import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as channelApi from '@API/channel';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import Svg, { Path } from 'react-native-svg';
import { CommonActions } from '@react-navigation/native';
import { getServer, getDic } from '@/config';
import { useTheme } from '@react-navigation/native';
import { withSecurityScreen } from '@/withSecurityScreen';

const ico_plus = require('@C/assets/ico_plus.png');

const InviteExtUser = ({ route, navigation }) => {
  const { colors, sizes } = useTheme();
  const { headerName, roomId } = route.params;
  const userInfo = useSelector(({ login }) => login.userInfo);
  const [emailTxt, setEmailTxt] = useState('');
  const [oldList, setOldList] = useState([]);
  const [emailList, setEmailList] = useState([]);

  useEffect(() => {
    channelApi.getExternalUser(roomId).then(({ data }) => {
      if (data.status === 'SUCCESS') {
        setOldList(data.result.map(item => item.ExternalEmail));
      }
    });
  }, [roomId]);

  const handleClose = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, [navigation]);

  const addItem = useCallback(async () => {
    if (
      emailTxt !== '' &&
      emailList.find(item => item === emailTxt) === undefined
    ) {
      try {
        const { data: response } = await channelApi.checkExternalUser({
          roomId,
          email: emailTxt,
        });
        if (response.status === 'SUCCESS') {
          setEmailList([emailTxt, ...emailList]);
          setEmailTxt('');
        } else {
          Alert.alert(null, getDic(response.message, response.message), [
            { text: getDic('Ok') },
          ]);
        }
      } catch (err) {
        Alert.alert(null, getDic('Msg_Error'), [{ text: getDic('Ok') }]);
      }
    }
  }, [roomId, emailTxt, emailList]);

  const deleteItem = useCallback(
    email => {
      let tempList = [...emailList];
      tempList.splice(tempList.findIndex(item => item == email), 1);

      setEmailList(tempList);
    },
    [emailList],
  );

  const deleteOldItem = useCallback(
    email => {
      Alert.alert(
        null,
        getDic('Msg_CancelInviteEx'),
        [
          {
            text: getDic('Ok'),
            onPress: () => {
              channelApi.delExternalUser({ roomId, email }).then(({ data }) => {
                if (data.status == 'SUCCESS') {
                  let tempList = [...oldList];
                  tempList.splice(tempList.findIndex(item => item == email), 1);

                  setOldList(tempList);
                } else {
                  Alert.alert(null, getDic('Msg_Error'), [
                    { text: getDic('Ok') },
                  ]);
                }
              });
            },
          },
          { text: getDic('Cancel') },
        ],
        { cancelable: true },
      );
    },
    [oldList, roomId],
  );

  const handleSendMail = useCallback(async () => {
    if (emailList.length > 0) {
      const domainURL = getServer('HOST');
      const joinURL = `${domainURL}/client/login/join`;
      try {
        const { data: response } = await channelApi.sendExternalUser({
          roomId,
          emailList: emailList.toString(),
          joinURL,
          registerInfo: JSON.stringify({
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.mailAddress,
          }),
        });
        console.log('Response   ', response);
        let alertMsg = '';
        if (response.status == 'SUCCESS') {
          alertMsg = getDic('Msg_SendInviteMail');
          setOldList([...oldList, ...emailList]);
          setEmailList([]);
        } else {
          alertMsg = getDic('Msg_Error');
        }
        Alert.alert(null, alertMsg, [{ text: getDic('Ok') }]);
      } catch (err) {
        Alert.alert(null, getDic('Msg_Error'), [{ text: getDic('Ok') }]);
      }
    } else {
      Alert.alert(null, getDic('Msg_NoAddMail'), [{ text: getDic('Ok') }]);
    }
  }, [oldList, roomId, emailList, userInfo]);

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
          <Text style={styles.modaltit}>{headerName}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {oldList.length > 0 && (
          <View style={styles.alreadyItems}>
            <Text style={{ fontWeight: '700', fontSize: 15 }}>
              {getDic('WaitExUser')}
            </Text>
            <ScrollView style={{ maxHeight: '100%' }}>
              {oldList.map(item => {
                return (
                  <TouchableOpacity
                    key={`old_${item}`}
                    onPress={() => {
                      deleteOldItem(item);
                    }}
                  >
                    <View style={styles.emailItem}>
                      <View style={styles.delBtnView}>
                        <Svg width="8" height="8" viewBox="0 0 8 8">
                          <Path
                            d="M128.45,136a.554.554,0,0,0,.393.168.539.539,0,0,0,.393-.168l3.049-3.045L135.332,136a.554.554,0,0,0,.393.168.539.539,0,0,0,.393-.168.569.569,0,0,0,0-.794l-3.039-3.035,3.039-3.044a.569.569,0,0,0,0-.794.562.562,0,0,0-.795,0l-3.039,3.044-3.049-3.035a.562.562,0,0,0-.795.794l3.049,3.035-3.039,3.045A.541.541,0,0,0,128.45,136Z"
                            transform="translate(-128.279 -128.173)"
                            fill="#fff"
                          />
                        </Svg>
                      </View>
                      <Text>{item}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
        <View style={{ maxHeight: '40%', padding: 20 }}>
          <View style={styles.emailTxtView}>
            <TextInput
              placeholderTextColor="#AAA"
              placeholder={getDic('Msg_InputEmail')}
              value={emailTxt}
              onChangeText={text => {
                setEmailTxt(text);
              }}
              style={styles.emailTxt}
            />
            <TouchableOpacity onPress={addItem}>
              <View style={styles.plusIcon}>
                <Image source={ico_plus} />
              </View>
            </TouchableOpacity>
          </View>
          {emailList.length == 0 && (
            <View
              style={{
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Text style={{ paddingTop: 30, paddingBottom: 30 }}>
                {getDic('Msg_InputSendMail')}
              </Text>
            </View>
          )}
          {emailList.length > 0 && (
            <View style={{ paddingBottom: 20 }}>
              <ScrollView style={{ height: '100%' }}>
                {emailList.map(item => {
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        deleteItem(item);
                      }}
                    >
                      <View style={styles.emailItem}>
                        <View style={styles.delBtnView}>
                          <Svg width="8" height="8" viewBox="0 0 8 8">
                            <Path
                              d="M128.45,136a.554.554,0,0,0,.393.168.539.539,0,0,0,.393-.168l3.049-3.045L135.332,136a.554.554,0,0,0,.393.168.539.539,0,0,0,.393-.168.569.569,0,0,0,0-.794l-3.039-3.035,3.039-3.044a.569.569,0,0,0,0-.794.562.562,0,0,0-.795,0l-3.039,3.044-3.049-3.035a.562.562,0,0,0-.795.794l3.049,3.035-3.039,3.045A.541.541,0,0,0,128.45,136Z"
                              transform="translate(-128.279 -128.173)"
                              fill="#fff"
                            />
                          </Svg>
                        </View>
                        <Text>{item}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
          <TouchableOpacity onPress={handleSendMail}>
            <View
              style={{ ...styles.sendBtnView, backgroundColor: colors.primary }}
            >
              <Text style={{ ...styles.sendBtnTxt, fontSize: sizes.large }}>
                {getDic('SendInviteMail')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
  alreadyItems: {
    padding: 20,
    maxHeight: '40%',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  emailItem: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  delBtnView: {
    backgroundColor: '#999',
    width: 18,
    height: 18,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  sendBtnView: {
    height: 50,
    borderRadius: 3,
    justifyContent: 'center',
  },
  sendBtnTxt: {
    color: 'white',
    fontSize: 15,
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  emailTxtView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailTxt: {
    height: 40,
    width: '90%',
    borderColor: '#cccccc',
    borderWidth: 0.5,
    borderRadius: 20,
    paddingLeft: 25,
    paddingRight: 45,
    color: '#AAA',
  },
  plusIcon: {
    marginLeft: 10,
  },
});

export default withSecurityScreen(InviteExtUser);
