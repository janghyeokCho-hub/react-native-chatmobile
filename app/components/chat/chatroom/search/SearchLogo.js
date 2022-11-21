import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

export const SearchLogo = () => {
  return (
    <View style={styles.emptyBoxWrap}>
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        width="97"
        height="92.509"
        viewBox="0 0 97 92.509"
      >
        <G transform="translate(-532 -235)">
          <Path
            d="M45.778,91.672c.094-2.438,1.173-5.979,1.517-8.685C21.066,82.441,0,64.076,0,41.5,0,18.58,21.714,0,48.5,0S97,18.58,97,41.5c0,11.116-5.107,21.211-13.423,28.66C69.6,83.866,52,92.51,47.1,92.509,46.227,92.509,45.757,92.237,45.778,91.672Z"
            transform="translate(532 235)"
            fill="#ebecf0"
          />
          <G transform="translate(546 267)" style="isolation:isolate">
            <G transform="translate(0 0)" style="isolation:isolate">
              <Path
                d="M46.789,48.149a6.549,6.549,0,0,0,2.284,3.238,6.27,6.27,0,0,0,3.845,1.272,8.132,8.132,0,0,0,3.412-.781,6.075,6.075,0,0,0,2.631-2.052l3.151,2.139a9.614,9.614,0,0,1-3.961,3.267,11.915,11.915,0,0,1-5.234,1.244A10.266,10.266,0,0,1,42.654,46.24a10.243,10.243,0,0,1,17.493-7.257,9.89,9.89,0,0,1,3.007,7.257,10.176,10.176,0,0,1-.173,1.88Zm6.13-8.356a6.267,6.267,0,0,0-3.845,1.272,6.54,6.54,0,0,0-2.284,3.267h12.23a6.543,6.543,0,0,0-2.284-3.267A6.228,6.228,0,0,0,52.918,39.793Z"
                transform="translate(-42.654 -35.976)"
                fill="#f9f9f9"
              />
            </G>
            <G transform="translate(19.983 0)" style="isolation:isolate">
              <Path
                d="M99.937,35.976V46.24a10.25,10.25,0,0,1-20.5,0V35.976h3.816V46.24a6.185,6.185,0,0,0,1.879,4.54A6.28,6.28,0,0,0,89.7,52.659,6.416,6.416,0,0,0,96.12,46.24V35.976Z"
                transform="translate(-79.437 -35.976)"
                fill="#f9f9f9"
              />
            </G>
            <G transform="translate(40.23 0)" style="isolation:isolate">
              <Path
                d="M116.706,56.476V44.129a8.144,8.144,0,0,1,8.153-8.153A7.755,7.755,0,0,1,131.1,38.9a8.175,8.175,0,0,1,14.429,5.233V56.476h-3.817V44.129a4.344,4.344,0,0,0-4.337-4.336,4.272,4.272,0,0,0-3.094,1.272,4.175,4.175,0,0,0-1.272,3.064V56.476H129.2V44.129a4.337,4.337,0,0,0-8.674,0V56.476Z"
                transform="translate(-116.706 -35.976)"
                fill="#f9f9f9"
              />
            </G>
          </G>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyBoxWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
});
