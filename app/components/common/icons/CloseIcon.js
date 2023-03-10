import Svg, { Polygon } from 'react-native-svg';

import React from 'react';

const CloseIcon = ({ color, width, height }) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Polygon
        fill={color}
        points="77.6,21.1 49.6,49.2 21.5,21.1 19.6,23 47.6,51.1 19.6,79.2 21.5,81.1 49.6,53 77.6,81.1 79.6,79.2   51.5,51.1 79.6,23 "
        strokeWidth="3.5"
        stroke={color}
      />
    </Svg>
  );
};

export default CloseIcon;
