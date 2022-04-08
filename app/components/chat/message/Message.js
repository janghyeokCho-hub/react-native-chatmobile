import React, { useMemo, useState, useEffect } from 'react';

import { Plain, Link, Tag, Sticker, Mention } from '@C/chat/message/types';
import { View, StyleSheet } from 'react-native';

import { useTheme } from '@react-navigation/native';

const getAttribute = tag => {
  const attrPattern = new RegExp(
    /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/,
    'gi',
  );
  let attrs = {};
  const match = tag.match(attrPattern);

  if (match && match.length > 0) {
    match.forEach(item => {
      try {
        const key = item.split('=')[0];
        let value = decodeURIComponent(item.split('=')[1]);

        if (
          (value[0] == '"' && value[value.length - 1] == '"') ||
          (value[0] == "'" && value[value.length - 1] == "'")
        ) {
          value = value.substring(1, value.length - 1);
        }

        attrs[key] = value;
      } catch (e) {}
    });
  }

  return attrs;
};

const Message = ({
  children,
  style,
  eleId,
  roomInfo,
  navigation,
  marking,
  styleType,
  longPressEvt,
}) => {
  const { colors, sizes } = useTheme();
  const [drawText, setDrawText] = useState(<View />);

  useEffect(() => {
    const pattern = new RegExp(
      /[<](LINK|NEWLINE|TAG|STICKER|MENTION|MOVE)[^>]*[/>]/,
      'gi',
    );

    let newLineJSX = [];
    let returnJSX = [];
    let beforeLastIndex = 0;
    let match = null;

    while ((match = pattern.exec(children)) != null) {
      if (match.index > 0 && match.index > beforeLastIndex) {
        returnJSX.push(
          <Plain
            key={returnJSX.length}
            text={children.substring(beforeLastIndex, match.index)}
            marking={marking}
            style={{ ...styles[styleType], fontSize: sizes.chat }}
            longPressEvt={longPressEvt}
          />,
        );
      }

      var attrs = getAttribute(match[0]);

      if (match[1] === 'LINK') {
        returnJSX.push(
          <Link
            key={returnJSX.length}
            marking={marking}
            style={{ ...styles[styleType], fontSize: sizes.chat }}
            longPressEvt={longPressEvt}
            {...attrs}
          />,
        );
      } else if (match[1] === 'NEWLINE') {
        if (returnJSX.length === 0) {
          newLineJSX.push(
            <View key={newLineJSX.length} style={styles.lineBreaker}>
              <Plain
                key="newline_0"
                text=""
                marking={marking}
                style={{ ...styles[styleType], fontSize: sizes.chat }}
              />
            </View>,
          );
        } else {
          newLineJSX.push(
            <View key={newLineJSX.length} style={styles.lineBreaker}>
              {[...returnJSX]}
            </View>,
          );

          returnJSX = [];
        }
      } else if (match[1] === 'TAG') {
        returnJSX.push(
          <Tag
            key={returnJSX.length}
            marking={marking}
            style={{ ...styles[styleType], fontSize: sizes.chat }}
            longPressEvt={longPressEvt}
            {...attrs}
          />,
        );
      } else if (match[1] === 'STICKER') {
        returnJSX.push(<Sticker key={returnJSX.length} {...attrs} />);
      } else if (match[1] === 'MENTION') {
        returnJSX.push(
          roomInfo && (
            <Mention
              key={returnJSX.length}
              marking={marking}
              mentionInfo={roomInfo.members}
              style={{ ...styles.sentMentionText, fontSize: sizes.chat }}
              navigation={navigation}
              longPressEvt={longPressEvt}
              {...attrs}
            />
          ),
        );
      } else if (match[1] === 'MOVE') {
        returnJSX.push(
          <Plain
            key={returnJSX.length}
            text={'?'}
            marking={marking}
            style={{ ...styles[styleType], fontSize: sizes.chat }}
            longPressEvt={longPressEvt}
          />,
        );
      } else {
      }
      beforeLastIndex = match.index + match[0].length;
    }

    if (beforeLastIndex < children.length)
      returnJSX.push(
        <Plain
          key={returnJSX.length}
          text={children.substr(beforeLastIndex)}
          marking={marking}
          style={{ ...styles[styleType], fontSize: sizes.chat }}
          longPressEvt={longPressEvt}
        />,
      );

    if (returnJSX.length > 0) {
      newLineJSX.push(
        <View key={newLineJSX.length} style={styles.lineBreaker}>
          {[...returnJSX]}
        </View>,
      );
    }
    setDrawText(newLineJSX);
  }, [children]);

  return (
    <>
      {(eleId && (
        <View
          style={[
            {
              backgroundColor:
                styleType === 'repliseText' ? colors.primary : '',
            },
            style,
            styles.container,
          ]}
          id={eleId}
        >
          {drawText}
        </View>
      )) || (
        <View
          style={[
            {
              backgroundColor:
                styleType === 'repliseText' ? colors.primary : '',
            },
            style,
            styles.container,
          ]}
        >
          {drawText}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  lineBreaker: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  repliseText: {
    color: '#fff',
    fontSize: 13,
  },
  sentText: {
    color: '#444',
    fontSize: 13,
  },
  sentMentionText: {
    color: '#444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sendText: {
    color: '#444',
    fontSize: 13,
  },
  noticeText: {
    color: '#444',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default React.memo(Message, (prevProps, nextProps) => {
  // true : rerender
  // false : skip
  return (
    prevProps.marking !== nextProps.marking ||
    prevProps.children === nextProps.children
  );
});
