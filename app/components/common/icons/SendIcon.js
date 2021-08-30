import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

export default function SendNoteIcon({ style }) {
    const color = style?.color ||  "#262727";
    const width = style?.width || "20.418";
    const height = style?.height || "15.214";
    return (
        <Svg width={width} height={height} x="0px" y="0px" viewBox="0 0 122.88 103.44" style="enable-background:new 0 0 122.88 103.44">
            <G>
                <Path fill={color} d="M69.49,102.77L49.8,84.04l-20.23,18.27c-0.45,0.49-1.09,0.79-1.8,0.79c-1.35,0-2.44-1.09-2.44-2.44V60.77L0.76,37.41 c-0.98-0.93-1.01-2.47-0.09-3.45c0.31-0.33,0.7-0.55,1.11-0.67l0,0l118-33.2c1.3-0.36,2.64,0.39,3.01,1.69 c0.19,0.66,0.08,1.34-0.24,1.89l-49.2,98.42c-0.6,1.2-2.06,1.69-3.26,1.09C69.86,103.07,69.66,102.93,69.49,102.77L69.49,102.77 L69.49,102.77z M46.26,80.68L30.21,65.42v29.76L46.26,80.68L46.26,80.68z M28.15,56.73l76.32-47.26L7.22,36.83L28.15,56.73 L28.15,56.73z M114.43,9.03L31.79,60.19l38.67,36.78L114.43,9.03L114.43,9.03z" />
            </G>
        </Svg>
    );
}