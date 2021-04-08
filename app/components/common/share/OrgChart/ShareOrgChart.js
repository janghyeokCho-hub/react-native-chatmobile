import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as api from '@COMMON/share/lib/api';
import Svg, { Path } from 'react-native-svg';
import { getDictionary } from '@/lib/common';
import ShareUserInfoBox from '@COMMON/share/common/ShareUserInfoBox';

const searchImg = require('@C/assets/search.png');

const ShareOrgChart = ({ selectedItems, deleteItem, appendItem }) => {
  const [deptProfileList, setDeptProfileList] = useState([]);
  const [orgpathList, setOrgpathList] = useState([]);

  useEffect(() => {
    const server = api.getServerUtil();
    handleDept(server.getUserInfo('DeptCode'));
  }, []);

  const handleDept = useCallback(deptCode => {
    const server = api.getServerUtil();
    const companyCode = server.getUserInfo('CompanyCode');
    server.getRestful(`/org/${deptCode}/gr/${companyCode}`).then(({ data }) => {
      setDeptProfileList(data.result.path);
      setOrgpathList(data.result.sub);
    });
  }, []);

  const handleSearch = useCallback(text => {
    const server = api.getServerUtil();
    if (text) {
      const id = api.getServerUtil().id;
      server.getRestful(`/org/search/${id}?value=${text}`).then(({ data }) => {
        setDeptProfileList([]);
        setOrgpathList(data.result);
      });
    } else {
      const myDeptCode = server.getUserInfo('DeptCode');
      if (myDeptCode) {
        setDeptProfileList([]);
        setOrgpathList([]);
        handleDept(myDeptCode);
      }
    }
  }, []);

  const handleCheck = useCallback(
    (chk, obj) => {
      if (chk) {
        // 선택
        appendItem(obj);
      } else {
        // 해제
        deleteItem({ type: obj.type, id: obj.id });
      }
    },
    [appendItem, deleteItem],
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentWrap}>
        <View style={{ paddingLeft: 15, paddingRight: 15 }}>
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.textInput}
              placeholderTextColor="#AAA"
              onChangeText={handleSearch}
            />
            <Image source={searchImg} style={styles.searchImg} />
          </View>
        </View>
        <View style={styles.tabButtonListContainer}>
          <FlatList
            data={deptProfileList}
            keyExtractor={item => item.GroupCode}
            renderItem={({ item, index }) => {
              if (deptProfileList.length - 1 === index) {
                return (
                  <View style={styles.groupContainer}>
                    <View style={styles.activeGroupButtonContainer}>
                      <Text style={styles.activeGroupButton}>
                        {' '}
                        {getDictionary(item.MultiDisplayName)}
                        {'  '}
                      </Text>
                    </View>
                  </View>
                );
              } else {
                return (
                  <View style={styles.groupContainer}>
                    <View style={styles.groupButtonContainer}>
                      <TouchableOpacity
                        style={{ flexDirection: 'row' }}
                        onPress={() => {
                          handleDept(item.GroupCode);
                        }}
                      >
                        <Text style={{ fontSize: 13 }}>
                          {' '}
                          {getDictionary(item.MultiDisplayName)}{' '}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.groupButtonDivider}>
                      <Svg
                        width="4.518"
                        height="7.316"
                        viewBox="0 0 4.518 7.316"
                      >
                        <Path
                          d="M9.658,8,6,11.658l.86.86,2.8-2.792,2.8,2.792.86-.86Z"
                          transform="translate(12.518 -6) rotate(90)"
                          fill="#ccc"
                        />
                      </Svg>
                    </View>
                  </View>
                );
              }
            }}
            horizontal
          />
        </View>

        <View style={styles.profileListContainer}>
          <FlatList
            data={orgpathList}
            keyExtractor={item =>
              item.id + '_' + (Math.floor(Math.random() * 100000) + 1)
            }
            renderItem={({ item }) => {
              let isSelected = false;

              if (selectedItems) {
                isSelected =
                  selectedItems.findIndex(
                    selItem =>
                      selItem.id === item.id && selItem.type === item.type,
                  ) > -1;
              }

              if (item.type == 'G') {
                return (
                  <View style={styles.userBoxContainer}>
                    <ShareUserInfoBox
                      userInfo={item}
                      onPress={() => {
                        handleDept(item.id);
                      }}
                      isCheckComponent={true}
                      onCheck={handleCheck}
                      checked={isSelected}
                    />
                  </View>
                );
              } else if (item.type == 'U') {
                return (
                  <View style={styles.userBoxContainer}>
                    <ShareUserInfoBox
                      userInfo={item}
                      onPress={() => {
                        handleCheck(!isSelected, item);
                      }}
                      isCheckComponent={true}
                      onCheck={handleCheck}
                      checked={isSelected}
                    />
                  </View>
                );
              }
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabButtonListContainer: {
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
  groupContainer: {
    flexDirection: 'row',
  },
  activeGroupButtonContainer: {
    backgroundColor: '#12cfee',
    borderRadius: 5,
    padding: 5,
  },
  activeGroupButton: {
    fontSize: 13,
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
  searchBarContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  contentWrap: {
    paddingTop: 15,
    paddingBottom: 15,
    flex: 1,
  },
  userBoxContainer: {
    marginBottom: 20,
    paddingRight: 20,
  },
  textInput: {
    fontSize: 14,
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 0.5,
    borderRadius: 20,
    paddingLeft: 25,
    paddingRight: 45,
    color: '#AAA',
  },
  textDisabled: {
    backgroundColor: '#ddd',
  },
  searchImg: {
    position: 'absolute',
    width: 25,
    height: 25,
    right: 10,
    top: 7,
  },
  profileListContainer: {
    paddingLeft: 15,
  },
});

export default ShareOrgChart;
