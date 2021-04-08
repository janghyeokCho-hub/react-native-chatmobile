import Svg, { G, Path, Polyline } from 'react-native-svg';

import React from 'react';

const MenuIcon = ({ color, width, height }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32">
      <Path
        d="M16,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S17.654,13,16,13z"
        id="XMLID_287_"
        fill={color}
      />
      <Path
        d="M6,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S7.654,13,6,13z"
        id="XMLID_289_"
        fill={color}
      />
      <Path
        d="M26,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S27.654,13,26,13z"
        id="XMLID_291_"
        fill={color}
      />
    </Svg>
  );
};

export default MenuIcon;
