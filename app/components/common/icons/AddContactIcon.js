import Svg, { Path, G } from 'react-native-svg';

import React from 'react';

const AddContactIcon = ({ style }) => {
  const color = style?.color ||  "#262727";
  const width = style?.width || "20.418";
  const height = style?.height || "15.214";
  return (
    <Svg width={width} height={height} viewBox="0 0 20.418 15.214">
      <G transform="translate(-250.024 -412.982)">
        <Path
          d="M258.869,420.074a3.868,3.868,0,1,0-4.262,0,9.059,9.059,0,0,0-4.583,7.506.618.618,0,0,0,.616.616h12.186a.618.618,0,0,0,.616-.616A9.076,9.076,0,0,0,258.869,420.074Zm-4.766-3.225a2.629,2.629,0,1,1,2.629,2.629A2.634,2.634,0,0,1,254.1,416.849Zm-2.826,10.115c.215-3.481,3.055-6.223,5.455-6.223s5.241,2.742,5.456,6.223Z"
          fill={color}
        />
        <Path
          d="M270.443,418.022h-3.315v-3.316H265.77v3.316h-3.409v1.358h3.409V422.7h1.358V419.38h3.315Z"
          fill={color}
        />
      </G>
    </Svg>
  );
};

export default AddContactIcon;