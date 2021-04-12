import Svg, { Path, G } from 'react-native-svg';

import React from 'react';

const BackButtonIcon = () => {
  return (
    <Svg width="35" height="35" viewBox="0 0 24 24">
      <G fill="black">
        <Path d="M20,10c-2.3-0.2-10,0-10,0V6c0-0.8-0.8-1.3-1.4-0.8l-6.3,6c-0.5,0.4-0.5,1.2,0,1.6l6.3,6c0.6,0.5,1.4,0,1.4-0.8   v-4c0,0,7.6,0.2,10,0c1.1-0.1,2-0.9,2-2C22,10.9,21.1,10.1,20,10z" />
      </G>
    </Svg>
  );
};

export default BackButtonIcon;
