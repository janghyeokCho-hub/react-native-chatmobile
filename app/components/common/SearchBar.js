import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import SyncLoading from './SyncLoading';
import { useTheme } from '@react-navigation/native';
import CloseIcon from '@COMMON/icons/CloseIcon';
const searchImg = require('@C/assets/search.png');
const searchDelImg = require('@C/assets/ico_select_delete.png');

const SearchBar = ({
  style,
  onChangeText,
  placeholder,
  disabled,
  searchText,
  setsearchText,
}) => {
  const { colors, sizes } = useTheme();
  const inputRef = useRef();

  return (
    <View>
      <View style={style}>
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            disabled && styles.textDisabled,
            { fontSize: (sizes && sizes.default) || 14 },
          ]}
          onChangeText={onChangeText}
          value={searchText}
          placeholder={placeholder}
          placeholderTextColor={'#AAA'}
          editable={disabled == undefined ? true : !disabled}
        />
        {searchText == '' ? (
          <Image source={searchImg} style={styles.searchImg} />
        ) : (
          <TouchableWithoutFeedback
            onPress={() => {
              onChangeText('');
            }}
          >
            <View style={styles.searchDelImg}>
              <CloseIcon color={'#AAA'} width={18} height={18} />
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
      <SyncLoading />
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 0.5,
    borderRadius: 20,
    paddingLeft: 25,
    paddingRight: 45,
    color: '#222',
  },
  textDisabled: {
    backgroundColor: '#ddd',
  },
  searchImg: {
    position: 'absolute',
    width: 25,
    height: 25,
    right: 10,
    top: 7,
  },
  searchDelImg: {
    position: 'absolute',
    width: 16,
    height: 16,
    right: 12.5,
    top: 9.5,
  },
});

export default SearchBar;
