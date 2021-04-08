import React, { useCallback } from 'react';
import { TouchableOpacity, Linking, View } from 'react-native';
import Plain from '@C/chat/message/types/Plain';

const Link = ({ marking, text, link, style, longPressEvt }) => {
  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        onPress={e => {
          Linking.canOpenURL(link).then(supported => {
            if (supported) {
              Linking.openURL(link);
            }
          });
        }}
        onLongPress={e => {
          longPressEvt && longPressEvt();
        }}
      >
        <Plain marking={marking} text={text} style={style} />
      </TouchableOpacity>
    </>
  );
};

export default React.memo(Link);
