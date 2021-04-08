import React, { Component } from 'react';
import PropTypes from 'prop-types';

/* 초기 소스 출처 : react-native-simple-modal - v9.0.1 */

import {
  View,
  ViewPropTypes,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  BackHandler,
} from 'react-native';
import { connect } from 'react-redux';
import { addBackHandler, delBackHandler } from '@/modules/app';

class Modal extends Component {
  static propTypes = {
    open: PropTypes.bool,
    offset: PropTypes.number,
    overlayStyle: ViewPropTypes.style,
    animationDuration: PropTypes.number,
    animationTension: PropTypes.number,
    modalDidOpen: PropTypes.func,
    modalDidClose: PropTypes.func,
    closeOnTouchOutside: PropTypes.bool,
    disableOnBackPress: PropTypes.bool,
  };

  static defaultProps = {
    open: false,
    offset: 0,
    animationDuration: 200,
    animationTension: 40,
    modalDidOpen: () => undefined,
    modalDidClose: () => undefined,
    closeOnTouchOutside: true,
    disableOnBackPress: false,
  };

  state = {
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.8),
    offset: new Animated.Value(this.props.offset),
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.animationDuration === 0) {
      this.state.scale.setValue(1);
    } else {
      this.state.scale.setValue(this.props.open ? 1 : 0.8);
    }

    if (nextProps.open !== this.props.open) {
      if (nextProps.open) {
        this.open();
      } else {
        this.close();
      }
    }

    if (nextProps.offset !== this.props.offset) {
      this.animateOffset(nextProps.offset);
    }
  }

  hardwareBackPress = () => {
    if (this.props.isBackLock) {
      if (this.state.open) {
        if (!this.props.disableOnBackPress) {
          this.close();
        }
        return true;
      }

      return true;
    }
  };

  componentDidMount() {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.hardwareBackPress);
    }

    if (this.props.open) {
      this.open();
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        this.hardwareBackPress,
      );
    }
  }

  executeCallbacks(didOpen) {
    if (didOpen) {
      this.props.modalDidOpen();
    } else {
      this.setState({ open: false });
      this.props.modalDidClose();
    }
  }

  setPhase(toValue) {
    if (this.state.open != toValue) {
      const { animationDuration, animationTension } = this.props;
      if (animationDuration === 0) {
        this.state.opacity.setValue(toValue);
        this.executeCallbacks(toValue === 1);
      } else {
        Animated.timing(this.state.opacity, {
          toValue,
          duration: animationDuration,
        }).start();

        Animated.spring(this.state.scale, {
          toValue: toValue ? 1 : 0.8,
          tension: animationTension,
        }).start(() => this.executeCallbacks(toValue === 1));
      }
    }
  }

  render() {
    const { opacity, open, scale, offset } = this.state;
    let containerStyles = [
      styles.absolute,
      styles.container,
      this.props.containerStyle,
    ];

    if (!this.state.open) {
      containerStyles.push(styles.hidden);
    }

    return (
      <View
        pointerEvents={open ? 'auto' : 'none'}
        style={containerStyles}
        {...this.props.containerProps}
      >
        <TouchableOpacity
          style={styles.absolute}
          disabled={!this.props.closeOnTouchOutside}
          onPress={this.close}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.defaultOverlayStyle,
              { opacity },
              this.props.overlayStyle,
            ]}
          />
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.defaultModalStyle,
            this.props.modalStyle,
            { opacity, transform: [{ scale }, { translateY: offset }] },
          ]}
          {...this.props.modalProps}
        >
          {this.props.children}
        </Animated.View>
      </View>
    );
  }

  open() {
    this.setState({ open: true });
    this.setPhase(1);
    this.props.addBackHandler({ name: 'Modal' });
  }

  close = () => {
    this.setPhase(0);
    this.props.delBackHandler({ name: 'Modal' });
  };

  animateOffset(offset) {
    Animated.spring(this.state.offset, { toValue: offset }).start();
  }
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  container: {
    justifyContent: 'center',
  },
  defaultModalStyle: {
    borderRadius: 2,
    margin: 20,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  defaultOverlayStyle: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  hidden: {
    top: -10000,
    left: 0,
    height: 0,
    width: 0,
  },
});

export default connect(
  ({ app }) => ({
    isBackLock: app.backHandler['Modal'],
  }),
  { addBackHandler, delBackHandler },
)(Modal);
