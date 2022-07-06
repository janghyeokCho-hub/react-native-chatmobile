import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';
import useSWR from 'swr';

import { getBottomPadding } from '@/lib/device/common';
import KeySpacer from '@C/common/layout/KeySpacer';
import { getDic } from '@/config';

const SearchIndexBox = ({ length, onChange, handleNext }) => {
  const { sizes } = useTheme();
  const [index, setIndex] = useState(0);
  const { data: searchOptionState } = useSWR('message/search', null);

  const handleSearchIndex = changedIndex => {
    onChange(changedIndex);
    setIndex(changedIndex);
  };

  useEffect(() => {
    setIndex(0);
  }, [length]);

  return (
    <>
      <View style={styles.container}>
        {(length > 0 && (
          <>
            <View style={styles.indexBox}>
              <Text style={styles.indexText}>
                {index + 1} / {length}
              </Text>
            </View>
            {searchOptionState?.type === 'Name' &&
              typeof handleNext === 'function' && (
                <TouchableOpacity
                  onPress={handleNext}
                  style={styles.showMoreBtn}
                >
                  <Text style={{ color: '#444' }}>{getDic('SeeMore')}</Text>
                </TouchableOpacity>
              )}
            <View style={styles.indexArrowBox}>
              <TouchableOpacity
                onPress={() => {
                  if (index < length - 1) {
                    handleSearchIndex(index + 1);
                  }
                }}
              >
                <View style={styles.indexArrowBtnWrap}>
                  <Svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13.909"
                    height="7.953"
                    viewBox="0 0 13.909 7.953"
                  >
                    <Path
                      d="M18.052,13.837,12.788,8.577a.99.99,0,0,1,0-1.4,1,1,0,0,1,1.408,0l5.963,5.959a.992.992,0,0,1,.029,1.371l-5.988,6a.994.994,0,0,1-1.408-1.4Z"
                      transform="translate(-6.885 20.449) rotate(-90)"
                      fill="#999"
                    />
                  </Svg>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (index > 0) {
                    handleSearchIndex(index - 1);
                  }
                }}
              >
                <View style={styles.indexArrowBtnWrap}>
                  <Svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13.909"
                    height="7.953"
                    viewBox="0 0 13.909 7.953"
                  >
                    <Path
                      d="M18.052,13.837,12.788,8.577a.99.99,0,0,1,0-1.4,1,1,0,0,1,1.408,0l5.963,5.959a.992.992,0,0,1,.029,1.371l-5.988,6a.994.994,0,0,1-1.408-1.4Z"
                      transform="translate(20.794 -12.496) rotate(90)"
                      fill="#999"
                    />
                  </Svg>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )) || (
          <>
            <View style={styles.indexBox}>
              <Text style={{ ...styles.indexText, fontSize: sizes.default }}>
                0 / 0
              </Text>
            </View>
          </>
        )}
      </View>
      <KeySpacer
        spacing={getBottomPadding()}
        style={{ backgroundColor: '#F6F6F6' }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
  },
  indexText: {
    color: '#888',
  },
  indexArrowBox: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexBox: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 15,
  },
  indexArrowBtnWrap: {
    height: '100%',
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showMoreBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#AAA',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});

export default SearchIndexBox;
