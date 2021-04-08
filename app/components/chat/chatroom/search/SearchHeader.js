import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { getDic } from '@/config';
import Svg, { Path } from 'react-native-svg';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '@react-navigation/native';
const cancelBtnImg = require('@C/assets/ico_cancelbutton.png');

const SearchHeader = ({ value, onSearchBox, onSearch, disabled }) => {
  const { sizes } = useTheme();

  const [searchText, setSearchText] = useState('');
  const searchInput = useRef(null);

  const hideSearchBox = () => {
    onSearchBox();
  };

  const handleSearch = () => {
    if (searchText != '') {
      onSearch(searchText);
    }
  };

  useEffect(() => {
    searchInput.current.focus();
    if (value != null && value != '') setSearchText(value);
  }, []);

  useEffect(() => {
    searchInput.current.focus();
    if (value != null && value != '') setSearchText(value);
  }, [value]);

  return (
    <>
      <View style={styles.top}>
        <View style={styles.searchTextWrap}>
          <View style={styles.searchIcon}>
            <Svg width="18" height="18" viewBox="0 0 13.364 13.364">
              <Path
                d="M304.2,2011.439l-3.432-3.432a5.208,5.208,0,0,0,.792-2.728,5.279,5.279,0,1,0-5.28,5.279,5.208,5.208,0,0,0,2.728-.792l3.432,3.432a.669.669,0,0,0,.88,0l.88-.88A.669.669,0,0,0,304.2,2011.439Zm-7.919-2.64a3.52,3.52,0,1,1,3.52-3.52A3.53,3.53,0,0,1,296.279,2008.8Z"
                transform="translate(-291 -2000)"
                fill="#ababab"
              />
            </Svg>
          </View>
          <View style={styles.searchInputWrap}>
            <TextInput
              ref={searchInput}
              placeholder={getDic('Msg_SearchPlaceHolder')}
              keyboardType="web-search"
              value={searchText}
              editable={!disabled}
              placeholderTextColor="#AAA"
              onChangeText={text => {
                setSearchText(text);
              }}
              onSubmitEditing={handleSearch}
              style={{ ...styles.searchInput, fontSize: sizes.default }}
            />
          </View>
        </View>
        <TouchableOpacity onPress={hideSearchBox}>
          <View style={styles.cancelBtn}>
            <Image source={cancelBtnImg} />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  top: {
    width: '100%',
    height: hp('9%'),
    backgroundColor: '#F6F6F6',
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 20,
    paddingBottom: 20,
  },
  searchTextWrap: {
    flexDirection: 'row',
    height: 35,
    flex: 1,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: '#BBB',
    backgroundColor: '#FFF',
  },
  searchIcon: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputWrap: {
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
    flex: 1,
  },
  searchInput: {
    color: '#000',
    width: '100%',
    paddingTop: 0,
    marginLeft: 5,
    paddingBottom: 0,
  },
  cancelBtn: {
    width: 30,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchHeader;
