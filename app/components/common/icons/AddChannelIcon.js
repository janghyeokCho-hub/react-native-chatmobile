import React from 'react';

import Svg, { Polygon } from 'react-native-svg';

const AddChannelIcon = ({ color, width, height }) => {
  return (
    <Svg width={width} height={height} viewBox="-11 -3 120 120">
      <Polygon
        fill={color}
        stroke={color}
        strokeWidth="1"
        points="80.2,51.6 51.4,51.6 51.4,22.6 48.9,22.6 48.9,51.6 19.9,51.6 19.9,54.1 48.9,54.1 48.9,83.1 51.4,83.1 51.4,54.1 80.4,54.1 80.4,51.6 "
      />
    </Svg>
  );
};

export default AddChannelIcon;
