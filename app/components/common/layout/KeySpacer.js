import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  LayoutAnimation,
  View,
  Dimensions,
  Platform,
  StyleSheet,
} from 'react-native';
import { getBottomPadding } from '@/lib/device/common';

// adjustResize 용
const KeySpacer = (() => {
  if (Platform.OS == 'ios') {
    return ({ onToggle, style, spacing = 0 }) => {
      let _listener = null;
      const [space, setSpace] = useState(0);
      const [opend, setOpend] = useState(false);

      useEffect(() => {
        const updateListener =
          Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const resetListener =
          Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
        _listener = [
          Keyboard.addListener(updateListener, updateKeyboardSpace),
          Keyboard.addListener(resetListener, resetKeyboardSpace),
        ];

        return () => {
          _listener && _listener.forEach(item => item.remove());
        };
      }, []);

      const updateAnimation = e => {
        let animationConfig = defaultAnimation;

        if (e && Platform.OS == 'ios') {
          animationConfig = LayoutAnimation.create(
            e.duration,
            LayoutAnimation.Types[e.easing],
            LayoutAnimation.Properties.opacity,
          );
        }

        LayoutAnimation.configureNext(animationConfig);
      };

      const updateKeyboardSpace = e => {
        if (!e.endCoordinates) {
          return;
        }
        updateAnimation(e);

        const screenHeight = Dimensions.get('window').height;

        setSpace(screenHeight - e.endCoordinates.screenY);
        setOpend(true);

        if (onToggle && typeof onToggle == 'function') onToggle(true);
      };

      const resetKeyboardSpace = e => {
        // updateAnimation(e);
        setSpace(0);
        setOpend(false);

        if (onToggle && typeof onToggle == 'function') onToggle(false);
      };

      return (
        <View
          style={[
            styles.container,
            {
              height: space == 0 ? spacing : space,
            },
            style,
          ]}
        />
      );
    };
  } else {
    return () => (
      <View style={(styles.container, { height: getBottomPadding() })}></View>
    );
  }
})();

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
});

const defaultAnimation = {
  duration: 500,
  create: {
    duration: 300,
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 200,
  },
};

export default KeySpacer;
