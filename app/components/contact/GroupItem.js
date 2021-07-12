import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserInfoBox from '@COMMON/UserInfoBox';
import { 
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert
} from 'react-native';
import { getItemGroup } from '@/modules/contact';
import { deleteContacts } from '@/modules/contact';
import { changeModal, openModal, closeModal } from '@/modules/modal';
import { getDictionary } from '@/lib/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';
import { removeCustomGroup } from "@/modules/contact";
import { openChatRoomView } from '@/lib/roomUtil';

const groupBtnUpImg = require('@C/assets/group_button_up.png');
const groupBtnDownImg = require('@C/assets/group_button_down.png');

const GroupItem = ({
    root,
    contact,
    onLongPress,
    viewType,
    checkObj,
    navigation
}) => {
  const { colors, sizes } = useTheme();
  const oViewType = useSelector(({ room }) => room.viewType);
  const rooms = useSelector(({ room }) => room.rooms);
  const selectId = useSelector(({ room }) => room.selectId);
  const myInfo = useSelector(({ login }) => login.userInfo);
  const groups = contact.sub;
  const [isopen, setIsopen] = useState(true);
  const [isload, setIsload] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    setIsopen(false);
    setIsload(false);
  }, []);

  const handleIsOpen = useCallback(() => {
    setIsopen(!isopen);
  }, [isopen]);

  const showContactMenu = useCallback((contact, item) => {
      let buttons = [];
      
      /* 그룹 헤더 longClick */
      if(!item){
        buttons.push({
          code: 'modifyCustomGroup',
          title: getDic('Chg_Group_Info', '그룹정보 변경'),
          onPress: () => {
            navigation.navigate('EditGroup',{
              headerName: getDic('Chg_Group_Info', '그룹정보 변경'),
              folderID: contact.folderID
            });
          }
        });

        buttons.push({
          code: 'deleteCustomGroup',
          title: getDic('Delete_Group', '그룹삭제'),
          onPress: () => {
            Alert.alert(
              null,
              getDic('Confirm_Delete_Group', '해당 그룹을 삭제하시겠습니까?'),
              [
                { text: getDic('Cancel') },
                {
                  text: getDic('Ok'),
                  onPress: () => {
                    //사용자 그룹단위 삭제
                    dispatch(removeCustomGroup({
                      folderId: contact.folderID, 
                      folderType: contact.folderType
                    }));
                  },
                },
              ],
              { cancelable: true },
            );
          }
        });
      }else{
        buttons.push({
          code: 'deleteMember',
          title: getDic('Delete_Group_Member', '그룹멤버삭제'),
          onPress: () => {
            const member = item.type == 'U' ? {contactId: item.id}:{ contactId: item.id, companyCode: item.companyCode };
            //그룹 멤버/조직 단위 삭제 action
            dispatch(removeCustomGroup({
                folderId: contact.folderID,
                folderType: contact.folderType,
                ...member
            }));
          }
        });

      }

      buttons.push({
        code: 'startChat',
        title: getDic('StartChat'),
        onPress: () => {
          //그룹멤버 
          if(item){
              if (contact.pChat == 'Y')
                openChatRoomView(
                    dispatch,
                    oViewType,
                    rooms,
                    selectId,
                    item,
                    myInfo,
                    navigation,
                  );
              else
                Alert.alert(
                  null,
                  getDic('Msg_GroupInviteError'),
                  [{ text: getDic('Ok') }],
                  { cancelable: true }
                );
          }else{//일반채팅
              //그룹채팅구현
              let groupInfos = { id: contact.folderID, type: contact.folderType };
              openChatRoomView(
                dispatch,
                oViewType,
                rooms,
                selectId,
                groupInfos,
                myInfo,
                navigation,
              );
          }
        },
      });

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
    [dispatch, rooms, groups, contact]
  );

  return (
    <View style={{ marginBottom: 5 }}>        
        <TouchableOpacity
            style={{ flexDirection: 'row' }}
            onPress={handleIsOpen}
            onLongPress={() => {
              showContactMenu(contact);
            }}
        >
        <Text style={{ ...styles.header, fontSize: sizes.default }}>
            { "┗ "+ getDictionary(contact.folderName)}{' '}
            {(contact.sub ? `(${contact.sub.length})` : `(0)`)}
        </Text>
        {isopen ? (
        <Image style={styles.toggleBtn} source={groupBtnUpImg} />
        ) : (
        <Image style={styles.toggleBtn} source={groupBtnDownImg} />
        )}
        </TouchableOpacity>
        {isopen && groups ? (
          <View>
          {groups.map(item => {
            return (
            <View key={root.folderID + '_' + contact.folderID + '_' + item.id} style={styles.userBoxContainer}>
                <UserInfoBox
                userInfo={item}
                isInherit={true}
                onPress={viewType == 'list' ? null : false}
                onLongPress={
                    viewType == 'list'
                    ? () => {
                        showContactMenu(contact, item);
                      }
                    : false
                }
                checkObj={viewType == 'checklist' ? checkObj : null}
                disableMessage={viewType == 'checklist'}
                navigation={navigation}
                />
            </View>
            );
          })}
          </View>
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    color: '#888',
    marginBottom: 10,
    marginTop: 5,
  },
  toggleBtn: {
    width: 24,
    height: 24,
    marginLeft: 'auto',
    marginTop: 0,
  },
  userBoxContainer: {
    marginBottom: 20,
  },
});

export default GroupItem;
