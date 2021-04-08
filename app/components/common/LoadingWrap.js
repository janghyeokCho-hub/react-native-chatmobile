import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

const loadingImg = require('@C/assets/loading.gif');

const LoadingWrap = ({ isOver, title }) => {
  return (
    <View style={isOver ? styles.loadingOver : styles.loadingBack}>
      <Image source={loadingImg} style={{ width: 100, height: 100 }} />
      <Text>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingBack: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOver: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.8,
    backgroundColor: 'white',
  },
});

export default LoadingWrap;
