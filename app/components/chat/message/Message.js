import React from 'react';
import { Plain, Link, Tag, Sticker, Mention } from '@C/chat/message/types';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { getAttribute } from '@/lib/messageUtil';

const Message = ({
  children,
  style,
  eleId,
  roomInfo,
  navigation,
  marking,
  styleType,
}) => {
  const { colors } = useTheme();

  let returnJSX = [];
  let newLineJSX = [];

  function collectURL(text) {
    const rUrlRegex = /(?:(?:(https?|ftp|telnet):\/\/|[\s\t\r\n\[\]\`\<\>\"\'])((?:[\w$\-_\.+!*\'\(\),]|%[0-9a-f][0-9a-f])*\:(?:[\w$\-_\.+!*\'\(\),;\?&=]|%[0-9a-f][0-9a-f])+\@)?(?:((?:(?:[a-z0-9\-가-힣]+\.)+[a-z0-9\-]{2,})|(?:[\d]{1,3}\.){3}[\d]{1,3})|localhost)(?:\:([0-9]+))?((?:\/(?:[\w$\-_\.+!*\'\(\),;:@&=ㄱ-ㅎㅏ-ㅣ가-힣]|%[0-9a-f][0-9a-f])+)*)(?:\/([^\s\/\?\.:<>|#]*(?:\.[^\s\/\?:<>|#]+)*))?(\/?[\?;](?:[a-z0-9\-]+(?:=[^\s:&<>]*)?\&)*[a-z0-9\-]+(?:=[^\s:&<>]*)?)?(#[\w\-]+)?)/gim;
    return text ? text.match(rUrlRegex)?.[0] || '' : '';
  }

  const convertChildren = (children = '') => {
    let txt = '';
    let onTag = false;
    let isNewLine = false;
    for (let i = 0; i < children.length; i++) {
      const char = children.charAt(i);
      if (char === '<' && onTag === true) {
        if (txt) {
          newLineJSX.push(
            <Plain
              style={style}
              key={returnJSX.length}
              text={txt}
              marking={marking}
            />,
          );
        }
        txt = '';
      }
      if (char === '<' && onTag === false) {
        onTag = true;
        if (txt) {
          newLineJSX.push(
            <Plain
              style={style}
              key={returnJSX.length}
              text={txt}
              marking={marking}
            />,
          );
        }
        txt = '';
      }
      if (onTag === true && char === '>') {
        onTag = false;
        txt += char;
        const pattern = new RegExp(
          /[<](LINK|NEWLINE|TAG|STICKER|MENTION)[^>]*[/>]/,
          'gi',
        );
        let returnTag;
        const match = pattern.exec(txt);
        let matchedTag = match?.[1];
        const attrs = getAttribute(match?.[0]);
        switch (matchedTag?.toUpperCase()) {
          case 'LINK':
            if (attrs.link) {
              returnTag = (
                <Link
                  key={returnJSX.length}
                  marking={marking}
                  {...attrs}
                  link={collectURL(attrs.link)}
                />
              );
            }
            break;
          case 'NEWLINE':
            if (children.charAt(i - 1) === '/') {
              isNewLine = true;
              newLineJSX.push(
                <View key={newLineJSX.length} style={styles.lineBreaker}>
                    {[...returnJSX]}
                </View>,
              )

              returnJSX = [];

            }
            break;
          case 'TAG':
            if (attrs.value && attrs.text?.startsWith('#')) {
              returnTag = (
                <Tag key={returnJSX.length} marking={marking} {...attrs} />
              );
            }
            break;
          case 'STICKER':
            if (attrs.emoticonId) {
              returnTag = <Sticker key={returnJSX.length} {...attrs} />;
            }
            break;
          case 'MENTION':
            if (attrs.type) {
              returnTag = (
                <Mention
                  key={returnJSX.length}
                  marking={marking}
                  mentionInfo={roomInfo && roomInfo.members}
                  navigation={navigation}
                  {...attrs}
                />
              );
            }
            break;
          default:
            returnTag = (
              <Plain
                style={style}
                key={returnJSX.length}
                text={txt}
                marking={marking}
              />
            );
            break;
        }
        if (isNewLine === false) {
          if (txt) {
            returnJSX.push(
              returnTag ? (
                returnTag
              ) : (
                <Plain
                  style={style}
                  key={returnJSX.length}
                  text={txt}
                  marking={marking}
                />
              ),)
          }

            txt = ''
        } else {
          isNewLine = false;
          txt = ''

        }
        txt = '';
      } else {
        txt += char;
      }

      if (i === children.length - 1) {
        if (txt) {
          newLineJSX.push(
            <Plain
              style={style}
              key={returnJSX.length}
              text={txt}
              marking={marking}
            />,
          );
        }
        newLineJSX.push(
        <View style={{flexDirection: 'row'}}>
          {returnJSX}
        </View>);
      }
    }
    return newLineJSX;
  };

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
          {convertChildren(children)}
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
          {convertChildren(children)}
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
