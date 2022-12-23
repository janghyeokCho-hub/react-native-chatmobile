import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import CameraIcon from '@/components/common/icons/CameraIcon';
import DropDownIcon from '@COMMON/icons/DropDownIcon';
import { openModal, changeModal } from '@/modules/modal';
import TitleInputBox from '@COMMON/TitleInputBox';
import { getDic, getServer, getConfig } from '@/config';
import { useTheme } from '@react-navigation/native';
import * as channelApi from '@API/channel';
import * as imageUtil from '@/lib/imagePickUtil';
import LoadingWrap from '@COMMON/LoadingWrap';
import { modifyChannelInfo } from '@/modules/channel';
import { uploadChannelIcon } from '@/lib/api/channel';
import { withSecurityScreen } from '@/withSecurityScreen';

const ChangeChannelInfoView = ({ route, navigation }) => {
  const { colors, sizes } = useTheme();
  const channleInfo = route.params.channelInfo;

  const userInfo = useSelector(({ login }) => login.userInfo);

  const [loading, setLoading] = useState(false);
  const [channelIcon, setChannelIcon] = useState({});
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [channelCategory, setChannelCategory] = useState({});
  const [channelCategoryList, setChannelCategoryList] = useState([]);
  const [viewDropDownMenu, setViewDropDownMenu] = useState(false);

  const IsSaaSClient = getConfig('IsSaaSClient', 'N');

  useEffect(() => {
    if (IsSaaSClient == 'Y') {
      channelApi
        .getChannelCategoryListForSaaS({ companyCode: userInfo.CompanyCode })
        .then(response => {
          setChannelCategory({
            categoryName: channleInfo.categoryName,
            categoryCode: channleInfo.categoryCode,
          });
          setChannelCategoryList(response.data.result);
          setChannelName(channleInfo.roomName);
          setChannelDescription(channleInfo.description);
        });
    } else {
      channelApi.getChannelCategoryList().then(response => {
        setChannelCategory({
          categoryName: channleInfo.categoryName,
          categoryCode: channleInfo.categoryCode,
        });
        setChannelCategoryList(response.data.result);
        setChannelName(channleInfo.roomName);
        setChannelDescription(channleInfo.description);
      });
    }
  }, []);

  const handleImageChange = file => {
    if (file != undefined) {
      if (Platform.OS === 'ios') {
        handleImageChangeForiOS(file);
      } else {
        handleImageChangeForAndroid(file);
      }
    }
  };

  const handleImageChangeForiOS = file => {
    const files = [];
    if (file.fileName == null) {
      let filename = file.uri.split('/');
      filename = filename[filename.length - 1];
      files.push({
        name: filename,
        size: file.fileSize,
        type: file.type,
        uri: file.uri ? file.uri : file.origURL,
        data: file.data,
      });
    } else {
      files.push({
        name: file.fileName,
        size: file.fileSize,
        type: file.type,
        uri: file.uri ? file.uri : file.origURL,
        data: file.data,
      });
    }
    setChannelIcon(files[0]);
    setLoading(false);
  };

  const handleImageChangeForAndroid = file => {
    const files = [];
    if (file.fileName == null) {
      let filename = file.uri.split('/');
      filename = filename[filename.length - 1];
      files.push({
        name: filename,
        size: file.fileSize,
        type: file.type,
        uri: file.uri,
        path: file.path,
        data: file.data,
      });
    } else {
      files.push({
        name: file.fileName,
        size: file.fileSize,
        type: file.type,
        uri: file.uri,
        path: file.path,
        data: file.data,
      });
    }

    setChannelIcon(files[0]);
    setLoading(false);
  };

  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 50,
          backgroundColor: 'white',
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: '#f0f0f0',
            marginTop: -15,
            marginBottom: 15,
            width: 180,
            borderRadius: 25,
            height: 180,
            justifyContent: 'center',
            alignItems: 'center',
            margin: 'auto',
          }}
          onPress={() => {
            const modalBtn = [
              {
                title: '카메라로 촬영하기',
                onPress: () => {
                  imageUtil.selectImageWithCamera(
                    data => {
                      setLoading(true);
                      handleImageChange(data);
                    },
                    () => {
                      setLoading(false);
                    },
                  );
                },
              },
              {
                title: '갤러리에서 선택하기',
                onPress: () => {
                  setLoading(true);
                  imageUtil.selectImageWithLibrary(
                    data => {
                      setLoading(true);
                      handleImageChange(data);
                    },
                    () => {
                      setLoading(false);
                    },
                  );
                },
              },
            ];
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
          }}
        >
          {channelIcon.data ? (
            <View>
              <Image
                source={{
                  uri: channelIcon.uri,
                }}
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 25,
                  borderColor: '#e0e0e0',
                  borderWidth: 1.0,
                }}
              />
            </View>
          ) : (
            (!channleInfo.iconPath && (
              <>
                <CameraIcon color="#ccc" width="85" height="85" />
                <Text
                  style={{
                    fontSize: 18,
                    color: '#777',
                    marginTop: 10,
                  }}
                >
                  {getDic('AddPhoto')}
                </Text>
              </>
            )) || (
              <View>
                <Image
                  source={{ uri: getServer('HOST') + channleInfo.iconPath }}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 25,
                    borderColor: '#e0e0e0',
                    borderWidth: 1.0,
                  }}
                />
              </View>
            )
          )}
        </TouchableOpacity>
      </View>
      <View>
        {/* Input ChannelName */}
        <TitleInputBox
          title={getDic('ChannelName')}
          placeholder={getDic('Msg_InputChannelName')}
          onChageTextHandler={text => {
            setChannelName(text);
          }}
          value={channelName}
        />
        {/* Input ChannelDescription */}
        <TitleInputBox
          title={getDic('ChannelDescription')}
          placeholder={getDic('Msg_InputChannelDesc')}
          onChageTextHandler={text => {
            setChannelDescription(text);
          }}
          value={channelDescription}
        />
      </View>
      <View style={{ margin: 21 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
          {getDic('Category')}
        </Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            onPress={() => {
              setViewDropDownMenu(!viewDropDownMenu);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {(channelCategory == null && (
              <Text style={styles.dropdownText}>select any items...</Text>
            )) || (
              <Text style={styles.dropdownText}>
                {channelCategory.categoryName}
              </Text>
            )}
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
        </View>
        {viewDropDownMenu && (
          <ScrollView style={styles.dropdownMenuContainer}>
            {channelCategoryList.map(data => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    setChannelCategory(data);
                    setViewDropDownMenu(false);
                  }}
                >
                  <Text style={styles.dropdownMenuText}>
                    {data.categoryName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            let reqDatas = {
              roomId: channleInfo.roomId,
              description: channelDescription,
              roomName: channelName,
              categoryCode: channelCategory.categoryCode,
            };
            channelApi
              .modifyChannelInfo(reqDatas)
              .then(response => {
                if (response.data.status == 'SUCCESS') {
                  if (channelIcon.data) {
                    const formData = new FormData();
                    if (Platform.OS === 'ios') {
                      formData.append('file', {
                        uri: channelIcon.uri,
                        type: channelIcon.type,
                        name: channelIcon.name,
                      });
                    } else {
                      formData.append('file', {
                        uri: channelIcon.uri,
                        type: channelIcon.type,
                        name: channelIcon.name,
                      });
                    }
                    formData.append('roomId', channleInfo.roomId);

                    uploadChannelIcon(formData)
                      .then(({ data }) => {
                        // console.log(data);
                        const params = { roomId: channleInfo.roomId };
                        if (data.flag === true) {
                          params.iconPath = data.photoPath;
                          // icon 변경 추가 - 리덕스 저장
                          reqDatas = { ...reqDatas, iconPath: data.photoPath };
                        }
                        Alert.alert(
                          getDic('Eumtalk'),
                          '채널 정보가 변경 되었습니다.',
                          [
                            {
                              text: getDic('Ok'),
                            },
                          ],
                          { cancelable: true },
                        );
                        dispatch(modifyChannelInfo(reqDatas));
                        setLoading(false);
                      })
                      .catch(error => {
                        console.log(error);
                      });
                  } else {
                    Alert.alert(
                      getDic('Eumtalk'),
                      '채널 정보가 변경 되었습니다.',
                      [
                        {
                          text: getDic('Ok'),
                        },
                      ],
                      { cancelable: true },
                    );
                    dispatch(modifyChannelInfo(reqDatas));
                    setLoading(false);
                  }
                } else {
                  Alert.alert(
                    getDic('Eumtalk'),
                    '오류가 발생하였습니다. 잠시후 시도하거나 관리자에게 문의해주세요.',
                    [
                      {
                        text: getDic('Ok'),
                      },
                    ],
                    { cancelable: true },
                  );
                }
                setLoading(false);
              })
              .catch(error => {
                console.log(error);
              });
          }}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              margin: 21,
              height: 50,
              borderRadius: 3,
              marginTop: 35,
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
              {getDic('Edit')}
            </Text>
          </View>
        </TouchableOpacity>
        <View />
      </View>
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

export default withSecurityScreen(ChangeChannelInfoView);
