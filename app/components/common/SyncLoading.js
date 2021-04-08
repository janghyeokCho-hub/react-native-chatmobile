import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { getDic } from '@/config';

const loadingImg = require('@C/assets/loading.gif');

const SyncLoading = () => {
  const sync = useSelector(({ loading }) => loading['login/SYNC']);

  return (
    <>
      {sync && (
        <View style={styles.syncLoading}>
          <Text style={styles.title}>{getDic('Msg_syncLoading')}</Text>
          <Image
            style={styles.loadingImg}
            source={loadingImg}
            resizeMode="contain"
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  syncLoading: {
    position: 'absolute',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
  },
  loadingImg: {
    height: 40,
    width: 40,
  },
});

export default SyncLoading;
