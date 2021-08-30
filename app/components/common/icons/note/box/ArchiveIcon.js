import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ArchiveIcon({ color, ...rest }) {
    const _color = color || "#a7a7a7";
    return (
        <Svg class="icon-note" xmlns="http://www.w3.org/2000/svg" width="10.54" height="9.034" viewBox="0 0 10.54 9.034" {...rest}>
            <Path d="M564.787,683.506h-4.141a.4.4,0,0,1-.376-.376v-.376a.81.81,0,0,0-.753-.753h-3.764a.81.81,0,0,0-.753.753v8.281h10.54v-6.775A.81.81,0,0,0,564.787,683.506Zm-5.27,0h-3.764v-.376a.4.4,0,0,1,.376-.376h3.011a.4.4,0,0,1,.376.376Z" transform="translate(-555 -682)" fill={_color}></Path>
        </Svg>
    )
}