import React from 'react';

import Svg, { G, Path } from 'react-native-svg';

const ChannelCategoryItemIcon = ({ color, width, height }) => {
  return (
    <Svg height={height} width={width} viewBox="0 0 512 512">
      <G>
        <Path
          d="M96,370.9c0,15.5,12.7,29.1,28.2,29.1h266.3c15.5,0,25.5-13.6,25.5-29.1V208H96V370.9z"
          fill={color}
        />
        <Path
          d="M416,168.8c0-15.5-10-24.8-25.5-24.8c0,0-154.7,0-167,0c-4.7,0-10.7-9.9-18.5-19c-7.1-8.3-14.7-13-20.5-13c-7.5,0-60.3,0-60.3,0c-15.5,0-28.2,8.9-28.2,24.3V192h320V168.8z"
          fill={color}
        />
      </G>
    </Svg>
  );
};

export default ChannelCategoryItemIcon;
