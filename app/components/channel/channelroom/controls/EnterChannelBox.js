import React, { useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { openModal, changeModal } from '@/modules/modal';
import { useSelector, useDispatch } from 'react-redux';
import { openChannel } from '@/modules/channel';
import { moveToChannelRoom } from '@/lib/channelUtil';
import * as channelApi from '@API/channel';
import AddChannelIcon from '@COMMON/icons/AddChannelIcon';
import LockIcon from '@COMMON/icons/LockIcon';
import { getScreenWidth } from '@/lib/device/common';
import { getServer, getDic } from '@/config';
import { getBackgroundColor } from '@/lib/common';

const EnterChannelBox = ({ navigation, channelInfo, onChannelJoin }) => {
  const id = useSelector(({ login }) => login.id);
  const dispatch = useDispatch();
  const joinChannel = useCallback(
    params => {
      channelApi.joinChannel(params).then(({ data }) => {
        if (data.status === 'SUCCESS') {
          const { roomId } = params;
          onChannelJoin?.(roomId);
          dispatch(openChannel({ roomId }));
          moveToChannelRoom(navigation, 'ChannelRoom', { roomID: roomId });
        }
      });
    },
    [dispatch, navigation, onChannelJoin],
  );
  const handleJoinChannel = () => {
    if (channelInfo.openType !== 'O') {
      dispatch(
        changeModal({
          modalData: {
            closeOnTouchOutside: true,
            type: 'channelPasswordInput',
            channel: channelInfo,
            members: [id],
            navigation: navigation,
          },
        }),
      );
      dispatch(openModal());
    } else {
      Alert.alert(
        null,
        getDic('Msg_AskEnterChannel'),
        [
          {
            text: getDic('Cancel'),
          },
          {
            text: getDic('Ok'),
            onPress() {
              joinChannel({
                roomId: channelInfo.roomId,
                openType: channelInfo.openType,
                members: [id],
              });
            },
          },
        ],
        { cancelable: true },
      );
    }
  };
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        marginBottom: 20,
      }}
      onPress={handleJoinChannel}
    >
      {channelInfo.iconPath ? (
        (channelInfo.openType != 'O' && (
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: '#fff',
              borderRadius: 10,
              marginRight: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LockIcon color="black" width="32" height="32" />
          </View>
        )) ||
        (channelInfo.openType == 'O' && (
          <Image
            style={{
              width: 50,
              height: 50,
              backgroundColor: '#f5f5f5',
              borderRadius: 10,
              marginRight: 12,
            }}
            source={{
              uri: `${getServer('HOST')}${channelInfo.iconPath}`,
            }}
          />
        ))
      ) : (
        <View
          style={{
            width: 50,
            height: 50,
            borderWidth: 1.0,
            borderColor: '#ddd',
            backgroundColor: getBackgroundColor(channelInfo.roomName),
            borderRadius: 15,
            marginRight: 12,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              textAlignVertical: 'center',
              textAlign: 'center',
              color: 'white',
              fontSize: 17,
            }}
          >
            {channelInfo.roomName.substring(0, 1)}
          </Text>
        </View>
      )}
      <View style={{ width: getScreenWidth() * 0.52 }}>
        <View style={{ flexDirection: 'row' }}>
          {channelInfo.openType != 'O' ? (
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
          ) : (
            <></>
          )}
          <Text style={{ fontSize: 16, marginTop: 3 }} numberOfLines={1}>
            {channelInfo.roomName + '(' + channelInfo.categoryName + ')'}
          </Text>
        </View>
        {channelInfo.description ? (
          <Text
            style={{ fontSize: 16, marginTop: 3, color: '#777' }}
            numberOfLines={1}
          >
            {channelInfo.description}
          </Text>
        ) : (
          <Text style={{ fontSize: 16, marginTop: 3, color: '#777' }}>
            {getDic('NoDescription')}
          </Text>
        )}
      </View>

      <View
        style={{
          width: 35,
          height: 35,
          borderColor: '#e0e0e0',
          borderWidth: 0.8,
          borderRadius: 5,
          marginTop: 12,
          marginLeft: 'auto',
        }}
      >
        <AddChannelIcon color={'black'} width="32" height="32" />
      </View>
    </TouchableOpacity>
  );
};

export default EnterChannelBox;
