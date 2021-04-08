import React, { useCallback } from 'react';
import { TouchableOpacity } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import { setSearchKeyword } from '@/modules/channel';
import { setSearchKeywordRoom } from '@/modules/room';

import Plain from '@C/chat/message/types/Plain';

const Tag = ({ marking, text, value, style }) => {
  const { isRoom, isChannel } = useSelector(({ room, channel }) => ({
    isRoom: !!room.currentRoom,
    isChannel: !!channel.currentChannel,
  }));

  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    if (text) {
      // text: #해시태그
      // 일반 채팅에서도 #해시태그 검색이 되야한다면 이부분을 수정해야함
      if (isChannel) {
        dispatch(
          setSearchKeyword({
            keyword: text.substring(1, text.length),
          }),
        );
      } else if (isRoom) {
        dispatch(
          setSearchKeywordRoom({
            keyword: text.substring(1, text.length),
          }),
        );
      }
    }
  }, [text]);

  return (
    <TouchableOpacity onPress={handleClick}>
      <Plain
        marking={marking}
        text={text}
        style={{ ...style, fontWeight: '700' }}
      />
    </TouchableOpacity>
  );
};

export default React.memo(Tag);
