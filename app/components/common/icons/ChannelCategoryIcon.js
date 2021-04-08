import React from 'react';

import Svg, { G, Path } from 'react-native-svg';

const ChannelCategoryIcon = ({ color }) => {
  return (
    <Svg height="17" viewBox="0 0 32 32" width="17">
      <G>
        <Path
          d="M12,0H2C0.895,0,0,0.895,0,2v10c0,1.104,0.895,2,2,2h10c1.105,0,2-0.896,2-2V2C14,0.895,13.105,0,12,0zM12,12H2V2h10V12z"
          fill="#121313"
        />
        <Path
          d="M30,0H20c-1.105,0-2,0.895-2,2v10c0,1.104,0.895,2,2,2h10c1.104,0,2-0.896,2-2V2C32,0.895,31.104,0,30,0zM30,12H20V2h10V12z"
          fill="#121313"
        />
        <Path
          d="M30,18H20c-1.105,0-2,0.896-2,2v10c0,1.105,0.895,2,2,2h10c1.104,0,2-0.895,2-2V20C32,18.895,31.104,18,30,18z M30,30l-10,0V20h10V30z"
          fill="#121313"
        />
        <Path
          d="M12,18H2c-1.105,0-2,0.896-2,2v10c0,1.105,0.895,2,2,2h10c1.105,0,2-0.895,2-2V20C14,18.895,13.105,18,12,18z M12,30L2,30V20h10V30z"
          fill="#121313"
        />
      </G>
    </Svg>
  );
};

export default ChannelCategoryIcon;
