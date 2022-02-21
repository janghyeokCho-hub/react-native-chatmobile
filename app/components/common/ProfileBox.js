import React, { useState, useMemo } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import PresenceButton from '@COMMON/buttons/PresenceButton';
import { getBackgroundColor, getDictionary } from '@/lib/common';
import { makePhotoPath } from '@/lib/util/paramUtil';

const ProfileBox = ({ userId, img, userName, presence, isInherit, style }) => {
  const [imgVisible, setImgVisible] = useState(true);

  const nameCode = useMemo(() => {
    return getBackgroundColor(getDictionary(userName));
  }, [userName]);
  const photoPath = useMemo(() => makePhotoPath(img), [img]);

  return (
    <View style={style ? style : styles.profileBox}>
      {(img && imgVisible && (
        <Image
          style={[
            styles.profileImage,
            {
              borderRadius:
                (style && style.borderRadius && style.borderRadius) ||
                styles.profileBox.borderRadius,
            },
          ]}
          source={{ uri: `${photoPath}` }}
          onError={e => {
            setImgVisible(false);
          }}
        />
      )) || (
        <View
          style={[
            styles.profileImage,
            styles.profileText,
            {
              backgroundColor: nameCode,
              borderRadius:
                (style && style.borderRadius && style.borderRadius) ||
                styles.profileBox.borderRadius,
            },
          ]}
        >
          <Text
            style={[
              styles.profileImageText,
              {
                fontSize:
                  (style &&
                    style.width &&
                    Math.round(parseInt(style.width) / 3)) ||
                  17,
                color: '#fff',
              },
            ]}
          >
            {(getDictionary(userName) && getDictionary(userName)[0]) || ''}
          </Text>
        </View>
      )}
      <PresenceButton userId={userId} state={presence} isInherit={isInherit} />
    </View>
  );
};

const styles = StyleSheet.create({
  profileBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  profileText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default React.memo(ProfileBox);
