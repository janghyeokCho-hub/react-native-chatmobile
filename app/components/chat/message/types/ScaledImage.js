import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import {
  isOdd,
  isLastIndex,
  isBeforeLastIndex,
  isFirstIndex,
  isSecondIndex,
} from '@/lib/util/indexUtil';

import FastImage from 'react-native-fast-image';

const initNoImg = require('@C/assets/no_image.jpg');

// TODO: 차후에 세로, 가로 이미지에 대한 요청사항에 대한 처리는 (실제 이미지 비율 관련 문제)
// 서버쪽에 저장당시에 세로, 가로 이미지 타입에 대한 선언 후 처리 가능 (세로, 가로 타입에 따라 해당 컴포넌트 수정 요망)

const ScaledImage = ({ source, scaledWidth, scaledHeight, index, len }) => {
  const [img, setImg] = useState(initNoImg);
  const [scaled, setScaled] = useState(false);
  const [type, setType] = useState('D'); // D : default, V : 세로, H : 가로
  const [height, setHeight] = useState(scaledHeight ? scaledHeight : 0);
  const [width, setWidth] = useState(scaledWidth ? scaledWidth : 0);

  useEffect(() => {
    if (source != null) {
      Image.getSize(source.uri, (width, height) => {
        let sWidth = scaledWidth;
        let sHeight = scaledHeight;

        if (width > height) {
          // 가로 이미지
          sWidth = scaledWidth;
          sHeight = parseInt(height * (scaledWidth / width));
          setType('H');
        } else if (width < height) {
          // 세로 이미지
          sWidth = parseInt(width * (scaledHeight / height));
          sHeight = scaledHeight;
          setType('V');
        }
        setImg(source);
        setScaled(true);
        setWidth(sWidth);
        setHeight(sHeight);
      });
    }
  }, [source]);

  return (
    <View
      style={[
        {
          width: scaledWidth,
          height: scaledHeight,
          backgroundColor: type == 'H' ? '#F9F9F9' : '',
          justifyContent: type == 'H' ? 'center' : 'flex-start',
        },
        isFirstIndex(index) && { borderTopLeftRadius: 10 },
        isSecondIndex(index) && { borderTopRightRadius: 10 },
        // index == len - 1 && { borderBottomRightRadius: 10 },
        // index == len - 2 && { borderBottomLeftRadius: 10 },
      ]}
    >
      <FastImage
        source={img}
        style={[
          {
            width:
              isOdd(len) && isLastIndex(index, len)
                ? scaledWidth * 2 + 2
                : scaledWidth,
            height: scaledHeight,
          },
          index == 0 && { borderTopLeftRadius: 10 },
          index == 1 && { borderTopRightRadius: 10 },
          len % 2 === 0 && {
            borderBottomLeftRadius: isBeforeLastIndex(index, len) ? 10 : 0,
            borderBottomRightRadius: isLastIndex(index, len) ? 10 : 0,
          },
          isOdd(len) &&
            isLastIndex(index, len) && {
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10,
            },
        ]}
      />
    </View>
  );
};

export default ScaledImage;
