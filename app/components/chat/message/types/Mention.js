import React, { useState, useEffect, useRef } from 'react';
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
  messageType,
}) => {
  const [value, setValue] = useState('');
  const [memberInfo, setMemberInfo] = useState(null);
  const { findMemberInfo } = useMemberInfo(messageType);
  const _isMounted = useRef(true);

  const setMention = async () => {
    if (type === 'user' && targetId) {
      if (mentionInfo && Array.isArray(mentionInfo)) {
        try {
          const info = await findMemberInfo(mentionInfo, targetId);
          let txt = '@Unknown';

          if (info?.name) {
            const jobInfo = getJobInfo(info);
            txt = `@${jobInfo}`;
          } else if (info?.id) {
            txt = `@${info.id}`;
          }

          if (_isMounted.current === true) {
            setValue(txt);
            setMemberInfo(info);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  useEffect(() => {
    setMention();
  }, []);

  useEffect(() => {
    return () => {
      setValue(null);
      setMemberInfo(null);
      _isMounted.current = false;
    };
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
