import Svg, { G, Path } from 'react-native-svg';

import React from 'react';

const ContactIcon = ({ focus }) => {
  return (
    <>
      {(!focus && (
        <Svg
          id="messenger-user-avatar"
          width="25.876"
          height="26.236"
          viewBox="0 0 59.446 67.406"
        >
          <G id="그룹_45" data-name="그룹 45" transform="translate(0 0)">
            <Path
              id="패스_75"
              data-name="패스 75"
              d="M716.092,419.475a2.751,2.751,0,0,0,2.73,2.73h53.986a2.747,2.747,0,0,0,2.73-2.73,40.19,40.19,0,0,0-20.261-33.254,17.122,17.122,0,1,0-18.878,0A40.136,40.136,0,0,0,716.092,419.475Zm29.722-59.183a11.647,11.647,0,1,1-11.644,11.65v-.009A11.668,11.668,0,0,1,745.814,360.292Zm0,28.888c10.645,0,23.208,12.147,24.173,27.568H721.641c.956-15.424,13.528-27.571,24.173-27.571Z"
              transform="translate(-716.092 -354.799)"
              fill="#bbb"
            />
          </G>
        </Svg>
      )) || (
        <Svg width="25.876" height="26.236" viewBox="0 0 59.446 67.406">
          <G
            id="그룹_565"
            data-name="그룹 565"
            transform="translate(9339 -9813)"
          >
            <G id="messenger-user-avatar" transform="translate(-9339 9813)">
              <G id="그룹_45" data-name="그룹 45" transform="translate(0 0)">
                <Path
                  id="패스_75"
                  data-name="패스 75"
                  d="M716.092,419.475a2.751,2.751,0,0,0,2.73,2.73h53.986a2.747,2.747,0,0,0,2.73-2.73,40.19,40.19,0,0,0-20.261-33.254,17.122,17.122,0,1,0-18.878,0A40.136,40.136,0,0,0,716.092,419.475Zm29.722-59.183a11.647,11.647,0,1,1-11.644,11.65v-.009A11.668,11.668,0,0,1,745.814,360.292Zm0,28.888c10.645,0,23.208,12.147,24.173,27.568H721.641c.956-15.424,13.528-27.571,24.173-27.571Z"
                  transform="translate(-716.092 -354.799)"
                  fill="#444"
                />
              </G>
            </G>
          </G>
        </Svg>
      )}
    </>
  );
};

export default ContactIcon;
