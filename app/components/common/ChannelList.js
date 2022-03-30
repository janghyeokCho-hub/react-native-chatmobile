import React, { useCallback, useState, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDic } from '@/config';
import AddChannelIcon from '@/components/common/icons/AddChannelIcon';
import AddChangeIcon from '@/components/common/icons/AddChangeIcon';
import {
  MenuTrigger,
  MenuOption,
  MenuOptions,
  Menu,
} from 'react-native-popup-menu';

const ChannelList = ({ channelName, channelPhoto }) => {
  const navigation = useNavigation();
  const [chName, setChName] = useState('');

  const handleAddTarget = useCallback(() => {
    navigation.navigate('AddChannel', {
      headerName: getDic('AddNotificationChannel', '알림 채널 추가'),
    });
  }, [navigation]);

  const deleteChannel = () => {
    navigation.setParams({ channelName: null, channelId: null });
  };

  useLayoutEffect(() => {
    setChName(channelName);
  }, [channelName]);

  return (
    <View style={styles.channelList}>
      <View style={styles.channelTitle}>
        <Text>{getDic('Notification_Channel', '알림채널')}</Text>
      </View>
      <View style={styles.channelBox}>
        {channelName && (
          <Menu style={styles.selectedChannel}>
            {channelPhoto && (
              <View style={styles.channelImgBox}>
                <Image
                  style={styles.channelImg}
                  source={{
                    uri: channelPhoto,
                  }}
                />
              </View>
            )}
            <MenuTrigger style={styles.channelTxt} text={chName} />
            <MenuOptions>
              <MenuOption text={chName} />
              <MenuOption onSelect={deleteChannel}>
                <Text style={styles.deleteBtn}>
                  {' '}
                  {getDic('Delete', '삭제')}
                </Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        )}
      </View>

      <View style={styles.plusBtn}>
        <TouchableOpacity onPress={handleAddTarget}>
          {channelName ? (
            <AddChangeIcon width={20} height={20} />
          ) : (
            <AddChannelIcon
              width={20}
              height={20}
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#ababab',
              }}
              color="#666"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChannelList;

const styles = StyleSheet.create({
  channelList: {
    flex: 1,
    flexDirection: 'row',
    padding: '2%',
    justifyContent: 'center',
    borderBottomColor: '#cecece',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  channelBox: {
    flex: 4,
  },
  channelTitle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChannel: {
    flexDirection: 'row',
    borderColor: '#cecece',
    borderWidth: 1,
    padding: 4,
    alignSelf: 'baseline',
    borderRadius: 50,
    alignItems: 'center',
  },
  deleteBtn: {
    color: 'red',
  },
  channelImgBox: {
    width: 25,
    height: 25,
  },

  channelImg: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    resizeMode: 'stretch',
  },

  channelTxt: {
    fontSize: 16,
    marginTop: 2,
    marginLeft: 2,
  },

  plusBtn: {
    flex: 1,
    justifyContent: 'center',
  },
});
