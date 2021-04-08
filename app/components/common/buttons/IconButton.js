import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';

const IconButton = ({ title, disable, onPress, icon }) => {
  const { sizes } = useTheme();
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      <Text style={{ fontSize: sizes.default }}>{title}</Text>
      {icon != null ? icon : <></>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    margin: 21,
  },
});

export default IconButton;
