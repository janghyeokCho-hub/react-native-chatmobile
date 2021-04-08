import React from 'react';
import ShereProfileBox from '@COMMON/share/common/ShareProfileBox';
import { View, StyleSheet } from 'react-native';

const ShareRoomMemberBox = ({ type, data, roomID }) => {
  const renderType = (data, type) => (
    <>
      {data &&
        data.map((item, index) => {
          return (
            <ShereProfileBox
              key={item.id}
              type="U"
              userName={item.name}
              img={item.photoPath}
              style={{
                ...styles[`profiletype${type}`],
                ...styles[`type${type}Pos${index}`],
              }}
            />
          );
        })}
    </>
  );

  const getPhotoBox = () => {
    const type = data.length < 4 ? data.length - 1 : 3;
    let profileViewEl = <></>;
    profileViewEl = (type > -1 && renderType(data, type)) || profileViewEl;

    return (
      <View key={`rmb_view_${roomID}`} style={styles.container}>
        {profileViewEl}
      </View>
    );
  };

  return <>{data && getPhotoBox()}</>;
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
  },
  profiletype1: {
    width: 32,
    height: 32,
    borderRadius: 10,
    position: 'absolute',
  },
  type1Pos0: {
    left: 0,
    top: 0,
    zIndex: 1,
  },
  type1Pos1: {
    bottom: 0,
    right: 0,
    zIndex: 2,
  },
  profiletype2: {
    width: 27,
    height: 27,
    borderRadius: 7,
    position: 'absolute',
  },
  type2Pos0: {
    left: 25 - 13.5,
    top: 0,
    zIndex: 1,
  },
  type2Pos1: {
    left: 0,
    bottom: 0,
    zIndex: 2,
  },
  type2Pos2: {
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  profiletype3: {
    width: 24,
    height: 24,
    borderRadius: 5,
    position: 'absolute',
  },
  type3Pos0: {
    left: 0,
    top: 0,
    zIndex: 1,
  },
  type3Pos1: {
    right: 0,
    top: 0,
    zIndex: 2,
  },
  type3Pos2: {
    left: 0,
    bottom: 0,
    zIndex: 3,
  },
  type3Pos3: {
    right: 0,
    bottom: 0,
    zIndex: 4,
  },
});

export default ShareRoomMemberBox;
