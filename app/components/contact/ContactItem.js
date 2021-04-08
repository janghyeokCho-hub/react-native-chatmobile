import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserInfoBox from '@COMMON/UserInfoBox';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getItemGroup } from '@/modules/contact';
import { deleteContacts } from '@/modules/contact';
import { changeModal, openModal, closeModal } from '@/modules/modal';
import { getDictionary } from '@/lib/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';

const groupBtnUpImg = require('@C/assets/group_button_up.png');
const groupBtnDownImg = require('@C/assets/group_button_down.png');

const ContactItem = ({
  contact,
  onLongPress,
  viewType,
  checkObj,
  navigation,
}) => {
  const { colors, sizes } = useTheme();
  const contactSub = contact.sub;
  const [isopen, setIsopen] = useState(true);
  const [isload, setIsload] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (contact.sub === undefined && contact.folderType == 'G') {
      setIsopen(false);
      setIsload(false);
    }
  }, [contact.sub]);

  const handleIsOpen = useCallback(() => {
    setIsopen(!isopen);
    if (!isopen)
      if (contact.folderType == 'G' && !isload) {
        setIsload(true);
        dispatch(
          getItemGroup({
            folderID: contact.groupCode,
            folderType: contact.folderType,
          }),
        );
      }
  }, [isopen, isload]);

  return (
    <View style={{ marginBottom: 10 }}>
      <TouchableOpacity
        style={{ flexDirection: 'row' }}
        onPress={handleIsOpen}
        onLongPress={() => {
          if (contact.folderType == 'G') {
            dispatch(
              changeModal({
                modalData: {
                  title: '내 대화상대 관리',
                  closeOnTouchOutside: true,
                  type: 'normal',
                  buttonList: [
                    {
                      title: getDic('DelContact'),
                      onPress: () => {
                        let temp = {
                          folderId: contact.folderID,
                          folderType: contact.folderType,
                        };
                        dispatch(deleteContacts(temp));
                        dispatch(closeModal());
                      },
                    },
                  ],
                },
              }),
            );
            dispatch(openModal());
          }
        }}
      >
        <Text style={{ ...styles.header, fontSize: sizes.default }}>
          {getDictionary(contact.folderName)}{' '}
          {(contact.folderType == 'F' || contact.folderType == 'C') &&
            (contact.sub ? `(${contact.sub.length})` : `(0)`)}
        </Text>
        {isopen ? (
          <Image style={styles.toggleBtn} source={groupBtnUpImg} />
        ) : (
          <Image style={styles.toggleBtn} source={groupBtnDownImg} />
        )}
      </TouchableOpacity>
      {isopen && contactSub ? (
        <View>
          {contactSub.map(sub => {
            return (
              <View
                key={contact.folderID + '_' + sub.id}
                style={styles.userBoxContainer}
              >
                <UserInfoBox
                  userInfo={sub}
                  isInherit={true}
                  onPress={viewType == 'list' ? null : false}
                  onLongPress={
                    viewType == 'list'
                      ? () => {
                          onLongPress(contact, sub);
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
    marginTop: 2,
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

export default ContactItem;
