import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Image,
  PermissionsAndroid,
} from 'react-native';
import ShareExtension from 'rn-extensions-share';
import { getBottomPadding } from '@/lib/device/common';
import { getData } from '@/components/common/share/lib/device/dataUtil';
import { isJSONStr } from '@/lib/common';
import Svg, { G, Path, Circle } from 'react-native-svg';
import NetInfo from '@react-native-community/netinfo';
import ShareChatRoomList from '@COMMON/share/ChatRoom/ShareChatRoomList';
import ShareRoomMemberBox from '@COMMON/share/ChatRoom/ShareRoomMemberBox';
import ShareOrgChart from '@COMMON/share/OrgChart/ShareOrgChart';
import DialogModal from '@/components/common/share/common/DialogModal';
import LoadingWrap from '@COMMON/LoadingWrap';
import ShareProfileBox from '@COMMON/share/common/ShareProfileBox';
import SharePostBox from '@COMMON/share/common/SharePostBox';
import { getDictionary } from '@/lib/common';
import * as api from '@COMMON/share/lib/api';
import {
  shareFactory,
  getFileStat,
  messageFactory,
  getFileInfoStr,
} from '@COMMON/share/lib/share';

import { accessTokenCheck } from '@API/login';
import { initConfig, getServerConfigs, getServer, getDic } from '@/config';
import AsyncStorage from '@react-native-community/async-storage';
import { getChineseWall } from '@/lib/api/orgchart';

const cancelBtnImg = require('@C/assets/ico_cancelbutton.png');

const Share = () => {
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [loginInfo, setLoginInfo] = useState(null);
  const [step, setStep] = useState(0);

  // target select view
  // 단일 사용자 -> 최대 10명, 일반채팅방 1개만 선택 가능 ( 동시에 복수 선택 불가 )
  const [shareTarget, setShareTarget] = useState([]);
  const [selectTab, setSelectTab] = useState('C');

  // common
  const [alertVisible, setAlertVisible] = useState(false);
  const [alert, setAlert] = useState(null);

  // postBox
  const [context, setContext] = useState('');

  const getShareData = async () => {
    const shareDatas = await ShareExtension.data();
    return shareDatas;
  };

  const getTokenInfo = useCallback(async () => {
    const parentAuthData = await getData('loginInfo');

    if (isJSONStr(parentAuthData)) {
      return JSON.parse(parentAuthData);
    } else {
      return null;
    }
  }, []);

  const getNetworkState = useCallback(async () => {
    const state = await NetInfo.fetch();
    return state;
  }, []);

  const getAuth = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        null,
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }, []);

  const getAccessTokenCheck = useCallback(async tokenData => {
    let flag = false;
    const hostInfo = tokenData?.host;
    if (hostInfo) {
      const serverCheck = getServer('MANAGE');
      if (!serverCheck) {
        // 서버 정보가 없으면 서버 정보 생성
        let settings = await AsyncStorage.getItem('ESETINF');
        if (!settings) {
          const response = await getServerConfigs(hostInfo);
          settings = response.data.result;
          AsyncStorage.setItem('ESETINF', JSON.stringify(settings));
        }
        await initConfig(hostInfo, settings);
      }

      const { data } = await accessTokenCheck({
        token: tokenData.token,
        deviceType: 'm',
      });
      flag = data?.tokenInfo === 'true';
    }

    return flag;
  }, []);

  useEffect(() => {
    // Promise.All
    const initialShareComponent = async () => {
      try {
        const tokenShareData = await getTokenInfo();
        const shareDatas = await getShareData();
        const netState = await getNetworkState();
        const checkAuth = await getAuth();
        const checkTokenStatus = await getAccessTokenCheck(tokenShareData);

        if (!checkTokenStatus) {
          handleAlert(
            getDic(
              'Msg_NetworkOrLoginError',
              '네트워크가 불안정하거나 앱에 로그인된 정보가 없습니다.',
            ),
            'Alert',
            () => {
              handleClose();
            },
          );
        }

        setLoginInfo(tokenShareData);
        setShareData(shareDatas);
        setIsConnected(netState.isConnected);
        setLoading(false);

        if (tokenShareData !== null) {
          api.makeServerUtil(tokenShareData);
        }

        if (!checkAuth) {
          handleAlert('공유에 필요한 권한이 없습니다.', 'Alert', () => {
            handleClose();
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    initialShareComponent();
  }, []);

  const handleClose = () => {
    ShareExtension.close();
  };

  const handleAlert = (message, type, callback) => {
    setAlert({
      message: message,
      type: (!!type && type) || 'Alert',
      callback: () => {
        if (typeof callback === 'function') {
          callback();
        }
        setAlert(null);
        setAlertVisible(false);
      },
    });

    setAlertVisible(true);
  };

  const handleAppendItem = useCallback(
    item => {
      let targets = [];
      if (shareTarget.length > 0) {
        const currentType = shareTarget[0].type;
        if (item.type !== currentType) {
          // target 데이터 초기화 ( 타입 변경 )
          targets.push(item);
        } else {
          if (currentType === 'U' && shareTarget.length >= 10) {
            handleAlert('사용자는 최대 10명까지 선택할 수 있습니다.');
          } else if (
            (currentType === 'G' || currentType === 'R') &&
            shareTarget.length >= 1
          ) {
            handleAlert('부서 또는 채팅은 1개만 선택할 수 있습니다.');
          } else {
            targets = [item, ...shareTarget];
          }
        }
      } else {
        targets.push(item);
      }

      if (targets.length) {
        setShareTarget(targets);
      }
    },
    [shareTarget],
  );

  const handleDeleteItem = useCallback(
    ({ type, id }) => {
      const targets = shareTarget.filter(item => {
        return item.type !== type || (item.type === type && item.id !== id);
      });

      setShareTarget(targets);
    },
    [shareTarget],
  );

  const validationSend = useCallback((target, message, data) => {
    if (target.length === 0) {
      handleAlert('선택된 대상이 없습니다.');
      return false;
    }

    if (data.length === 0) {
      handleAlert('공유할 내용이 없습니다.');
      return false;
    }

    if (data[0].type === 'text' && message.trim().length === 0) {
      handleAlert('공유할 내용이 없습니다.');
      return false;
    }

    return true;
  }, []);

  const shareMessage = useCallback(
    async (shareInfo, message, files) => {
      const { blockList } = await getChineseWall({
        userId: loginInfo.id,
      });

      let shareFlag = false;
      // share file & room info
      const shareFileAndRoom = {
        type: shareInfo.type,
        targets:
          (Array.isArray(shareInfo.targets) && shareInfo.targets.join(';')) ||
          '',
        fileInfos: await getFileStat(files),
        roomType: shareInfo.roomType,
        blockList: blockList || [],
      };
      const { data: shareResult } = await shareFactory(shareFileAndRoom);

      if (shareResult.state === 'SUCCESS') {
        const messageDatas = shareResult.result.map(item => ({
          ...item,
          context: message,
          fileInfos: getFileInfoStr(item.fileInfos),
        }));

        await messageFactory(messageDatas);

        shareFlag = true;
      }

      return shareFlag;
    },
    [loginInfo],
  );

  const handleSendMessage = useCallback((target, message, data) => {
    if (validationSend(target, message, data)) {
      // 전달받은 target type이 사용자, 부서, 채팅방에 따라 처리해야 할 서버 로직 정의 및 생성
      let typeAndTargets = null;

      if (target[0].type === 'U') {
        typeAndTargets = target.reduce(
          (acc, value) => {
            let type = '';
            if (acc.type === '') {
              type =
                (value.type === 'U' && 'UR') ||
                (value.type === 'G' && 'GR') ||
                (value.type === 'R' && 'CR');
            } else {
              type = acc.type;
            }

            let targets = [...acc.targets, value.id];
            return { type, targets, roomType: null };
          },
          { type: '', targets: [] },
        );
      } else {
        const type =
          (target[0].type === 'G' && 'GR') || (target[0].type === 'R' && 'CR');

        typeAndTargets = {
          type: type,
          targets: [target[0].id],
          roomType: type === 'GR' ? null : target[0].roomType,
        };
      }

      const files = data.reduce((acc, cval) => {
        if (cval.type === 'media') {
          return [...acc, cval.value];
        } else {
          return [...acc];
        }
      }, []);

      handleAlert('메시지 전송중입니다.', 'Progress', null);

      shareMessage(typeAndTargets, message, files)
        .then(value => {
          // close dialog
          handleAlert('메시지가 발송되었습니다.', 'Alert', () => {
            ShareExtension.close();
          });
        })
        .catch(() => {
          handleAlert('메시지 발송에 실패하였습니다.');
        });
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.exitBtnView}>
          <TouchableOpacity onPress={handleClose}>
            <View style={styles.topBtn}>
              <Image source={cancelBtnImg} />
            </View>
          </TouchableOpacity>
        </View>

        {isConnected && (
          <View style={styles.okbtnView}>
            {step > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setStep(step - 1);
                }}
              >
                <View style={styles.topBtn}>
                  <Text style={{ fontSize: 14, fontWeight: '600' }}>
                    {getDictionary('이전;Back;Back;Back', 'ko')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                if (step === 0) {
                  if (shareTarget.length > 0) {
                    setStep(step + 1);
                  } else {
                    handleAlert('선택된 대상이 없습니다.');
                  }
                } else {
                  // 발송
                  handleSendMessage(shareTarget, context, shareData);
                }
              }}
            >
              <View style={styles.topBtn}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: step === 0 ? '#000' : '#12cfee',
                  }}
                >
                  {step === 0
                    ? getDictionary('다음;Next;Next;Next', 'ko')
                    : getDictionary('공유;Share;Share;Share', 'ko')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {(loading && <LoadingWrap />) || (
        <View style={styles.contentWrap}>
          {isConnected && loginInfo !== null && step === 0 && (
            <View style={styles.content}>
              <View style={styles.selectList}>
                <FlatList
                  data={shareTarget}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          handleDeleteItem({ type: item.type, id: item.id });
                        }}
                      >
                        <View style={styles.selectItem}>
                          {(item.type === 'G' || item.type === 'U') && (
                            <ShareProfileBox
                              type={item.type}
                              img={item.photoPath}
                              userName={getDictionary(item.name)}
                            />
                          )}
                          {item.type === 'R' && (
                            <View style={styles.profile}>
                              {((item.roomType === 'M' ||
                                item.filterMember.length === 1) && (
                                <ShareProfileBox
                                  type="U"
                                  userName={item.filterMember[0].name}
                                  img={item.filterMember[0].photoPath}
                                />
                              )) || (
                                <ShareRoomMemberBox
                                  type="G"
                                  data={item.filterMember}
                                  roomID={item.id}
                                  key={`rmb_${item.id}`}
                                />
                              )}
                            </View>
                          )}
                          <Text
                            style={styles.selectTxt}
                            numberOfLines={1}
                            adjustsFontSizeToFit={Platform.OS === 'android'}
                          >
                            {getDictionary(item.name)}
                          </Text>
                          <View style={styles.selectDel}>
                            <Svg width="16" height="16" viewBox="0 0 16 16">
                              <G transform="translate(-223 -91)">
                                <Circle
                                  cx="8"
                                  cy="8"
                                  r="8"
                                  transform="translate(223 91)"
                                  fill="#333"
                                />
                                <G transform="translate(228.225 96.224)">
                                  <Path
                                    d="M128.4,133.742a.393.393,0,0,0,.279.12.382.382,0,0,0,.279-.12l2.165-2.165,2.165,2.165a.393.393,0,0,0,.279.12.382.382,0,0,0,.279-.12.4.4,0,0,0,0-.565l-2.158-2.158,2.158-2.165a.4.4,0,0,0,0-.564.4.4,0,0,0-.564,0l-2.158,2.165-2.165-2.158a.4.4,0,0,0-.564.564l2.165,2.158-2.158,2.165A.385.385,0,0,0,128.4,133.742Z"
                                    transform="translate(-128.279 -128.173)"
                                    fill="#fff"
                                  />
                                </G>
                              </G>
                            </Svg>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  horizontal
                />
              </View>
              <View style={styles.tab}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectTab('C');
                  }}
                  style={[
                    styles.tabItem,
                    selectTab === 'C' ? styles.tabItemActive : null,
                  ]}
                >
                  <Text>
                    {getDictionary(
                      '조직도;Organizational Chart;Organizational Chart;',
                      'ko',
                    )}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectTab('R');
                  }}
                  style={[
                    styles.tabItem,
                    selectTab === 'R' ? styles.tabItemActive : null,
                  ]}
                >
                  <Text>{getDictionary('채팅방;Chats;Chats;', 'ko')}</Text>
                </TouchableOpacity>
              </View>
              {selectTab === 'C' && (
                <View style={styles.tabContent}>
                  <ShareOrgChart
                    selectedItems={shareTarget}
                    deleteItem={handleDeleteItem}
                    appendItem={handleAppendItem}
                  />
                </View>
              )}
              {selectTab === 'R' && (
                <View style={styles.tabContent}>
                  <ShareChatRoomList
                    selectedItems={shareTarget}
                    deleteItem={handleDeleteItem}
                    appendItem={handleAppendItem}
                  />
                </View>
              )}
            </View>
          )}
          {isConnected && loginInfo !== null && step === 1 && (
            <SharePostBox
              context={context}
              onChangeText={text => {
                setContext(text);
              }}
              shareData={shareData}
            />
          )}
        </View>
      )}

      {alertVisible && alert && (
        <DialogModal data={alert} visible={alertVisible} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 15,
    paddingBottom: 15 + getBottomPadding(),
  },
  header: {
    width: '100%',
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  exitBtnView: { width: '20%', alignItems: 'flex-start' },
  okbtnView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  topBtn: {
    marginLeft: 10,
    padding: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentWrap: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  tabContent: {
    flex: 1,
  },
  selectList: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  selectItem: {
    width: 70,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectTxt: {
    marginTop: 7,
    width: '100%',
    textAlign: 'center',
    fontSize: 13,
  },
  selectDel: {
    position: 'absolute',
    right: 3,
    top: 0,
  },
});

export default Share;
