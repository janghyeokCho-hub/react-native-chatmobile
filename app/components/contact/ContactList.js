import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import * as OrgChart from '@API/orgchart';
import UserInfoBox from '@COMMON/UserInfoBox';
import Header from '@COMMON/Header';
import ContactItem from './ContactItem';
import AddContactIcon from '@COMMON/icons/AddContactIcon';
import NewChatIcon from '@COMMON/icons/NewChatIcon';
import { changeModal, openModal, closeModal } from '@/modules/modal';
import SearchBar from '@COMMON/SearchBar';
import { addFavorite, deleteContact } from '@/lib/contactUtil';
import { openChatRoomView } from '@/lib/roomUtil';
import NetworkError from '../common/NetworkError';
import { getDic } from '@/config';
import { getAbsence } from '@/modules/absence';
import * as contactApi from '@API/contact';
import { restartApp } from '@/lib/device/common.android';
import { getContacts } from '@/modules/contact';

const ContactList = ({ viewType, checkObj, navigation }) => {
  const contactList = useSelector(({ contact }) => contact.contacts);
  const oViewType = useSelector(({ room }) => room.viewType);
  const rooms = useSelector(({ room }) => room.rooms);
  const selectId = useSelector(({ room }) => room.selectId);
  const myInfo = useSelector(({ login }) => login.userInfo);
  const networkState = useSelector(({ app }) => app.networkState);

  const [searchHandleFlag, setSearchHandleFlag] = useState(true);

  const absenceList = [];

  const [type, setType] = useState(viewType);
  const [searchList, setSearchList] = useState(null);
  const [searchText, setSearchText] = useState('');

  const dispatch = useDispatch();

  const handleSearch = useCallback(
    value => {
      if (searchHandleFlag) {
        if (value && value != '') {
          setSearchList([]);
          setSearchText(value);
          if (networkState) {
            OrgChart.searchOrgChart({
              userID: myInfo.id,
              value: value,
              type: 'C',
            })
              .then(({ data }) => {
                setSearchList(data.result);
              })
              .catch(error => {
                setSearchList([]);
              });
          } else {
            setSearchList([]);
          }
        } else {
          setSearchList(null);
          setSearchText('');
          dispatch(getContacts({ DeptCode: myInfo.DeptCode }));
        }
      }
    },
    [type, searchList, networkState],
  );

  useEffect(() => {
    if (!type) {
      setType('list');
    }
    if (contactList == null || contactList.length == 0) {
      dispatch(getContacts({ DeptCode: myInfo.DeptCode }));
    }
    if (absenceList == null || absenceList.length == 0) {
      dispatch(getAbsence({ DeptCode: myInfo.DeptCode }));
    }
  }, []);

  const showContactMenu = useCallback(
    (contact, subItem) => {
      let buttons = [];
      if (myInfo.id != subItem.id) {
        if (subItem.type != 'G') {
          if (contact.folderType != 'F' && subItem.isContact != 'F') {
            buttons.push({
              code: 'addFavorite',
              title: getDic('AddFavorite'),
              onPress: () => {
                addFavorite(
                  dispatch,
                  subItem,
                  subItem.isContact && subItem.isContact != ''
                    ? subItem.isContact
                    : contact.folderType,
                );
              },
            });

            if (contact.folderType != 'M' && contact.folderType != 'G') {
              buttons.push({
                code: 'deleteContact',
                title: getDic('DelContact'),
                onPress: () => {
                  deleteContact(
                    dispatch,
                    subItem.id,
                    contact.folderID,
                    contact.folderType,
                  );
                },
              });
            }
          } else {
            buttons.push({
              code: 'deleteFavorite',
              title: getDic('DelFavorite'),
              onPress: () => {
                deleteContact(dispatch, subItem.id, null, 'F');
              },
            });
          }
        }

        buttons.push({
          code: 'startChat',
          title: getDic('StartChat'),
          onPress: () => {
            if (subItem.pChat == 'Y')
              openChatRoomView(
                dispatch,
                oViewType,
                rooms,
                selectId,
                subItem,
                myInfo,
                navigation,
              );
            else
              Alert.alert(
                null,
                getDic('Msg_GroupInviteError'),
                [{ text: getDic('Ok') }],
                { cancelable: true },
              );
          },
        });
      } else {
        buttons.push({
          code: 'startChat',
          title: getDic('StartChat'),
          onPress: () => {
            if (subItem.pChat == 'Y')
              openChatRoomView(
                dispatch,
                oViewType,
                rooms,
                selectId,
                subItem,
                myInfo,
                navigation,
              );
            else
              Alert.alert(
                null,
                getDic('Msg_GroupInviteError'),
                [{ text: getDic('Ok') }],
                { cancelable: true },
              );
          },
        });
      }
      if (buttons.length > 0) {
        dispatch(
          changeModal({
            modalData: {
              closeOnTouchOutside: true,
              type: 'normal',
              buttonList: buttons,
            },
          }),
        );
        dispatch(openModal());
      }
    },
    [contactList, rooms],
  );

  return (
    <View style={styles.container}>
      {type == 'list' && (
        <Header
          title={getDic('Contact')}
          topButton={[
            {
              code: 'addContactItem',
              onPress: () => {
                if (myInfo) {
                  navigation.navigate('AddContact', {
                    deptCode: myInfo.DeptCode,
                    userID: myInfo.id,
                  });
                }
              },
              svg: <AddContactIcon />,
            },
            {
              code: 'startChat',
              onPress: () => {
                navigation.navigate('InviteMember', {
                  headerName: getDic('StartChat'),
                  isNewRoom: true,
                });
              },
              svg: <NewChatIcon />,
            },
          ]}
        />
      )}
      <View style={styles.contentWrap}>
        <SearchBar
          style={styles.searchBarContainer}
          placeholder={getDic('Msg_contactSearch')}
          onChangeText={handleSearch}
          searchText={searchText}
        />
        {searchList ? (
          <>
            {networkState && (
              <FlatList
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={150}
                initialNumToRender={5}
                data={searchList}
                keyExtractor={item =>
                  item.id + '_' + (Math.floor(Math.random() * 100000) + 1)
                }
                renderItem={({ item }) => {
                  return (
                    <View style={styles.userBoxContainer}>
                      <UserInfoBox
                        userInfo={item}
                        isInherit={false}
                        onPress={type == 'list' ? null : false}
                        onLongPress={type == 'list' ? null : false}
                        checkObj={type == 'checklist' ? checkObj : null}
                        disableMessage={type == 'checklist'}
                        navigation={navigation}
                      />
                    </View>
                  );
                }}
              />
            )}
            {!networkState && <NetworkError />}
          </>
        ) : (
          <>
            {contactList && (
              <FlatList
                data={contactList}
                keyExtractor={item => item.folderID}
                renderItem={({ item }) => {
                  return (
                    <ContactItem
                      contact={item}
                      onLongPress={showContactMenu}
                      viewType={type}
                      checkObj={checkObj}
                      navigation={navigation}
                    />
                  );
                }}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentWrap: {
    padding: 15,
    flex: 1,
  },
  searchBarContainer: {
    marginTop: 5,
    marginBottom: 20,
  },
  userBoxContainer: {
    marginBottom: 20,
  },
});

export default ContactList;
