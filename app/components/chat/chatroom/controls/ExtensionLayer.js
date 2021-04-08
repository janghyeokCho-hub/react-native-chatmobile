import React, { useEffect, useState } from 'react';

import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Image,
  Text,
} from 'react-native';

import * as fileUtil from '@/lib/fileUtil';

import { getDic } from '@/config';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { getBottomPadding, getScreenWidth } from '@/lib/device/common';
import Svg, { G, Path } from 'react-native-svg';
import FastImage from 'react-native-fast-image';

const ExtensionLayer = ({
  onClick,
  selectImage,
  setSelectImage,
  handleSendFile,
}) => {
  const [space, setSpace] = useState(0);
  const [extensions, setExtensions] = useState([]);

  useEffect(() => {
    // componentDidMount
    setExtensions([1, 2, 3]);
    // setting extension
    let extensions = [
      {
        type: 'camera',
        icon: (
          <Svg width="27.593" height="24.833" viewBox="0 0 27.593 24.833">
            <G transform="translate(-3 -3)">
              <Path
                d="M22.03,17.615A4.415,4.415,0,1,1,17.615,13.2,4.415,4.415,0,0,1,22.03,17.615Z"
                transform="translate(-0.818 -0.818)"
                fill="#fff"
              />
              <Path
                d="M12.657,3,10.133,5.759H5.759A2.767,2.767,0,0,0,3,8.519V25.074a2.767,2.767,0,0,0,2.759,2.759H27.833a2.767,2.767,0,0,0,2.759-2.759V8.519a2.767,2.767,0,0,0-2.759-2.759H23.46L20.935,3ZM16.8,23.695a6.9,6.9,0,1,1,6.9-6.9A6.9,6.9,0,0,1,16.8,23.695Z"
                transform="translate(0 0)"
                fill="#fff"
              />
            </G>
          </Svg>
        ),
        style: { backgroundColor: '#12CFEE' },
        name: getDic('Camera'),
      },
      {
        type: 'album',
        icon: (
          <Svg width="26.706" height="21.851" viewBox="0 0 26.706 21.851">
            <Path
              d="M25.778,4.5H3.928A2.611,2.611,0,0,0,1.5,6.928V23.923a2.435,2.435,0,0,0,2.428,2.428H25.778a2.611,2.611,0,0,0,2.428-2.428V6.928A2.611,2.611,0,0,0,25.778,4.5ZM6.356,21.495,10.6,16.032l3.035,3.654,4.249-5.475,5.463,7.284Z"
              transform="translate(-1.5 -4.5)"
              fill="#fff"
            />
          </Svg>
        ),
        style: { backgroundColor: '#7FD200' },
        name: getDic('Gallery'),
      },
      {
        type: 'video',
        icon: (
          <Svg width="26.706" height="21.851" viewBox="0 0 26.706 21.851">
            <Path
              d="M25.778,4.5H3.928A2.611,2.611,0,0,0,1.5,6.928V23.923a2.435,2.435,0,0,0,2.428,2.428H25.778a2.611,2.611,0,0,0,2.428-2.428V6.928A2.611,2.611,0,0,0,25.778,4.5ZM6.356,21.495,10.6,16.032l3.035,3.654,4.249-5.475,5.463,7.284Z"
              transform="translate(-1.5 -4.5)"
              fill="#fff"
            />
          </Svg>
        ),
        style: { backgroundColor: '#7FD200' },
        name: '동영상',
      },
      {
        type: 'file',
        icon: (
          <Svg width="26.404" height="29.402" viewBox="0 0 26.404 29.402">
            <G transform="translate(0 0)">
              <Path
                d="M43.147,8.779A1.048,1.048,0,0,0,41.665,7.3L30.7,18.263a3.365,3.365,0,1,0,4.759,4.759L46.948,11.534a1.636,1.636,0,0,0,.314-.209c1.534-1.534,5.613-5.613,1.691-9.536A5.447,5.447,0,0,0,43.757.133,9.965,9.965,0,0,0,39,3.061L26.551,15.508A7.656,7.656,0,0,0,24.372,21.3a8.658,8.658,0,0,0,2.458,5.718A8.332,8.332,0,0,0,32.5,29.4h.174A7.731,7.731,0,0,0,38.2,27.154L50.469,14.881A1.048,1.048,0,0,0,48.987,13.4L36.714,25.672a5.745,5.745,0,0,1-4.184,1.639,6.2,6.2,0,0,1-4.5-10.32L40.48,4.543A8.1,8.1,0,0,1,44.193,2.19a3.362,3.362,0,0,1,3.277,1.1,2.719,2.719,0,0,1,.906,2.981,7.7,7.7,0,0,1-1.743,2.7,2.18,2.18,0,0,0-.209.157l-12.43,12.43a1.27,1.27,0,0,1-1.8-1.8Z"
                transform="translate(-24.365 0)"
                fill="#fff"
              />
            </G>
          </Svg>
        ),
        style: { backgroundColor: '#FF786D' },
        name: getDic('File'),
      },
      __DEV__ && {
        type: 'test',
        icon: (
          <Svg height="32px" viewBox="0 0 48 48" width="32px">
            <G id="Expanded">
              <G>
                <G>
                  <Path
                    strokeWidth="5"
                    fill="#FFF"
                    d="M24,20c-11.215,0-20-3.953-20-9s8.785-9,20-9s20,3.953,20,9S35.215,20,24,20z M24,4C15.486,4,6,6.875,6,11s9.486,7,18,7     s18-2.875,18-7S32.514,4,24,4z"
                  />
                </G>
                <G>
                  <Path
                    strokeWidth="5"
                    fill="#FFF"
                    d="M24,28c-11.215,0-20-3.953-20-9v-8c0-0.553,0.447-1,1-1s1,0.447,1,1v8c0,4.125,9.486,7,18,7s18-2.875,18-7v-8     c0-0.553,0.447-1,1-1s1,0.447,1,1v8C44,24.047,35.215,28,24,28z"
                  />
                </G>
                <G>
                  <Path
                    strokeWidth="5"
                    fill="#FFF"
                    d="M24,37c-11.215,0-20-3.953-20-9v-9c0-0.553,0.447-1,1-1s1,0.447,1,1v9c0,4.125,9.486,7,18,7s18-2.875,18-7v-9     c0-0.553,0.447-1,1-1s1,0.447,1,1v9C44,33.047,35.215,37,24,37z"
                  />
                </G>
                <G>
                  <Path
                    strokeWidth="5"
                    fill="#FFF"
                    d="M24,46c-11.215,0-20-3.953-20-9v-9c0-0.553,0.447-1,1-1s1,0.447,1,1v9c0,4.125,9.486,7,18,7s18-2.875,18-7v-9     c0-0.553,0.447-1,1-1s1,0.447,1,1v9C44,42.047,35.215,46,24,46z"
                  />
                </G>
              </G>
            </G>
          </Svg>
        ),
        style: { backgroundColor: '#fec108' },
        name: 'DB',
      },
    ];
    if (extensions) {
      const screenWidth = getScreenWidth() - 20; // padding
      const drawUnitCount = Math.floor(screenWidth / 80);
      const lastRowReminder = extensions.length % drawUnitCount;

      if (lastRowReminder > 0) {
        extensions = [
          ...extensions,
          ...new Array(drawUnitCount - lastRowReminder),
        ];
      }

      setExtensions(extensions);
    }

    let animationConfig = defaultAnimation;
    LayoutAnimation.configureNext(animationConfig);
    setSpace(300);
  }, []);

  const handleSend = fileInfos => {
    onClick('image');
  };

  return (
    <>
      <View style={[styles.container, { height: space }]}>
        <View style={styles.extensionWrap}>
          <ScrollView
            style={styles.extensionBox}
            contentContainerStyle={styles.extensionScorllWrapper}
          >
            {extensions &&
              extensions.map((item, index) => {
                return (
                  <>
                    {(item && (
                      <TouchableOpacity
                        key={`s_ext_${index}`}
                        onPress={e => {
                          onClick(item.type);
                        }}
                      >
                        <View style={styles.extensionUnit}>
                          <View style={[styles.unitIconWrap, item.style]}>
                            {item.icon}
                          </View>
                          <Text>{item.name}</Text>
                        </View>
                      </TouchableOpacity>
                    )) || <View style={styles.extensionEmpty} />}
                  </>
                );
              })}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    bottom: 0,
  },
  extensionWrap: {
    width: '100%',
    flex: 1,
    padding: 10,
    paddingBottom: getBottomPadding(),
    backgroundColor: '#FFF',
  },
  extensionBox: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
  },
  extensionScorllWrapper: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  extensionUnit: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extensionEmpty: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  unitIconWrap: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 5,
    backgroundColor: '#F9F9F9',
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

export default ExtensionLayer;
