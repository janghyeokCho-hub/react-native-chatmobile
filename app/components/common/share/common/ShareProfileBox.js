import React, { useState, useMemo } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { getBackgroundColor, getDictionary } from '@/lib/common';
import * as api from '@COMMON/share/lib/api';
import Svg, { G, Path } from 'react-native-svg';
const ShareProfileBox = ({ type, img, userName, style }) => {
  const [imgVisible, setImgVisible] = useState(true);

  const nameCode = useMemo(() => {
    return getBackgroundColor(getDictionary(userName));
  }, [userName]);

  return (
    <>
      {(type === 'U' && (
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
              source={{ uri: `${img}` }}
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
        </View>
      )) || (
        <View style={styles.groupImage}>
          <Svg width="25.983" height="25.184" viewBox="0 0 19.983 18.184">
            <G transform="translate(3651 -1491)">
              <Path
                d="M20.983,18.886a1.8,1.8,0,0,1-1.8,1.8H4.8a1.8,1.8,0,0,1-1.8-1.8V6.3A1.8,1.8,0,0,1,4.8,4.5h4.5l1.8,2.7h8.092a1.8,1.8,0,0,1,1.8,1.8Z"
                transform="translate(-3653 1487.5)"
                fill="none"
                stroke="#979797"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
              <G transform="translate(-3647.003 1499.467)">
                <Path
                  d="M14.331,10.495A1.481,1.481,0,1,1,12.85,9.014,1.481,1.481,0,0,1,14.331,10.495Zm-3.163,4.39a.686.686,0,0,1-.686-.686v-.387a1.5,1.5,0,0,1,1.506-1.495h1.725a1.5,1.5,0,0,1,1.5,1.495V14.2a.686.686,0,0,1-.686.686Z"
                  transform="translate(-10.482 -9.014)"
                  fill="#12cfee"
                />
              </G>
            </G>
          </Svg>
        </View>
      )}
    </>
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
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
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

export default ShareProfileBox;
