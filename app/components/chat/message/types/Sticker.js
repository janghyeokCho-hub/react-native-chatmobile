import React, { useState, useEffect } from 'react';
import { getServer } from '@/config';
import FastImage from 'react-native-fast-image';
import { TouchableOpacity } from 'react-native';
import { getConfig } from '@/config';

const initNoImg = require('@C/assets/no_image.jpg');

const Sticker = ({
  companyCode,
  groupId,
  emoticonId,
  type,
  style,
  longPressEvt,
}) => {
  const IsSaaSClient = getConfig('IsSaaSClient', 'N');
  const storagePrefix = getConfig('storePrefix', '/storage/');
  const [resource, setResource] = useState({
    uri:
      IsSaaSClient === 'Y'
        ? `${getServer(
            'HOST',
          )}${storagePrefix}emoticon/${companyCode}/${groupId}/${emoticonId}.${
            type === 'A' ? 'gif' : 'png'
          }`
        : `${getServer(
            'HOST',
          )}${storagePrefix}emoticon/${groupId}/${emoticonId}.${
            type === 'A' ? 'gif' : 'png'
          }`,
    priority: FastImage.priority.high,
  });

  const [isAnimation, setIsAnimation] = useState(type === 'A');

  useEffect(() => {
    if (isAnimation) {
      setResource({
        uri:
          IsSaaSClient === 'Y'
            ? `${getServer(
                'HOST',
              )}${storagePrefix}emoticon/${companyCode}/${groupId}/${emoticonId}.gif`
            : `${getServer(
                'HOST',
              )}${storagePrefix}emoticon/${groupId}/${emoticonId}.gif`,
        priority: FastImage.priority.high,
      });
    }
  }, [isAnimation]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={e => {
        if (type === 'A' && !isAnimation) setIsAnimation(true);
      }}
      onLongPress={e => {
        longPressEvt && longPressEvt();
      }}
    >
      <FastImage
        source={resource}
        onError={e => {
          setResource(initNoImg);
        }}
        style={{ width: style?.width || 150, height: style?.height || 150 }}
      />
    </TouchableOpacity>
  );
};

export default React.memo(Sticker);
