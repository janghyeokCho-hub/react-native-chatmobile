import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function NoteIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width="21.767"
            height="25.061"
            viewBox="0 0 21.767 25.061"
            {...props}
        >
            <Path d="M-103.317,353.779v-13.42h-14.518v13.432l-4.383,4.385,7.245,7.244,5.373-5.374,2.876,2.876,6.273-6.274Zm-13.068-1.414V342.8l4.783,4.784Zm1.062-10.555h9.493l-4.746,4.746Zm10.555.99v9.564l-4.783-4.782Zm-15.4,15.376,3.589-3.6.017.017,5.985-5.985,5.188,5.188L-109.593,358-109.6,358l-5.373,5.373Zm11.6.851,4.224-4.224,1.843,1.844-4.223,4.224Z" transform="translate(122.218 -340.359)" fill={props?.focus ? '#444' : '#bbb'} />
        </Svg>
    );
}