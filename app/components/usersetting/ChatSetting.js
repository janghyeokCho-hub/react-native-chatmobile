import React, { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, View, Alert, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { G, Path } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';

import IconButton from '@COMMON/buttons/IconButton';
import * as db from '@/lib/appData/connector';
import * as dbAction from '@/lib/appData/action';
import { restartApp } from '@/lib/device/common';
import {
  getConfig,
  getSetting,
  getDic,
  getServerDictionary,
  getServerConfigs,
  getServer,
} from '@/config';
import { openModal, changeModal, closeModal } from '@/modules/modal';
import { setUserSetting } from '@/lib/api/setting';

const getJobInfoName = jobInfo => {
  switch (jobInfo) {
    case 'PN':
      return getDic('JobPosition', '직위');
    case 'TN':
      return getDic('JobTitle', '직책');
    case 'LN':
      return getDic('JobLevel', '직급');
    default:
      return getDic('DoNotUse', '사용안함');
  }
};

const getMultiDicName = multiDic => {
  let multiDicName = '';

  switch (multiDic) {
    case 'ko':
      multiDicName = '한국어';
      break;
    case 'en':
      multiDicName = 'Eng';
      break;
    case 'ja':
      multiDicName = '日本語';
      break;
    case 'zh':
      multiDicName = '中國語';
      break;
    default:
      multiDicName = '사용안함';
  }

  return multiDicName;
};

const getFontSizeName = fontSize => {
  let name = '';

  switch (fontSize) {
    case 'l':
      name = getDic('Large');
      break;
    case 's':
      name = getDic('Small');
      break;
    default:
      name = getDic('Medium');
      break;
  }

  return name;
};

const getThemeColor = theme => {
  let color = '#fff';

  const themeLists = getConfig('ClientThemeList');

  const findItem = themeLists.find(item => item.name === theme);
  if (findItem) color = findItem.value;

  return color;
};

const ChatSetting = ({ navigation }) => {
  const { sizes } = useTheme();
  const { syncDate, userInfo } = useSelector(({ login }) => ({
    syncDate: login.registDate,
    userInfo: login.userInfo,
  }));

  const [fontSize, setFontSize] = useState(getSetting('fontSize') || 'm');
  const [theme, setTheme] = useState(getSetting('theme') || 'blue');
  const [jobInfo, setJobInfo] = useState(getSetting('jobInfo') || 'PN');
  const [multiDicInfo, setMultiDicInfo] = useState(getSetting('lang') || 'ko');
  const useUserSettingSync = useMemo(
    () => getConfig('UseUserSettingSync', 'N') === 'Y',
    [],
  );
  const dispatch = useDispatch();

  useEffect(() => {
    AsyncStorage.getItem('covi_user_jobInfo').then(data => {
      setJobInfo(data);
    });
  }, []);

  const closeMultiDicInfoModal = useCallback(
    multiDic => {
      Alert.alert(
        null,
        getDic('Msg_ApplySettingInfo'),
        [
          { text: getDic('Cancel') },
          {
            text: getDic('Ok'),
            onPress: async () => {
              const domain = await AsyncStorage.getItem('EHINF');
              const response = await getServerDictionary(domain, multiDic);
              if (response.data?.status === 'SUCCESS') {
                await AsyncStorage.setItem(
                  'ESETINF',
                  JSON.stringify(response.data.result),
                );
              }
              AsyncStorage.setItem('covi_user_lang', multiDic);
              AsyncStorage.removeItem('ESETINF');

              if (useUserSettingSync) {
                try {
                  // Sync lang with server
                  await setUserSetting({ clientLang: multiDic });
                } catch (err) {
                  // ...
                }
              }
              setMultiDicInfo(multiDic);
              dispatch(closeModal());
              restartApp();
            },
          },
        ],
        { cancelable: true },
      );
    },
    [dispatch, useUserSettingSync],
  );

  const closeJobInfoModal = useCallback(
    _jobInfo => {
      Alert.alert(
        null,
        getDic('Msg_ApplySettingInfo'),
        [
          { text: getDic('Cancel') },
          {
            text: getDic('Ok'),
            onPress: async () => {
              AsyncStorage.setItem('covi_user_jobInfo', _jobInfo);
              setJobInfo(_jobInfo);
              if (useUserSettingSync) {
                try {
                  // Sync jobInfo with server
                  await setUserSetting({ jobInfo: _jobInfo });
                } catch (err) {
                  // ...
                }
              }
              dispatch(closeModal());
              restartApp();
            },
          },
        ],
        { cancelable: true },
      );
    },
    [dispatch, useUserSettingSync],
  );

  const openMultiDicModal = useCallback(() => {
    getServerConfigs(getServer('HOST')).then(res => {
      const clientLangList = res.data.result.config.ClientLangList;
      if (clientLangList && clientLangList.length > 0) {
        let modalBtn = [];
        clientLangList.map(data => {
          modalBtn.push({
            title: data.name,
            onPress: () => {
              closeMultiDicInfoModal(data.value);
            },
          });
        });
        dispatch(
          changeModal({
            modalData: {
              closeOnTouchOutside: true,
              type: 'normal',
              buttonList: modalBtn,
            },
          }),
        );
        dispatch(openModal());
      }
    });
  }, [dispatch]);

  const openJobInfoModal = useCallback(() => {
    const config = getConfig('jobCode', [
      { value: 'NN' },
      { value: 'PN' },
      { value: 'LN' },
      { value: 'TN' },
    ]);

    var modalBtn = [];

    config.map(data => {
      modalBtn.push({
        title: getJobInfoName(data.value),
        onPress: () => {
          closeJobInfoModal(data.value);
        },
      });
    });

    dispatch(
      changeModal({
        modalData: {
          closeOnTouchOutside: true,
          type: 'normal',
          buttonList: modalBtn,
        },
      }),
    );
    dispatch(openModal());
  }, [dispatch]);

  const openFontSizeModal = useCallback(() => {
    const modalBtn = [
      {
        title: getDic('Small'),
        size: 12,
        onPress: () => {
          closeFontSizeModal('s');
        },
      },
      {
        title: getDic('Medium'),
        size: 14,
        onPress: () => {
          closeFontSizeModal('m');
        },
      },
      {
        title: getDic('Large'),
        size: 17,
        onPress: () => {
          closeFontSizeModal('l');
        },
      },
    ];

    dispatch(
      changeModal({
        modalData: {
          closeOnTouchOutside: true,
          type: 'fontSizeSelector',
          buttonList: modalBtn,
        },
      }),
    );
    dispatch(openModal());
  }, [dispatch]);

  const closeFontSizeModal = useCallback(
    fontSize => {
      Alert.alert(
        null,
        getDic('Msg_ApplySettingInfo'),
        [
          { text: getDic('Cancel') },
          {
            text: getDic('Ok'),
            onPress: () => {
              AsyncStorage.setItem('covi_user_fontSize', fontSize);
              setFontSize(fontSize);
              dispatch(closeModal());
              restartApp();
            },
          },
        ],
        { cancelable: true },
      );
    },
    [dispatch],
  );

  const openThemeModal = useCallback(() => {
    const themeLists = getConfig('ClientThemeList');

    const modalBtn = themeLists.map(theme => {
      return {
        color: theme.value,
        onPress: () => {
          closeThemeModal(theme.name);
        },
      };
    });

    dispatch(
      changeModal({
        modalData: {
          closeOnTouchOutside: true,
          type: 'colorBox',
          buttonList: modalBtn,
        },
      }),
    );
    dispatch(openModal());
  }, [dispatch]);

  const closeThemeModal = useCallback(
    theme => {
      Alert.alert(
        null,
        getDic('Msg_ApplySettingInfo'),
        [
          { text: getDic('Cancel') },
          {
            text: getDic('Ok'),
            onPress: () => {
              AsyncStorage.setItem('covi_user_theme', theme);
              setFontSize(fontSize);
              dispatch(closeModal());
              restartApp();
            },
          },
        ],
        { cancelable: true },
      );
    },
    [dispatch],
  );

  return (
    <View style={styles.container}>
      {/* 개발 이후 표시 */}
      {
        <>
          <IconButton
            title={getDic('FontSize')}
            onPress={() => {
              openFontSizeModal();
            }}
            icon={
              <View style={styles.fontSizeView}>
                <Text style={{ fontSize: sizes.default }}>
                  {getFontSizeName(fontSize)}
                </Text>
              </View>
            }
          />
          <IconButton
            title={getDic('Theme')}
            onPress={() => {
              openThemeModal();
            }}
            icon={
              <View style={styles.fontSizeView}>
                <View
                  style={{
                    width: 15,
                    height: 15,
                    backgroundColor: getThemeColor(theme),
                  }}
                />
              </View>
            }
          />
        </>
      }
      <IconButton
        title={getDic('JobName')}
        onPress={() => {
          openJobInfoModal();
        }}
        icon={
          <View style={styles.fontSizeView}>
            <Text style={{ fontSize: sizes.default }}>
              {getJobInfoName(jobInfo)}
            </Text>
          </View>
        }
      />
      <IconButton
        title={getDic('ChangeLang')}
        onPress={() => {
          openMultiDicModal();
        }}
        icon={
          <View style={styles.fontSizeView}>
            <Text style={{ fontSize: sizes.default }}>
              {getMultiDicName(multiDicInfo)}
            </Text>
          </View>
        }
      />
      <IconButton
        title={getDic('DataSync')}
        onPress={() => {
          Alert.alert(
            null,
            getDic('Msg_reSyncConfirm'),
            [
              { text: getDic('Cancel') },
              {
                text: getDic('Ok'),
                onPress: () => {
                  dbAction.refreshAppData().then(() => {
                    Alert.alert(
                      null,
                      getDic('Msg_SyncRestart'),
                      [
                        {
                          text: getDic('Ok'),
                          onPress: () => {
                            restartApp();
                          },
                        },
                      ],
                      { cancelable: true },
                    );
                  });
                },
              },
            ],
            { cancelable: true },
          );
        }}
        icon={
          <View style={styles.syncBtn}>
            <Svg width="16.833" height="16.37" viewBox="0 0 11.833 10.37">
              <Path
                d="M12.794,8.064h-1.5v-.13a5.172,5.172,0,1,0-1.983,4.215L8.423,11.2A3.891,3.891,0,1,1,10,7.934v.13H8.313l2.209,2.462,2.272-2.462Z"
                transform="translate(-0.961 -2.878)"
                fill="#222"
              />
            </Svg>
          </View>
        }
      />
      {/* 향후 숨겨질 버튼 */}
      <IconButton
        title={getDic('LocalDataRemove')}
        onPress={() => {
          Alert.alert(
            null,
            '오래된 메시지들이 삭제될 수 있습니다.\n로컬 데이터를 삭제하시겠습니까?',
            [
              { text: getDic('Cancel'), onPress: () => {} },
              {
                text: getDic('Ok'),
                onPress: () => {
                  db.deleteDabase(userInfo.id, () => {
                    Alert.alert(
                      null,
                      '성공적으로 삭제되었습니다.\n앱을 재시작 합니다.',
                      [
                        {
                          text: getDic('Ok'),
                          onPress: () => {
                            restartApp();
                          },
                        },
                      ],
                      { cancelable: true },
                    );
                  });
                },
              },
            ],
            { cancelable: true },
          );
        }}
        icon={
          <View style={styles.appDataDelBtn}>
            <Svg width="16.255" height="20.389" viewBox="0 0 12.255 13.389">
              <G transform="translate(0)">
                <Path
                  d="M21.565,4.027h.913v8.906a.458.458,0,0,0,.457.457h8.373a.458.458,0,0,0,.457-.457V4.027h1.142a.457.457,0,1,0,0-.913H30.729a3.251,3.251,0,0,0-.83-2.1A3.608,3.608,0,0,0,27.152,0a3.307,3.307,0,0,0-2.664,1.02,3.026,3.026,0,0,0-.639,2.093H21.565a.457.457,0,1,0,0,.913Zm3.608-2.421A2.45,2.45,0,0,1,27.144.913a2.76,2.76,0,0,1,2.078.716,2.367,2.367,0,0,1,.586,1.484H24.762A2.157,2.157,0,0,1,25.173,1.606Zm5.678,2.421v8.449h-7.46V4.027Z"
                  transform="translate(-21.108)"
                  fill="#222"
                />
                <Path
                  d="M174.565,192.883a.458.458,0,0,0,.457-.457v-5.252a.457.457,0,1,0-.913,0v5.252A.458.458,0,0,0,174.565,192.883Z"
                  transform="translate(-169.998 -181.701)"
                  fill="#222"
                />
                <Path
                  d="M282.232,192.883a.458.458,0,0,0,.457-.457v-5.252a.457.457,0,1,0-.913,0v5.252A.458.458,0,0,0,282.232,192.883Z"
                  transform="translate(-274.772 -181.701)"
                  fill="#222"
                />
              </G>
            </Svg>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  fontSizeView: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  syncBtn: {
    marginLeft: 'auto',
    fontSize: 16,
  },
  appDataDelBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
export default ChatSetting;
