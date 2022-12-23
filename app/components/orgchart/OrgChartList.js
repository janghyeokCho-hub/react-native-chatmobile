import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Header from '@COMMON/Header';
import { useSelector } from 'react-redux';
import * as OrgChart from '@API/orgchart';
import UserInfoBox from '@COMMON/UserInfoBox';
import NewChatIcon from '../common/icons/NewChatIcon';
import SearchBar from '../common/SearchBar';
import Svg, { Path } from 'react-native-svg';
import NetworkError from '../common/NetworkError';
import { getDictionary } from '@/lib/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';
import { filterSearchGroupMember } from '@/lib/contactUtil';
import { withSecurityScreen } from '@/withSecurityScreen';

const OrgChartList = ({ viewType, checkObj, group, navigation }) => {
  const { colors, sizes } = useTheme();
  const userInfo = useSelector(({ login }) => login.userInfo);
  const userID = useSelector(({ login }) => login.id);
  const networkState = useSelector(({ app }) => app.networkState);

  const [searchText, setSearchText] = useState('');
  const [type, setType] = useState(viewType);
  const [deptProfileList, setDeptProfileList] = useState([]);
  const [orgpathList, setOrgpathList] = useState([]);
  const [oldGroupMember, setOldGroupMember] = useState([]);

  const flatlist = useRef();

  useEffect(() => {
    if (!type) {
      setType('list');
    }
    if (
      (deptProfileList == null || deptProfileList.length == 0) &&
      userInfo.DeptCode != null
    ) {
      handleDept(userInfo.DeptCode, userInfo.CompanyCode);
    }
  }, [networkState]);

  const handleDept = useCallback(
    (deptCode, companyCode) => {
      if (networkState) {
        OrgChart.getOrgChart({
          deptID: deptCode,
          companyCode: companyCode,
        }).then(({ data }) => {
          //그룹데이터 제외 필터링
          if (group) {
            data.result.sub = filterSearchGroupMember(
              data.result.sub,
              group,
              userID,
            );
          }
          setDeptProfileList([]);
          setDeptProfileList(data.result.path);
          setOrgpathList([]);
          setOrgpathList(data.result.sub);
        });
      }
    },
    [type, networkState, group],
  );

  const handleSearch = useCallback(
    value => {
      setSearchText(value);
      if (value) {
        OrgChart.searchOrgChart({
          userID: userID,
          value: value,
          type: 'O',
        }).then(({ data }) => {
          //그룹데이터 제외 필터링
          if (group) {
            data.result = filterSearchGroupMember(data.result, group, userID);
          }

          setDeptProfileList([]);
          setOrgpathList([]);
          setOrgpathList(data.result);
        });
      } else {
        if (userInfo) {
          setDeptProfileList([]);
          setOrgpathList([]);
          handleDept(userInfo.DeptCode, userInfo.CompanyCode);
        }
      }
    },
    [type, group],
  );

  useEffect(() => {
    setTimeout(() => {
      if (flatlist.current) {
        flatlist.current.scrollToEnd({ animated: true });
      }
    }, 200);
  }, [deptProfileList]);

  useEffect(() => {
    if (group?.sub) {
      if (oldGroupMember.length !== group.sub.length) {
        setOldGroupMember(group.sub);
        handleDept(userInfo.DeptCode, userInfo.CompanyCode);
      } else {
        setOldGroupMember(group.sub);
      }
    }
  }, [group, oldGroupMember]);

  return (
    <>
      <View style={styles.container}>
        {type === 'list' && (
          <Header
            title={getDic('OrgChart')}
            style={styles.header}
            topButton={[
              {
                code: 'startChat',
                onPress: () => {
                  navigation.navigate('InviteMember', {
                    headerName: getDic('StartChat', '대화시작'),
                    isNewRoom: true,
                  });
                },
                svg: <NewChatIcon />,
              },
            ]}
          />
        )}
        {networkState && (
          <View style={styles.contentWrap}>
            <SearchBar
              style={styles.searchBarContainer}
              placeholder={getDic('Msg_contactSearch')}
              onChangeText={text => {
                handleSearch(text);
              }}
              searchText={searchText}
            />

            <View style={styles.tabButtonListContainer}>
              <FlatList
                ref={flatlist}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={150}
                data={deptProfileList}
                keyExtractor={item => item.GroupCode}
                renderItem={({ item, index }) => {
                  if (deptProfileList.length - 1 == index) {
                    return (
                      <View style={styles.groupContainer}>
                        <View
                          style={{
                            ...styles.groupButtonContainer,
                            backgroundColor: colors.primary,
                          }}
                        >
                          <Text
                            style={{
                              ...styles.activeGroupButton,
                              fontSize: sizes.default,
                            }}
                          >
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
                            onPress={e => {
                              handleDept(item.GroupCode, item.CompanyCode);
                            }}
                          >
                            <Text style={{ fontSize: sizes.default }}>
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
            <ScrollView style={styles.contents}>
              <View style={styles.profileListContainer}>
                <FlatList
                  data={orgpathList}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => {
                    if (item.type === 'G') {
                      return (
                        <View style={styles.userBoxContainer}>
                          <UserInfoBox
                            userInfo={item}
                            isInherit={false}
                            onPress={() => {
                              handleDept(item.id, item.companyCode);
                            }}
                            onLongPress={type === 'list' ? null : false}
                            checkObj={type === 'checklist' ? checkObj : null}
                            disableMessage={type === 'checklist'}
                            navigation={navigation}
                          />
                        </View>
                      );
                    } else if (item.type === 'U') {
                      return (
                        <View style={styles.userBoxContainer}>
                          <UserInfoBox
                            userInfo={item}
                            isInherit={false}
                            onPress={type === 'list' ? null : false}
                            onLongPress={type === 'list' ? null : false}
                            checkObj={type === 'checklist' ? checkObj : null}
                            disableMessage={type === 'checklist'}
                            navigation={navigation}
                          />
                        </View>
                      );
                    }
                  }}
                />
              </View>
            </ScrollView>
          </View>
        )}
        {!networkState && (
          <NetworkError
            handleRefresh={() => {
              handleDept(userInfo.DeptCode, userInfo.CompanyCode);
            }}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabButtonListContainer: {
    marginTop: 15,
    marginBottom: 15,
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
  searchBarContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  contentWrap: {
    padding: 15,
    flex: 1,
  },
  userBoxContainer: {
    marginBottom: 20,
  },
});

export default withSecurityScreen(OrgChartList);
