

import React from 'react';
import Svg, { Path, Defs } from 'react-native-svg';

export default function DotIcon({ ...rest }) {
    return (
        <Svg width="18" height="16" viewBox="0 0 29.96 122.88" {...rest}>
            {/* {fill - rule:evenodd;} */}
            <Defs></Defs>
            <Path class="cls-1" d="M15,0A15,15,0,1,1,0,15,15,15,0,0,1,15,0Zm0,92.93a15,15,0,1,1-15,15,15,15,0,0,1,15-15Zm0-46.47a15,15,0,1,1-15,15,15,15,0,0,1,15-15Z" fill="#ababab"/>
        </Svg>
    )
}