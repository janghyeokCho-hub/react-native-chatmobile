import Svg, { Path } from 'react-native-svg';
import React from 'react';
import { getActiveColor } from '@/components/common/icons/note/ColorInfo';
export default function ReadIcon({ active = false, ...rest }) {
    const color = getActiveColor(active);
    return (
        <Svg xmlns="http://www.w3.org/2000/svg" width="11" height="12" viewBox="0 0 11.8 8.801" {...rest}>
            <Path id="패스_2266" data-name="패스 2266" d="M-337.123,698.038c0-.008,0-.016,0-.023l-.005-.007a.4.4,0,0,0-.127-.168c-.013-.01-.025-.017-.038-.026a.386.386,0,0,0-.206-.065h-11a.386.386,0,0,0-.206.065c-.013.009-.025.016-.038.026a.4.4,0,0,0-.127.168l-.005.007c0,.007,0,.015,0,.023a.378.378,0,0,0-.023.111v8a.4.4,0,0,0,.4.4h11a.4.4,0,0,0,.4-.4v-8A.378.378,0,0,0-337.123,698.038Zm-1.494.512-4.03,3.312a.594.594,0,0,1-.687.015l-4.049-3.327Zm-9.483,7.2v-6.754l4.277,3.514a1.377,1.377,0,0,0,.817.266,1.432,1.432,0,0,0,.848-.281l4.258-3.5v6.754Z" transform="translate(348.9 -697.749)" fill={color} />
        </Svg>
    );
}