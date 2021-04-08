import React, { useState, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

const SearchMessageWrap = ({ onLayout, children }) => {
  const [animation, setAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    /*
    const animationConfigs = Animated.timing(animation, {
      toValue: 0,
      duration: 800,
      easing: Easing.Bounce,
    });

    Animated.loop(animationConfigs, {
      iterations: 5,
    }).start();
    */

    Animated.spring(animation, {
      toValue: 0,
      duration: 1000,
      friction: 5,
      tention: 20,
      useNativeDriver: true,
    }).start();
  }, []);

  const animationStyles = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, -4, 0, 4, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View onLayout={onLayout} style={[animationStyles]}>
      {children}
    </Animated.View>
  );
};

export default SearchMessageWrap;
