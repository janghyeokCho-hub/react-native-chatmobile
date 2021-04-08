import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CommonActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getTopPadding, getBottomPadding } from '@/lib/device/common';
import { getChannelCategories } from '@/modules/channel';
import { getAesUtil } from '@/lib/AesUtil';
import LoadingWrap from '@COMMON/LoadingWrap';
import CategoryBox from '@COMMON/CategoryBox';
import { getDic, getConfig } from '@/config';

import * as channelApi from '@API/channel';

import EnterChannelBox from '../channelroom/controls/EnterChannelBox';
import { useTheme } from '@react-navigation/native';

const colorList = [
  '#FFC53D',
  '#15B8F6',
  '#03C284',
  '#4E9AF1',
  '#9673D9',
  '#F86A60',
];

const CategorySelectView = ({ navigation, route }) => {
  const { colors, sizes } = useTheme();
  const { headerName } = route.params;
  const handleClose = useCallback(() => {
    navigation.dispatch(CommonActions.goBack());
  }, []);

  const { userInfo, channelCategoryList, loading } = useSelector(
    ({ channel, login, loading }) => ({
      userInfo: login.userInfo,
      channelCategoryList: channel.categories,
      loading: loading['channel/GET_CHANNEL_CATEGORIES'],
    }),
  );

  const [scroller, setScroller] = useState({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchList, setSearchList] = useState([]);
  const [channelCategoryTable, setChannelCategoryTable] = useState([]);
  const [selectedChannelCategory, setSelectedChannelCategory] = useState();

  const IsSaaSClient = getConfig('IsSaaSClient', 'N');

  const dispatch = useDispatch();

  const getRandomColor = seed => {
    const AESUtil = getAesUtil();
    let result = AESUtil.encrypt(seed).substring(5);
    let colorCode = '#';
    for (let i = 0; i < 3; i++) {
      colorCode += (result.charCodeAt(i) + 0x5f).toString(16);
    }
    return colorCode;
  };

  useEffect(() => {
    let columnCnt = 0;
    let result = [];
    let flag = false;
    let columnList = [];

    channelCategoryList.map((data, index) => {
      if (!flag) {
        columnList.push({
          categoryCode: 'ALL',
          categoryName: getDic('All'),
          categoryColor: getRandomColor(data.categoryName),
        });
        columnCnt++;
        flag = true;
      }
      data = { ...data, categoryColor: colorList[index % colorList.length] };
      columnList.push(data);
      columnCnt++;
      if (columnCnt == 2) {
        result.push(columnList);
        columnList = [];
        columnCnt = 0;
      }
    });
    if (columnList.length > 0) result.push(columnList);
    setChannelCategoryTable(result);
  }, [channelCategoryList]);

  useEffect(() => {
    if (channelCategoryList === null || channelCategoryList.length === 0) {
      // SaaS 처리
      if (IsSaaSClient == 'Y') {
        dispatch(getChannelCategories({ companyCode: userInfo.CompanyCode }));
      } else {
        dispatch(getChannelCategories());
      }
    }
  }, []);

  const handleSearchChannelCategory = changeValue => {
    let searchtype = 'type';
    let searchvalue = changeValue.categoryCode;
    if (changeValue.categoryCode === 'ALL') {
      searchtype = 'name';
      searchvalue = '';
    }
    setSearchLoading(true);
    channelApi
      .searchChannel({
        type: searchtype,
        value: searchvalue,
        companyCode: userInfo.CompanyCode,
      })
      .then(({ data }) => {
        if (data.status == 'SUCCESS') {
          setSearchList(data.result);
          setSearchLoading(false);
        }
      })
      .catch(() => {
        setSearchLoading(false);
        Alert.alert(
          getDic('Eumtalk'),
          getDic('ChannelListError'),
          [{ text: getDic('Ok'), onPress: handleClose }],
          {
            cancelable: true,
          },
        );
      });
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
      </View>
      {selectedChannelCategory && (
        <View style={styles.tabButtonListContainer}>
          <View style={styles.groupContainer}>
            <View style={styles.groupButtonContainer}>
              <TouchableOpacity
                style={{ flexDirection: 'row' }}
                onPress={() => {
                  setSearchList([]);
                  setSelectedChannelCategory(null);
                }}
              >
                <Text style={{ fontSize: sizes.default }}>
                  {' '}
                  {getDic('Category')}{' '}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.groupButtonDivider}>
              <Svg width="4.518" height="7.316" viewBox="0 0 4.518 7.316">
                <Path
                  d="M9.658,8,6,11.658l.86.86,2.8-2.792,2.8,2.792.86-.86Z"
                  transform="translate(12.518 -6) rotate(90)"
                  fill="#ccc"
                />
              </Svg>
            </View>
          </View>
          <View style={styles.groupContainer}>
            <View
              style={{
                ...styles.activeGroupButtonContainer,
                backgroundColor: colors.primary,
              }}
            >
              <Text
                style={{ ...styles.activeGroupButton, fontSize: sizes.default }}
              >
                {' '}
                {selectedChannelCategory.categoryName}{' '}
              </Text>
            </View>
          </View>
        </View>
      )}
      {!selectedChannelCategory && loading && <LoadingWrap />}
      {!selectedChannelCategory && !loading && channelCategoryList && (
        <ScrollView
          ref={_scroller => {
            setScroller(_scroller);
          }}
          onContentSizeChange={(width, height) => {
            scroller.scrollTo({ y: height });
          }}
        >
          <View style={{ flexDirection: 'column' }}>
            {channelCategoryTable.map(table => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    marginRight: 'auto',
                    marginTop: 12,
                    justifyContent: 'center',
                    alignContent: 'center',
                  }}
                >
                  {table.map(data => {
                    return (
                      <CategoryBox
                        title={data.categoryName}
                        icon={data}
                        onPress={() => {
                          setSelectedChannelCategory(data);
                          handleSearchChannelCategory(data);
                        }}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
      {searchLoading && <LoadingWrap />}
      {!searchLoading && searchList && (
        <FlatList
          data={searchList}
          keyExtractor={item => item.roomID}
          renderItem={({ item }) => {
            return (
              <EnterChannelBox navigation={navigation} channelInfo={item} />
            );
          }}
        />
      )}
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
  contentWrap: {
    padding: 15,
    flex: 1,
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
    padding: 18,
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
  tabButtonListContainer: {
    marginTop: 21,
    marginLeft: 21,
    marginBottom: 10,
    flexDirection: 'row',
  },
  groupContainer: {
    flexDirection: 'row',
  },
  activeGroupButtonContainer: {
    borderRadius: 5,
    padding: 5,
  },
  activeGroupButton: {
    color: 'white',
    fontWeight: 'bold',
  },
  groupButtonContainer: {
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: '#c0c0c0',
    marginRight: 5,
    padding: 2,
  },
  groupButtonDivider: {
    justifyContent: 'center',
    marginRight: 5,
  },
});

export default CategorySelectView;
