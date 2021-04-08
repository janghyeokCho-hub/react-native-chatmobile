import React from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
const checkedImage = require('@C/assets/SlideCheckedButton.png');
const uncheckedImage = require('@C/assets/SlideUnCheckedButton.png'); // theme 적용하려면 svg 로 바꾸거나 테마용 파일 필요

const SlideCheckedBox = ({ title, checkValue, onPress }) => {
  const { colors, sizes } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: sizes.default }}>{title}</Text>
      <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
        {checkValue ? (
          <Image source={checkedImage} style={styles.buttonImage} />
        ) : (
          <Image source={uncheckedImage} style={styles.buttonImage} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    margin: 21,
  },
  buttonContainer: {
    marginLeft: 'auto',
  },
  buttonImage: {
    width: 64,
    height: 25,
  },
});

export default SlideCheckedBox;
