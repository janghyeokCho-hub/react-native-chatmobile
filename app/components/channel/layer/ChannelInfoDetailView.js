import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as channelApi from '@API/channel';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import NotFoundIcon from '@/components/common/icons/NotFoundIcon';
import TitleInputBox from '@COMMON/TitleInputBox';
import { getDic, getServer, getConfig } from '@/config';
import { withSecurityScreen } from '@/withSecurityScreen';

const ChannelInfoDetailView = ({ route, navigation }) => {
  const channleInfo = route.params.channelInfo;
  const [channelCategory, setChannelCategory] = useState({});
  const [channelCategoryList, setChannelCategoryList] = useState([]);

  const userInfo = useSelector(({ login }) => login.userInfo);

  const [viewDropDownMenu, setViewDropDownMenu] = useState(false);

  const IsSaaSClient = getConfig('IsSaaSClient', 'N');

  useEffect(() => {
    if (IsSaaSClient == 'Y') {
      channelApi
        .getChannelCategoryListForSaaS({ companyCode: userInfo.CompanyCode })
        .then(response => {
          setChannelCategory(channleInfo);
          setChannelCategoryList(response.data.result);
        });
    } else {
      channelApi.getChannelCategoryList().then(response => {
        setChannelCategory(channleInfo);
        setChannelCategoryList(response.data.result);
      });
    }
  }, []);

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
        <View
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
          {!channleInfo.iconPath ? (
            <>
              <NotFoundIcon color="#ccc" width="85" height="85" />
              <Text
                style={{
                  fontSize: 18,
                  color: '#777',
                  marginTop: 10,
                }}
              >
                {getDic('ChannelIconNotExist')}
              </Text>
            </>
          ) : (
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
          )}
        </View>
      </View>
      <View>
        {/* Input ChannelName */}
        <TitleInputBox
          editable={false}
          title={getDic('ChannelName')}
          placeholder={getDic('Msg_InputChannelName')}
          onChageTextHandler={text => {
            setChannelName(text);
          }}
          value={channleInfo.roomName}
        />
        {/* Input ChannelDescription */}
        <TitleInputBox
          editable={false}
          title={getDic('ChannelDescription')}
          placeholder={getDic('Msg_InputChannelDesc')}
          onChageTextHandler={text => {
            setChannelDescription(text);
          }}
          value={channleInfo.description}
        />
      </View>
      <View style={{ margin: 21 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
          {getDic('Category')}
        </Text>
        <View style={styles.dropdownContainer}>
          <View
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
          </View>
        </View>
        <View />
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

export default withSecurityScreen(ChannelInfoDetailView);
