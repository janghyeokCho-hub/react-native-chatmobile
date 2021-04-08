import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

const LongPressWrapper = ({ children, longPressEvt }) => {
  if (!longPressEvt) {
    return children;
  }

  return (
    <TouchableOpacity
      style={{ flexWrap: 'wrap', flexDirection: 'row' }}
      onLongPress={e => {
        longPressEvt && longPressEvt();
      }}
      activeOpacity={1}
    >
      {children}
    </TouchableOpacity>
  );
};

const Plain = ({ marking, text, style, longPressEvt }) => {
  if (!marking || (marking && !marking.trim())) {
    return (
      <LongPressWrapper longPressEvt={longPressEvt}>
        <Text style={{ ...style }}>{text}</Text>
      </LongPressWrapper>
    );
  }

  const regex = new RegExp('(' + marking + ')', 'gi');
  if (regex.test(text)) {
    const parts = text.split(regex);
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        <LongPressWrapper longPressEvt={longPressEvt}>
          {parts
            .filter(part => part)
            .map((part, i) =>
              marking && part.toLowerCase() === marking.toLowerCase() ? (
                <Text
                  key={i}
                  style={{
                    backgroundColor: '#222',
                    color: '#fff',
                  }}
                >
                  {part}
                </Text>
              ) : (
                <Text key={i} style={style}>
                  {part}
                </Text>
              ),
            )}
        </LongPressWrapper>
      </View>
    );
  } else {
    return (
      <LongPressWrapper longPressEvt={longPressEvt}>
        <Text style={style}>{text}</Text>
      </LongPressWrapper>
    );
  }
};

export default React.memo(Plain);
