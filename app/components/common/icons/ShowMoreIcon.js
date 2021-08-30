import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ShowMoreicon() {
    return (
        <Svg width="18" height="16" viewBox="0 0 13.25 10.25">
            <Path
                d="M3,16.25H16.25V14.542H3Zm0-4.271H16.25V10.271H3ZM3,6V7.708H16.25V6Z"
                transform="translate(-3 -6)"
                fill="#ababab"
            />
        </Svg>
    )
}