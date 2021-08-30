import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function InboxIcon({ color, ...rest }) {
    const _color = color || "#a7a7a7";
    return (
        <Svg class="icon-note" xmlns="http://www.w3.org/2000/svg" width="10.659" height="10.659" viewBox="0 0 10.659 10.659" {...rest}>
            <Path d="M8.661.333A.333.333,0,0,0,8.327,0h-6A.333.333,0,0,0,2,.333l-2,5V9.993a.666.666,0,0,0,.666.666H9.993a.666.666,0,0,0,.666-.666V5.33Zm-1,5L6.662,7a.333.333,0,0,1-.333.333h-2A.333.333,0,0,1,4,7L3,5.33H1.332l1.713-4H7.614l1.713,4Z" fill={_color}></Path>
        </Svg>
    )
}