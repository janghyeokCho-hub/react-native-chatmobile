import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function OutboxIcon({ color, ...rest }) {
    const _color = color || "#a7a7a7";
    return (
        <Svg class="icon-note" xmlns="http://www.w3.org/2000/svg" width="10.629" height="9.942" viewBox="0 0 10.629 9.942" {...rest}>
            <Path d="M2.005,12.942,12.629,7.971,2.005,3,2,6.866l7.592,1.1L2,9.075Z" transform="translate(-2 -3)" fill={_color}></Path>
        </Svg>
    )
}