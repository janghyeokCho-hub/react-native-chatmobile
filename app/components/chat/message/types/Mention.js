import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Text, View, TouchableOpacity } from 'react-native';
import { getProfileInfo } from '@API/profile';
import { getJobInfo } from '@/lib/common';
import useMemberInfo from '@/lib/hooks/useMemberInfo';

const Mention = ({
  marking,
  mentionInfo,
  navigation,
  type,
  targetId,
  longPressEvt,
  messageType
}) => {
  const [value, setValue] = useState('');
  const [memberInfo, setMemberInfo] = useState(null);
  const { findMemberInfo } = useMemberInfo(messageType);

  const setMention = async () => {
    if (type == 'user' && targetId) {
      if (mentionInfo && Array.isArray(mentionInfo)) {
        const memberInfo = await findMemberInfo(mentionInfo, targetId);
        if (memberInfo === null) {
          // 서버로부터 데이터를 받아오지 못한 경우 기본값으로 Unknown 노출
          setValue('@Unknown');
        } else if (memberInfo.name) {
          setValue(`@${getJobInfo(memberInfo)}`);
        } else if (memberInfo.id) {
          setValue(`@${memberInfo.id}`);
        }
        setMemberInfo(memberInfo);
      }
    }
  }

  useEffect(() => {
    setMention();
  }, []);

  const handleClick = () => {
    navigation.navigate('profilebox', {});
  };

  return (
    <>
      {targetId && (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ProfilePopup', {
              targetID: targetId,
            });
          }}
          onLongPress={e => {
            longPressEvt && longPressEvt();
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>{value}</Text>
        </TouchableOpacity>
      )}
      {/* {memberInfo && (
        <TouchableOpacity onPress={handleClick}>
          <Plain
            marking={marking}
            text={value}
            style={[
              style,
              {
                color: memberInfo.isMine ? 'pink' : 'black',
                fontWeight: '700',
              },
            ]}
          />
        </TouchableOpacity>
      )} */}
    </>
  );
};

export default React.memo(Mention);
