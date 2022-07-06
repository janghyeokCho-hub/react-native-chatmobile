import React, { useCallback, useState, useRef, useLayoutEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Picker } from '@react-native-picker/picker';
import { throttle } from 'throttle-debounce';

import { getDic, getConfig } from '@/config';
import { useTheme } from '@react-navigation/native';
import cancelBtnImg from '@C/assets/ico_cancelbutton.png';
import ChannelMentionBox from '@/components/channel/channelroom/controls/ChannelMentionBox';
import { getDictionary } from '@/lib/common';

function getActiveAttributes(active) {
  if (active) {
    return {
      label: '🔍',
      style: {
        color: '#f50057',
      },
    };
  } else {
    return {
      label: '',
      style: {},
    };
  }
}

const SearchHeader = ({
  value,
  onSearchBox,
  onSearch,
  disabled,
  initialSearchData = [],
}) => {
  const { sizes } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [suggestMember, setSuggestMember] = useState([]);
  const [openSuggestionBox, setOpenSuggestionBox] = useState(false);
  const [selectedSearchOption, setSelectedSearchOption] = useState('Context');
  const useSearchByName = getConfig('UseSearchMessageByName') || { use: false };
  const searchInput = useRef(null);
  const handleClose = () => {
    if (openSuggestionBox) {
      setOpenSuggestionBox(false);
    } else {
      onSearchBox();
    }
  };

  const handleSearch = () => {
    // Name 검색은 MentionBox 선택시에만 onSearch가 동작해야 함
    // => Context 검색인 경우에만 onSubmitEditing 핸들러 동작하도록 조건 부여
    if (selectedSearchOption === 'Context' && searchText !== '') {
      onSearch(selectedSearchOption, searchText);
    }
  };

  const focusInput = useCallback(() => {
    searchInput.current.focus();
    if (selectedSearchOption === 'Name') {
      setOpenSuggestionBox(true);
    }
  }, [searchInput, selectedSearchOption]);

  useLayoutEffect(() => {
    focusInput();
    if (value !== null && value !== '') {
      setSearchText(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextAttributes = getActiveAttributes(
    selectedSearchOption === 'Context',
  );
  const nameAttributes = getActiveAttributes(selectedSearchOption === 'Name');

  const throttledHandleSearch = useCallback(
    throttle(300, text => {
      if (selectedSearchOption !== 'Name' || !text) {
        return;
      }
      const result = initialSearchData.filter(
        data => data?.name?.search?.(text) >= 0,
      );
      setSuggestMember(result);
    }),
    [selectedSearchOption],
  );
  useLayoutEffect(() => throttledHandleSearch(searchText), [
    throttledHandleSearch,
    searchText,
  ]);

  return (
    <View>
      <View style={styles.top}>
        <View
          style={{
            width: Platform.OS === 'ios' && useSearchByName?.use ? 120 : 36,
            ...styles.searchIcon,
          }}
        >
          {useSearchByName?.use ? (
            <Picker
              style={styles.searchOptionPicker}
              itemStyle={styles.searchOptionPickerItem}
              selectedValue={selectedSearchOption}
              onValueChange={itemValue => {
                setSelectedSearchOption(itemValue);
                // option 전환시 Input 초기화
                setSearchText('');
                // Context > Name 전환시 SuggestionBox 렌더링
                setOpenSuggestionBox(itemValue === 'Name');
              }}
              mode="dropdown"
            >
              <Picker.Item
                label={getDic('Context') + contextAttributes.label}
                value="Context"
                style={contextAttributes.style}
              />
              <Picker.Item
                label={getDic('Name') + nameAttributes.label}
                value="Name"
                style={nameAttributes.style}
              />
            </Picker>
          ) : (
            <Svg width="18" height="18" viewBox="0 0 13.364 13.364">
              <Path
                d="M304.2,2011.439l-3.432-3.432a5.208,5.208,0,0,0,.792-2.728,5.279,5.279,0,1,0-5.28,5.279,5.208,5.208,0,0,0,2.728-.792l3.432,3.432a.669.669,0,0,0,.88,0l.88-.88A.669.669,0,0,0,304.2,2011.439Zm-7.919-2.64a3.52,3.52,0,1,1,3.52-3.52A3.53,3.53,0,0,1,296.279,2008.8Z"
                transform="translate(-291 -2000)"
                fill="#ababab"
              />
            </Svg>
          )}
        </View>
        <View style={styles.searchTextWrap}>
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
              onTouchEnd={focusInput}
              onSubmitEditing={handleSearch}
              style={{ ...styles.searchInput, fontSize: sizes.default }}
            />
          </View>
        </View>
        <TouchableOpacity onPress={handleClose}>
          <View style={styles.cancelBtn}>
            <Image source={cancelBtnImg} />
          </View>
        </TouchableOpacity>
      </View>
      {openSuggestionBox && (
        <View style={styles.suggestionBoxWrap}>
          <ChannelMentionBox
            members={searchText ? suggestMember : initialSearchData}
            onPress={userInfo => {
              if (!userInfo) {
                return;
              }
              // (1) input/검색대상 state 변경 > (2) SuggestionBox 닫기 > (3) 검색API 처리
              setSearchText(getDictionary(userInfo.name));
              setOpenSuggestionBox(false);
              onSearch(selectedSearchOption, userInfo.id);
              // ...
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  top: {
    width: '100%',
    height: hp('9%'),
    backgroundColor: '#F6F6F6',
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
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
    height: 35,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchOptionPicker: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  searchOptionPickerItem: {
    fontSize: 16,
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
  suggestionBoxWrap: {
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderColor: '#DEDEDE',
  },
});

export default SearchHeader;
