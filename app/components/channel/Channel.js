import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  format,
  isValid,
  startOfToday,
  differenceInMilliseconds,
} from 'date-fns';
import { getServer } from '@/config';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LockIcon from '@COMMON/icons/LockIcon';
import { getBackgroundColor, makeMessageText } from '@/lib/common';
import { useTheme } from '@react-navigation/native';

const makeDateTime = timestamp => {
  if (isValid(new Date(timestamp))) {
    const toDay = startOfToday();
    const procTime = new Date(timestamp);
    let dateText = '';

    if (differenceInMilliseconds(procTime, toDay) >= 0) {
      // 오늘보다 큰 경우 시간 표시
      dateText = format(procTime, 'HH:mm');
    } else {
      // 오늘과 이틀이상 차이나는 경우 날짜로 표시
      dateText = format(procTime, 'yyyy.MM.dd');
    }

    // 오늘과 하루 차이인 경우 어제로 표시 -- 차후에 추가 ( 다국어처리 )

    return dateText;
  } else {
    return '';
  }
};

const Channel = ({
  room,
  onRoomChange,
  showModalMenu,
  getRoomSettings,
  isEmptyObj,
}) => {
  const { sizes } = useTheme();
  const [pinnedTop, setPinnedTop] = useState(false);
  const setting = useMemo(() => getRoomSettings(room), [room, getRoomSettings]);

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
            {room.openType == 'L' || room.openType == 'P' ? (
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
            {room.lastMessage &&
              makeMessageText(room.lastMessage, room.lastMessageType)}
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
