import Svg, { G, Path, Polyline } from 'react-native-svg';

import React from 'react';

const LockIcon = ({ color, width, height }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 64 64" fill={color}>
      <G>
        <G transform="translate(284.000000, 430.000000)">
          <Path
            class="st0"
            d="M-237.7-401.3h-3v-6.4c0-6.2-5.1-11.3-11.3-11.3c-6.2,0-11.3,5.1-11.3,11.3v6.4h-3v-6.4c0-7.9,6.4-14.3,14.3-14.3s14.3,6.4,14.3,14.3V-401.3"
          />
          <Path
            class="st0"
            d="M-239.2-374.1h-25.6c-2.6,0-4.8-2.2-4.8-4.8v-19.2c0-2.6,2.2-4.8,4.8-4.8h25.6c2.6,0,4.8,2.2,4.8,4.8v19.2C-234.4-376.2-236.6-374.1-239.2-374.1L-239.2-374.1z M-264.8-399.7c-0.9,0-1.6,0.7-1.6,1.6v19.2c0,0.9,0.7,1.6,1.6,1.6h25.6c0.9,0,1.6-0.7,1.6-1.6v-19.2c0-0.9-0.7-1.6-1.6-1.6H-264.8L-264.8-399.7z"
          />
          <Path
            class="st0"
            d="M-248.8-393.3c0,1.8-1.4,3.2-3.2,3.2s-3.2-1.4-3.2-3.2s1.4-3.2,3.2-3.2S-248.8-395-248.8-393.3"
          />
          <Polyline
            class="st0"
            id="Fill-69"
            points="-251.2,-393.3 -252.8,-393.3 -254.4,-383.7 -249.6,-383.7 -251.2,-393.3"
          />
        </G>
      </G>
    </Svg>
  );
};

export default LockIcon;
