import React from 'react';
import Svg, { Path } from 'react-native-svg';

const DropDownIcon = ({ color, width, height }) => {
  return (
    <Svg width="18" height="10" viewBox="0 0 10 6">
      <Path
        id="다각형_1"
        data-name="다각형 1"
        d="M4.5,0,9,5H0Z"
        transform="translate(9 5) rotate(180)"
        fill="#222"
      />
    </Svg>
  );
};

export default DropDownIcon;
