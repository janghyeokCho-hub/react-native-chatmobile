import Svg, { G, Path } from 'react-native-svg';
import React from 'react';
import { getActiveColor } from '@/components/common/icons/note/ColorInfo';

export default function FavoriteIcon({ active = false, width, height, ...rest }) {
    const color = getActiveColor(active);
    const _width = width || "11.667";
    const _height = height || "11.135";
    return (
        <Svg id="star-favorite" xmlns="http://www.w3.org/2000/svg" width={_width} height={_height} viewBox="0 0 11.667 11.135" { ...rest }>
            <G id="그룹_13" data-name="그룹 13" transform="translate(0 0)">
                <Path id="패스_22" data-name="패스 22" d="M11.645,15.408a.4.4,0,0,0-.35-.276l-3.667-.309L6.2,11.432a.4.4,0,0,0-.37-.249.394.394,0,0,0-.37.249L4.035,14.823l-3.667.309a.4.4,0,0,0-.35.276.415.415,0,0,0,.121.431l2.779,2.4-.834,3.58a.4.4,0,0,0,.6.437l3.149-1.9,3.149,1.9a.394.394,0,0,0,.209.061.424.424,0,0,0,.236-.074.391.391,0,0,0,.155-.417l-.834-3.58,2.779-2.4A.4.4,0,0,0,11.645,15.408Z" transform="translate(-0.001 -11.183)" fill={color} />
            </G>
        </Svg>
    );
}