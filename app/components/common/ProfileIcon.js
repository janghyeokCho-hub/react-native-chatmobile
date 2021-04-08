import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getServer } from '@/config';

const ProfileIcon = props => {
  return props.targetInfo != null ? (
    <TouchableOpacity style={styles.container} onPress={props.onPress}>
      <Image
        style={styles.profileImage}
        source={{
          uri: `${props.targetInfo.photoPath}`,
        }}
      />
      <View style={styles.closeButton}>
        <Text style={styles.closeButtonText}>X</Text>
      </View>
      <Text>{getJobInfo(props.targetInfo)}</Text>
    </TouchableOpacity>
  ) : (
    <Image style={styles.profileImage} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 15,
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 35,
    justifyContent: 'center',
  },
  profileImageLoading: {
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: 'silver',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    backgroundColor: '#303030',
    borderRadius: 10,
    width: 20,
    height: 20,
    right: 7,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 11,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default ProfileIcon;
