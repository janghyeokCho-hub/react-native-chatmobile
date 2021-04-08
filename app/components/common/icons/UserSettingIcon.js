import Svg, { G, Circle, Path } from 'react-native-svg';

import React from 'react';

const UserSettingIcon = ({ focus }) => {
  return (
    <>
      {(!focus && (
        <Svg width="25.876" height="26.236" viewBox="0 0 54 12.021">
          <G
            id="그룹_564"
            data-name="그룹 564"
            transform="translate(8502 -9703)"
          >
            <G
              id="그룹_561"
              data-name="그룹 561"
              transform="translate(-8502 9703.021)"
            >
              <Path
                id="패스_1721"
                data-name="패스 1721"
                d="M6,0A6,6,0,1,1,0,6,6,6,0,0,1,6,0Z"
                fill="#bbb"
              />
              <Circle
                id="타원_521"
                data-name="타원 521"
                cx="6"
                cy="6"
                r="6"
                transform="translate(21 -0.021)"
                fill="#bbb"
              />
              <Circle
                id="타원_522"
                data-name="타원 522"
                cx="6"
                cy="6"
                r="6"
                transform="translate(42 -0.021)"
                fill="#bbb"
              />
            </G>
          </G>
        </Svg>
      )) || (
        <Svg width="25.876" height="26.236" viewBox="0 0 54 12.021">
          <G
            id="그룹_569"
            data-name="그룹 569"
            transform="translate(8502 -9848)"
          >
            <G
              id="그룹_559"
              data-name="그룹 559"
              transform="translate(-8502 9848.021)"
            >
              <Path
                id="패스_1721"
                data-name="패스 1721"
                d="M6,0A6,6,0,1,1,0,6,6,6,0,0,1,6,0Z"
                fill="#444"
              />
              <Circle
                id="타원_521"
                data-name="타원 521"
                cx="6"
                cy="6"
                r="6"
                transform="translate(21 -0.021)"
                fill="#444"
              />
              <Circle
                id="타원_522"
                data-name="타원 522"
                cx="6"
                cy="6"
                r="6"
                transform="translate(42 -0.021)"
                fill="#444"
              />
            </G>
          </G>
        </Svg>
      )}
    </>
  );
};

export default UserSettingIcon;
