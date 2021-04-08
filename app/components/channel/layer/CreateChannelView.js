import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CommonActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { openModal, changeModal } from '@/modules/modal';
import CameraIcon from '@/components/common/icons/CameraIcon';
import LoadingWrap from '@COMMON/LoadingWrap';
import TitleInputBox from '@COMMON/TitleInputBox';
import RadioGroupBox from '@/components/common/RadioGroupBox';
import DropDownBox from '@COMMON/dropdown/DropDownBox';
import DropDownIcon from '@COMMON/icons/DropDownIcon';
import * as channelApi from '@API/channel';
import * as imageUtil from '@/lib/imagePickUtil';
import { getDic, getConfig} from '@/config';
import { useTheme } from '@react-navigation/native';
import { channel } from 'redux-saga';

const CreateChannelView = ({ navigation, route }) => {
  const { colors, sizes } = useTheme();
  const { headerName } = route.params;
  const handleClose = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, []);

  const [loading, setLoading] = useState(false);
  const [channelIcon, setChannelIcon] = useState(null);
  const [channelName, setChannelName] = useState('');
  const [value, setValue] = useState({});
  const [viewDropDownMenu, setViewDropDownMenu] = useState(false);
  const [channelDescription, setChannelDescription] = useState('');
  const [channelCategory, setChannelCategory] = useState('');
  const [channelCategoryList, setChannelCategoryList] = useState([]);
  const [channelopenType, setChannelopenType] = useState({
    id: 'P',
    name: '비공개',
  });
  const [channelPassword, setChannelPassword] = useState('');
  
  const userInfo = useSelector(({ login }) => login.userInfo);
  
  const IsSaaSClient = getConfig('IsSaaSClient', 'N');

  const dispatch = useDispatch();

  useEffect(() => {
    if(IsSaaSClient == 'Y'){
      channelApi.getChannelCategoryListForSaaS({companyCode:userInfo.CompanyCode}).then(response => {
        setChannelCategoryList(response.data.result);
      });
    }else{
      channelApi.getChannelCategoryList().then(response => {
        setChannelCategoryList(response.data.result);
      });
    }
  }, []);

  const handleImageChange = file => {
    if (file != undefined) {
      if (Platform.OS === 'ios') handleImageChangeForiOS(file);
      else handleImageChangeForAndroid(file);
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

  const handleCreateChannel = () => {
    if (!channelName) {
      Alert.alert(
        getDic('Eumtalk'),
        getDic('Msg_InputChannelName'),
        [{ text: getDic('Ok') }],
        {
          cancelable: true,
        },
      );
    } else if (channelopenType.id !== 'O' && channelPassword === '') {
      Alert.alert(
        getDic('Eumtalk'),
        getDic('Msg_InputChannelPassword'),
        [{ text: getDic('Ok') }],
        {
          cancelable: true,
        },
      );
    } else if (!channelCategory){
      Alert.alert(
        getDic('Eumtalk'),
        getDic('Msg_InputChannelCategory'),
        [{ text: getDic('Ok') }],
        {
          cancelable: true,
        },
      );
    } 
    else {
      navigation.navigate('SelectChannelMemberView', {
        headerName: getDic('CreateChannel'),
        name: channelName,
        icon: channelIcon,
        description: channelDescription,
        categoryCode: channelCategory,
        openType: channelopenType.id,
        password: channelPassword,
      });
    }
  };

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
        <TouchableOpacity
          onPress={() => {
            handleCreateChannel();
          }}
          style={styles.okbtnView}
        >
          <View style={styles.topBtn}>
            <Text style={{ color: colors.primary, fontSize: sizes.default }}>
              {getDic('Next')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
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
            {!channelIcon || !channelIcon.data ? (
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
            ) : (
              <View>
                <Image
                  source={{ uri: channelIcon.uri }}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 25,
                    borderColor: '#e0e0e0',
                    borderWidth: 1.0,
                  }}
                />
              </View>
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
              {!channelCategory.categoryName && (
                <Text style={styles.dropdownPlaceholder}>
                  항목을 선택해주세요
                </Text>
              )} 
              {(
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
          <View />
        </View>
        <View style={{ marginBottom: 20 }} />
        <View>
          {/* RadioBox set openType */}
          <RadioGroupBox
            title={getDic('ChannelType')}
            select={channelopenType}
            groupList={[
              { id: 'P', name: getDic('Private') },
              { id: 'O', name: getDic('Public') },
              { id: 'L', name: getDic('Permission') },
            ]}
            onChangeItem={item => {
              setChannelopenType(item);
            }}
          />
        </View>
        <View style={{ marginTop: -15 }}>
          {/* Input Password */}
          {channelopenType.id == 'L' || channelopenType.id == 'P' ? (
            <TitleInputBox
              title={getDic('ChannelPassword')}
              placeholder={getDic('Msg_InputChannelPassword')}
              onChageTextHandler={text => {
                setChannelPassword(text);
              }}
              value={channelPassword}
            />
          ) : (
            <></>
          )}
          <TouchableOpacity
            onPress={() => {
              handleCreateChannel();
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
                {getDic('Next')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  dropdownPlaceholder: {
    fontSize: 17,
    marginLeft: 9,
    marginTop: 9,
    color: '#AAA',
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

export default CreateChannelView;
