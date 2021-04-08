import Svg, { G, Path, Rect } from 'react-native-svg';

import React from 'react';

const ChannelNoticeIcon = ({ color, width, height }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 22.469 19.05">
      <G
        id="그룹_466"
        data-name="그룹 466"
        transform="translate(3296.9 -3961.1)"
      >
        <Path
          id="빼기_12"
          data-name="빼기 12"
          d="M3.5,17.25A2.754,2.754,0,0,1,.75,14.5v-2c0-.086,0-.172.012-.257L6.25,13.994V14.5A2.753,2.753,0,0,1,3.5,17.25Z"
          transform="translate(-3291 3962)"
          fill="none"
          stroke={color}
          stroke-width="1.8"
        />
        <Rect
          id="사각형_1651"
          data-name="사각형 1651"
          width="5"
          height="7"
          transform="translate(-3296 3967)"
          fill="none"
          stroke={color}
          stroke-linejoin="round"
          stroke-width="1.8"
        />
        <Path
          id="패스_1934"
          data-name="패스 1934"
          d="M0,1,15.67-4V13L0,8Z"
          transform="translate(-3291 3966)"
          fill="none"
          stroke={color}
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
        />
      </G>
    </Svg>
  );
};

export default ChannelNoticeIcon;
