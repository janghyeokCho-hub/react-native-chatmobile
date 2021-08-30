import Svg, { G, Path } from 'react-native-svg';
import React from 'react';
import { getActiveColor } from '@/components/common/icons/note/ColorInfo';

export default function FileIcon({ active = false, ...rest }) {
    const color = getActiveColor(active);
    return (
        <Svg id="school-paper-clip" xmlns="http://www.w3.org/2000/svg" width="10" height="11.135" viewBox="0 0 10 11.135" {...rest}>
            <G id="그룹_28" data-name="그룹 28" transform="translate(0 0)">
                <Path id="패스_46" data-name="패스 46" d="M31.479,3.325a.4.4,0,0,0-.561-.561L26.765,6.917a1.275,1.275,0,0,0,1.8,1.8l4.351-4.351a.62.62,0,0,0,.119-.079c.581-.581,2.126-2.126.64-3.611A2.063,2.063,0,0,0,31.71.05a3.774,3.774,0,0,0-1.8,1.109L25.193,5.873a2.9,2.9,0,0,0-.825,2.192,3.279,3.279,0,0,0,.931,2.166,3.155,3.155,0,0,0,2.146.9h.066a2.928,2.928,0,0,0,2.093-.852l4.648-4.648a.4.4,0,1,0-.561-.561L29.042,9.723a2.176,2.176,0,0,1-1.585.621,2.347,2.347,0,0,1-1.7-3.909l4.714-4.714A3.068,3.068,0,0,1,31.875.829a1.273,1.273,0,0,1,1.241.416,1.03,1.03,0,0,1,.343,1.129A2.915,2.915,0,0,1,32.8,3.4a.825.825,0,0,0-.079.059L28.012,8.164a.481.481,0,0,1-.68-.68Z" transform="translate(-24.365 0)" fill={color} />
            </G>
        </Svg>
    );
}