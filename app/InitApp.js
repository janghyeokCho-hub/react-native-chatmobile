import React, { useState } from 'react';
import { getServerConfigs, initHostInfo } from '@/config';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNExitApp from 'react-native-exit-app';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import KeySpacer from '@C/common/layout/KeySpacer';
import LoadingWrap from '@C/common/LoadingWrap';
import DropDownIcon from '@COMMON/icons/DropDownIcon';
import { getBottomPadding } from '@/lib/device/common';
import { getDictionary } from '@/lib/common';

// OS 폰트 크기 무시
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

const checkDomain = domain => {
  const regex = /(https?|http:\/\/.*):(\d*)\/?(.*)/;
  let isURL = false;
  let result = domain.match(regex);
  let url = '';

  if (result == null || result[2] != '') return { isURL: isURL, url: url };

  if (result[1] != 'https' && result[1] != 'http')
    return { isURL: isURL, url: url };

  if (result[3].charAt(0) === '/') return { isURL: true, url: result[0] };
};

const langList = [
  { name: '한국어', value: 'ko' },
  { name: 'Eng', value: 'en' },
  { name: '日本語', value: 'ja' },
  { name: '中國語', value: 'zh' },
];

const InitApp = ({ onRerender }) => {
  const [loading, setLoading] = useState(false);
  const [viewDropDownMenu, setViewDropDownMenu] = useState(false);
  const [domain, setDomain] = useState('');
  const [selectedLang, setSelectedLang] = useState({
    name: '한국어',
    value: 'ko',
  });

  const handleConfig = () => {
    // Domain 검사 실시
    setLoading(true);

    const result = checkDomain(domain);
    if (result.isURL) {
      getServerConfigs(domain)
        .then(({ data }) => {
          const setConfigs = async (config, domain) => {
            let flag = false;
            try {
              // EUM HOST INFORMATION
              AsyncStorage.setItem('EHINF', domain);

              // EUM SETTING INFORMATION
              AsyncStorage.setItem('ESETINF', JSON.stringify(config));
              flag = true;
            } catch (e) {
              AsyncStorage.removeItem('ESETINF');
              const result = await initHostInfo();
            }

            return flag;
          };
          if (data.status === 'SUCCESS') {
            if (setConfigs(data.result, domain)) {
              // App 종료
              Alert.alert(
                getDictionary(
                  '이음톡;Eumtalk;Eumtalk;Eumtalk;',
                  selectedLang.value,
                ),
                getDictionary(
                  '도메인이 변경되어 어플리케이션이 종료됩니다.;Domain infromation changed. Application will be exit.;Domain infromation changed. Application will be exit.;Domain infromation changed. Application will be exit.',
                  selectedLang.value,
                ),
                [
                  {
                    text: getDictionary('확인;Ok;Ok;Ok;', selectedLang.value),
                    onPress: () => {
                      RNExitApp.exitApp();
                    },
                  },
                ],
                {
                  cancelable: false,
                },
              );
            } else {
              console.log(data);
              // 경고
              Alert.alert(
                getDictionary(
                  '이음톡;Eumtalk;Eumtalk;Eumtalk;',
                  selectedLang.value,
                ),
                getDictionary(
                  '잘못된 도메인 명입니다. 다시 입력해주세요.;Invalid domain. Please try again.;Invalid domain. Please try again.;Invalid domain. Please try again.;',
                  selectedLang.value,
                ),
                [{ text: getDictionary('확인;Ok;Ok;Ok;', selectedLang.value) }],
                {
                  cancelable: true,
                },
              );
              setLoading(false);
            }
          }
        })
        .catch(error => {
          console.log('connection error >>>', error);
          Alert.alert(
            getDictionary(
              '이음톡;Eumtalk;Eumtalk;Eumtalk;',
              selectedLang.value,
            ),
            getDictionary(
              '잘못된 도메인 명입니다. 다시 입력해주세요.;Invalid domain. Please try again.;Invalid domain. Please try again.;Invalid domain. Please try again.;',
              selectedLang.value,
            ),
            [{ text: getDictionary('확인;Ok;Ok;Ok;', selectedLang.value) }],
            {
              cancelable: true,
            },
          );
          setLoading(false);
        });
    } else {
      setLoading(false);
      Alert.alert(
        getDictionary('이음톡;Eumtalk;Eumtalk;Eumtalk;', selectedLang.value),
        getDictionary(
          '잘못된 도메인을 입력하셨습니다.\r\n입력한 도메인을 확인 후 다시 시도해주세요.;Wrong domain input.\r\nCheck domain information.;Wrong domain input.\r\nCheck domain information.;Wrong domain input.\r\nCheck domain information.',
          selectedLang.value,
        ),
        [
          {
            text: getDictionary('확인;Ok;Ok;Ok;', selectedLang.value),
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  };

  return (
    <>
      {!loading && (
        <View style={styles.container}>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View style={styles.LoginBox}>
              <TextInput
                style={styles.textForm_Type1}
                placeholder={getDictionary(
                  '도메인을 입력하세요.;Input your domain.;Input your domain.;Input your domain.;',
                  selectedLang.value,
                )}
                placeholderTextColor={'#AAA'}
                value={domain}
                onChangeText={text => setDomain(text)}
              />

              <TouchableOpacity
                style={styles.LoginBtn_Type1}
                onPress={handleConfig}
              >
                <Text style={styles.LoginBtn_Type1_Text}>
                  {getDictionary('확인;Ok;Ok;Ok;', selectedLang.value)}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
          <View
            style={{
              marginLeft: 'auto',
              marginRight: 53,
              marginTop: 15,
            }}
          >
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                onPress={() => {
                  setViewDropDownMenu(!viewDropDownMenu);
                }}
                style={{
                  flexDirection: 'row',
                  margin: 'auto',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={styles.dropdownText}>{selectedLang.name}</Text>
                <View
                  style={{
                    marginLeft: 'auto',
                    marginRight: 7,
                    marginTop: 3,
                  }}
                >
                  <DropDownIcon />
                </View>
              </TouchableOpacity>
              {viewDropDownMenu && (
                <ScrollView style={styles.dropdownMenuContainer}>
                  {langList.map(data => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedLang(data);
                          setViewDropDownMenu(false);
                        }}
                      >
                        <Text style={styles.dropdownMenuText}>{data.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
          <KeySpacer spacing={getBottomPadding()} />
        </View>
      )}
      {loading && <LoadingWrap />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  Logo: {
    width: 270,
    height: 150,
    marginBottom: 20,
    marginTop: 100,
    resizeMode: 'contain',
  },
  LoginBox: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: wp('13%'),
    paddingRight: wp('13%'),
    paddingTop: hp('10%'),
    width: '100%',
    marginTop: hp('35%'),
  },
  textForm_Type1: {
    borderWidth: 0.5,
    borderColor: '#999999',
    color: '#000',
    width: '100%',
    height: hp('6%'),
    padding: 10,
  },
  LoginBtn_Type1: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: hp('6%'),
    backgroundColor: '#12cfee',
    marginTop: hp('1%'),
  },
  LoginBtn_Type1_Text: {
    color: 'white',
  },
  dropdownContainer: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 110,
    justifyContent: 'center',
    alignContent: 'center',
  },
  dropdownText: {
    fontSize: 17,
    marginLeft: 9,
    marginRight: 25,
    paddingBottom: 7,
  },
  dropdownMenuText: {
    fontSize: 17,
    marginLeft: 9,
    marginTop: 9,
    justifyContent: 'center',
  },
  dropdownMenuContainer: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 120,
    justifyContent: 'center',
    alignContent: 'center',
    textAlignVertical: 'center',
  },
});

export default InitApp;
