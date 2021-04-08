import React from 'react';
import { Text, StyleSheet, View, TextInput } from 'react-native';

const TitleInputBox = ({
  editable,
  title,
  value,
  placeholder,
  onChageTextHandler,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        editable={editable}
        placeholderTextColor={'#AAA'}
        placeholder={placeholder}
        onChangeText={text => {
          onChageTextHandler(text);
        }}
        value={value}
        style={{
          borderBottomColor: '#f0f0f0',
          borderBottomWidth: 1.3,
          marginBottom: -15,
          marginTop: 15,
          fontSize: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 21,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TitleInputBox;
