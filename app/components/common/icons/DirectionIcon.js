import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

export default function DirectionIcon({ width, height, direction, color, ...rest }) {

    const directionStyle = {
        transform: [
            { rotate: direction === "up" ? "0deg" : "180deg" }
        ]
    };
    return (
        <View style={[directionStyle, rest.style]}>
            <Svg width={width || "20"} height={height || "20"} x="0px" y="0px" viewBox="0 0 122.88 66.91" style="enable-background:new 0 0 122.88 66.91">
                <G>
                    <Path d="M11.68,64.96c-2.72,2.65-7.08,2.59-9.73-0.14c-2.65-2.72-2.59-7.08,0.13-9.73L56.87,1.97l4.8,4.93l-4.81-4.95 c2.74-2.65,7.1-2.58,9.76,0.15c0.08,0.08,0.15,0.16,0.23,0.24L120.8,55.1c2.72,2.65,2.78,7.01,0.13,9.73 c-2.65,2.72-7,2.78-9.73,0.14L61.65,16.5L11.68,64.96L11.68,64.96z" fill={color || '#ababab'} />
                </G>
            </Svg>
        </View >
    );
}