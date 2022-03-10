import React, { useCallback, useState, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet,  Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDic } from '@/config';
import AddChannelIcon from '@/components/common/icons/AddChannelIcon';
import {
  MenuTrigger,
  MenuOption,
  MenuOptions,
  Menu,
} from 'react-native-popup-menu';


const ChannelList = ({ route, channelName,channelId,channelPhoto, ...rest }) => {
  const navigation = useNavigation();
  const [chName, setChName] = useState('');

  const handleAddTarget = useCallback(() => {
    navigation.navigate('AddChannel', {
      headerName: getDic('AddNotificationChannel', '알림 채널 추가'),
    });
  }, [navigation]);

  const deleteChannel = () => {
    navigation.setParams({ channelName : null, channelId : null })
  };

  useLayoutEffect(() => {
    setChName(channelName);
  }, [channelName]);

  return (
    <View {...rest}>
      <Text style={{ flex: 1 }}>
        {getDic('Notification_Channel', '알림채널')}
      </Text>
        <View style={styles.channelBox}>
        
        
        {channelName && (
          <Menu style={styles.selectedChannel}>
              {channelPhoto &&(
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
                <Text style={{ color: 'red' }}> {getDic('Delete')}</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
             )}

          </View>

   

      <View style={styles.plusBtn}>
        <TouchableOpacity
          style={{ marginHorizontal: 20 }}
          onPress={handleAddTarget}
        >
          <AddChannelIcon
            width={20}
            height={20}
            style={{ borderRadius: 10, borderWidth: 1, borderColor: '#ababab' }}
            color="#666"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChannelList;


const styles = StyleSheet.create({
  channelBox: {
    flex: 3,
    flexDirection:'row',
  },

  selectedChannel:{
    flexDirection:'row',
    borderColor: '#cecece',
    borderWidth: 1,
    padding: 4,
    alignSelf: 'center',
    borderRadius: 50,
    marginTop: 4,
    alignItems: 'center',
    marginLeft:-7
  },

  channelImgBox:{
    width:25,
    height:25, 
  },

  channelImg:{
    width:'100%',
    height:'100%',
    borderRadius:50,
    resizeMode: 'stretch',
  },

  channelTxt: {
    fontSize: 16,
    marginTop:2,
    marginLeft:2
  },



  plusBtn: {
    flex: 1,
  },
});