import React from 'react';

import Svg, { Polygon } from 'react-native-svg';

const AddChannelIcon = ({ color, width, height, ...rest }) => {
  return (
    <Svg width={width || "20"} height={height || "20"} viewBox="-11 -3 120 120" {...rest}>
      <Polygon
        fill={color || '#ababab'}
        stroke={color || '#ababab'}
        strokeWidth="1"
        points="80.2,51.6 51.4,51.6 51.4,22.6 48.9,22.6 48.9,51.6 19.9,51.6 19.9,54.1 48.9,54.1 48.9,83.1 51.4,83.1 51.4,54.1 80.4,54.1 80.4,51.6 "
      />
    </Svg>
  );
};

export default AddChannelIcon;
