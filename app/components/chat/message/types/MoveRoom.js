import React, { useDispatch } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Plain from '@C/chat/message/types/Plain';
import { openChannel } from '@/modules/channel';
import { moveToChannelRoom } from '@/lib/channelUtil';

const MoveRoom = ({ dispatch, navigation, marking, roomId, style }) => {
  return (
    <>
      {roomId && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              dispatch(openChannel({ roomId }));
              moveToChannelRoom(navigation, 'ChannelRoom', { roomID: roomId });
            }}
            style={{
              backgroundColor: '#fff',
              width: 150,
              height: 25,
              borderRadius: 10,
              justifyContent: 'center',
            }}
          >
            <Plain
              marking={marking}
              text={'해당방으로 이동하기'}
              style={{ textAlign: 'center' }}
            />
          </TouchableOpacity>
        </>
      )}
    </>
  );
};

export default React.memo(MoveRoom);
