import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { G, Circle, Path } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';

const Check = ({ checked, onChange, style }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={{...styles.toggleBtn, ...style}}
      onPress={e => {
        onChange(!checked);
      }}
    >
      {checked ? (
        <Svg width="22" height="22" viewBox="0 0 22 22">
          <G
            id="그룹_572"
            data-name="그룹 572"
            transform="translate(-323 -292)"
          >
            <Circle
              id="타원_629"
              data-name="타원 629"
              cx="11"
              cy="11"
              r="11"
              transform="translate(323 292)"
              fill="#eee"
            />
            <Circle
              id="타원_629-2"
              data-name="타원 629"
              cx="11"
              cy="11"
              r="11"
              transform="translate(323 292)"
              fill={colors.primary}
            />
            <G
              id="그룹_111"
              data-name="그룹 111"
              transform="translate(314 280)"
            >
              <Path
                id="패스_196"
                data-name="패스 196"
                d="M118.018,145.524l-4.954,5.515-2.613-2.506a.582.582,0,0,0-.8.842l3.038,2.922a.57.57,0,0,0,.406.165h.019a.581.581,0,0,0,.406-.194l5.361-5.961a.582.582,0,0,0-.048-.822A.562.562,0,0,0,118.018,145.524Z"
                transform="translate(-94.392 -125.316)"
                fill="#fff"
              />
            </G>
          </G>
        </Svg>
      ) : (
        <Svg width="22" height="22" viewBox="0 0 22 22">
          <G
            id="타원_649"
            data-name="타원 649"
            fill="#fff"
            stroke="#ddd"
            stroke-width="1"
          >
            <Circle cx="11" cy="11" r="11" stroke="none" />
            <Circle cx="11" cy="11" r="10.5" fill="none" />
          </G>
        </Svg>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconStyle: {
    width: 30,
    height: 30,
  },
  toggleBtn: {
    marginLeft: 'auto',
    justifyContent: 'center',
  },
});

export default Check;
