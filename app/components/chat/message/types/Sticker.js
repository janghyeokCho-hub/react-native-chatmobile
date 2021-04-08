import React, { useState, useEffect, useRef } from 'react';
import { getServer } from '@/config';
import FastImage from 'react-native-fast-image';
import { TouchableOpacity } from 'react-native';
import { getConfig } from '@/config';

const initNoImg = require('@C/assets/no_image.jpg');

const Sticker = ({ companyCode, groupId, emoticonId, type }) => {
  const IsSaaSClient = getConfig('IsSaaSClient', 'N');
  const storagePrefix = getConfig('storePrefix', '/storage/');
  const timer = useRef(null);
  const [resource, setResource] = useState({
    uri:
      IsSaaSClient == 'Y'
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
    return () => {
      if (timer && timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isAnimation) {
      clearTimeout(timer.current);
      setResource({
        uri:
          IsSaaSClient == 'Y'
            ? `${getServer(
                'HOST',
              )}${storagePrefix}emoticon/${companyCode}/${groupId}/${emoticonId}.gif`
            : `${getServer(
                'HOST',
              )}${storagePrefix}emoticon/${groupId}/${emoticonId}.gif`,
        priority: FastImage.priority.high,
      });
      timer.current = setTimeout(() => {
        setResource({
          uri:
            IsSaaSClient == 'Y'
              ? `${getServer(
                  'HOST',
                )}${storagePrefix}emoticon/${companyCode}/${groupId}/${emoticonId}.png`
              : `${getServer(
                  'HOST',
                )}${storagePrefix}emoticon/${groupId}/${emoticonId}.png`,
          priority: FastImage.priority.high,
        });

        setIsAnimation(false);
        timer.current = null;
      }, 6000);
    }
  }, [isAnimation]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={e => {
        if (type === 'A' && !isAnimation) setIsAnimation(true);
      }}
    >
      <FastImage
        source={resource}
        onError={e => {
          setResource(initNoImg);
        }}
        style={{ width: 150, height: 150 }}
      />
    </TouchableOpacity>
  );
};

export default React.memo(Sticker);
