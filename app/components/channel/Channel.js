import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getServer } from '@/config';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LockIcon from '@COMMON/icons/LockIcon';
import { getBackgroundColor, makeMessageText, isJSONStr } from '@/lib/common';
import { getDic } from '@/config';
import { useTheme } from '@react-navigation/native';
import { isBlockCheck } from '@/lib/api/orgchart';
import { makeDateTime } from '@/lib/util/dateUtil';

const Channel = ({
  room,
  onRoomChange,
  showModalMenu,
  getRoomSettings,
  isEmptyObj,
}) => {
  const chineseWall = useSelector(({ login }) => login.chineseWall);
  const { sizes } = useTheme();
  const [pinnedTop, setPinnedTop] = useState(false);
  const setting = useMemo(() => getRoomSettings(room), [room, getRoomSettings]);
  const [lastMessageText, setLastMessageText] = useState('');

  useEffect(() => {
    if (room?.lastMessage && chineseWall?.length) {
      const lastMessageInfo = isJSONStr(room.lastMessage)
        ? JSON.parse(room.lastMessage)
        : room.lastMessage;
      const targetInfo = {
        id: lastMessageInfo.sender,
        companyCode: lastMessageInfo.companyCode,
        deptCode: lastMessageInfo.deptCode,
      };
      const { blockChat, blockFile } = isBlockCheck({
        targetInfo,
        chineseWall,
      });
      const isFile = !!lastMessageInfo?.File;
      const result = isFile ? blockFile : blockChat;

      if (result) {
        setLastMessageText(getDic('BlockChat', '차단된 메시지 입니다.'));
      } else {
        setLastMessageText(makeMessageText(room.lastMessage));
      }
    } else {
      setLastMessageText(makeMessageText(room.lastMessage));
    }
  }, [room.lastMessage, chineseWall]);

  useEffect(() => {
    if (setting && !isEmptyObj(setting) && !!setting.pinTop) {
      setPinnedTop(true);
    } else {
      setPinnedTop(false);
    }
  }, [setting, isEmptyObj]);

  const handleClick = useCallback(() => {
    onRoomChange(room);
  }, [onRoomChange, room]);

  return (
    <TouchableOpacity
      onPress={handleClick}
      onLongPress={() => showModalMenu(room)}
    >
      <View style={styles.container}>
        {room.iconPath ? (
          <Image
            source={{ uri: `${getServer('HOST')}${room.iconPath}` }}
            style={styles.profileImage}
          />
        ) : (
          <View
            style={[
              styles.profileImage,
              styles.profileText,
              {
                borderRadius: 15,
                backgroundColor: getBackgroundColor(room.roomName),
              },
            ]}
          >
            <Text
              style={[
                styles.profileImageText,
                {
                  fontSize: 17,
                  padding: 12,
                  textAlign: 'center',
                  color: '#fff',
                },
              ]}
            >
              {(room.roomName && room.roomName[0]) || ''}
            </Text>
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.title}>
            {room.openType === 'L' || room.openType === 'P' ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    width: 22,
                    borderRadius: 20,
                    padding: 2,
                    marginRight: 5,
                  }}
                >
                  <LockIcon color="black" width="16" height="16" />
                </View>
                <Text
                  style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}
                  numberOfLines={1}
                >
                  {room.roomName}
                </Text>
              </View>
            ) : (
              <Text
                style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}
                numberOfLines={1}
              >
                {room.roomName}
              </Text>
            )}
            <Text>{pinnedTop && '📌'}</Text>
          </View>
          <Text
            numberOfLines={1}
            style={{ ...styles.lastMessage, fontSize: 13 + sizes.inc }}
          >
            {lastMessageText}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.dateText}>
            {room.lastMessageDate ? makeDateTime(room.lastMessageDate) : ''}
          </Text>
          {room.unreadCnt > 0 ? (
            <View style={styles.count}>
              <Text style={styles.countTxt}>{room.unreadCnt}</Text>
            </View>
          ) : (
            <Text />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
    flexDirection: 'row',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
  },
  title: {
    flexDirection: 'row',
  },
  titleTxt: {
    fontWeight: '500',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 15,
    justifyContent: 'center',
  },
  info: {
    width: 70,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  count: {
    width: 25,
    height: 20,
    color: 'white',
    backgroundColor: '#F86A60',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  countTxt: {
    fontSize: 12,
    color: 'white',
  },
  lastMessage: {
    color: '#888',
    marginTop: 3,
  },
  dateText: {
    color: '#AAA',
    fontSize: 12,
  },
});

export default React.memo(Channel);
