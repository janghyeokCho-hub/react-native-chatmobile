import React, { useMemo } from 'react';
import { getServer } from '@/config';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LockIcon from '@COMMON/icons/LockIcon';
import { getBackgroundColor, makeMessageText } from '@/lib/common';
import { useTheme } from '@react-navigation/native';
import ToggleButton from '@COMMON/buttons/ToggleButton';

const Channel = ({ channel, checkObj, pinnedTop }) => {
  const { sizes } = useTheme();

  const checkedValue = useMemo(() => {
    if (!checkObj) {
      return;
    }

    // userInfo[checkedKey] 값이 비어있으면 checkedSubKey 참조
    if (typeof checkObj.checkedSubKey !== 'undefined') {
      return channel[checkObj.checkedKey] || channel[checkObj.checkedSubKey];
    }
    return channel[checkObj.checkedKey];
  }, [channel, checkObj]);

  return (
    <TouchableOpacity
      onPress={() => {
        checkObj &&
          checkObj.onPress(
            !checkObj.checkedList.find(
              item =>
                (item[checkObj.checkedKey] || item[checkObj.checkedSubKey]) ===
                checkedValue,
            ),
            channel,
          );
      }}
    >
      <View style={styles.container}>
        {channel.iconPath ? (
          <Image
            source={{ uri: `${getServer('HOST')}${channel.iconPath}` }}
            style={styles.profileImage}
          />
        ) : (
          <View
            style={[
              styles.profileImage,
              styles.profileText,
              {
                borderRadius: 15,
                backgroundColor: getBackgroundColor(channel.roomName),
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
              {(channel.roomName && channel.roomName[0]) || ''}
            </Text>
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.title}>
            {channel.openType === 'L' || channel.openType === 'P' ? (
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
                  {channel.roomName}
                </Text>
              </View>
            ) : (
              <Text
                style={{ ...styles.titleTxt, fontSize: 15 + sizes.inc }}
                numberOfLines={1}
              >
                {channel.roomName}
              </Text>
            )}
            <Text>{pinnedTop && '📌'}</Text>
          </View>
          <Text
            numberOfLines={1}
            style={{ ...styles.lastMessage, fontSize: 13 + sizes.inc }}
          >
            {channel.lastMessage &&
              makeMessageText(channel.lastMessage, channel.lastMessageType)}
          </Text>
        </View>
        <View style={styles.info}>
          <ToggleButton
            data={channel}
            checked={
              checkObj.checkedList.find(
                item =>
                  (item[checkObj.checkedKey] ||
                    item[checkObj.checkedSubKey]) === checkedValue,
              ) !== undefined
            }
            onPress={() => {
              checkObj &&
                checkObj.onPress(
                  !checkObj.checkedList.find(
                    item =>
                      (item[checkObj.checkedKey] ||
                        item[checkObj.checkedSubKey]) === checkedValue,
                  ),
                  channel,
                );
            }}
          />
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
