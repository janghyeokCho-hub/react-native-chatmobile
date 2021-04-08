import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { getServer } from '@/config';
import VersionCheck from 'react-native-version-check';

const VersionInfo = () => {
  const version = VersionCheck.getCurrentVersion();

  return (
    <View style={styles.container}>
      <View style={styles.versionView}>
        <Image
          source={{
            uri: `${getServer('HOST')}/chatStyle/common/image/common/logo.png`,
          }}
          style={styles.logoImg}
        />
        <Text style={styles.versionText}>v {version}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  versionView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImg: {
    width: 230,
    height: 150,
    marginTop: -30,
    marginRight: -10,
    resizeMode: 'contain',
  },
  versionText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default VersionInfo;
