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
  longPressEvt,
}) => {
  const { colors, sizes } = useTheme();

  let newlineJSX = [];
  let returnJSX = [];
  let isNewLine = false;

  const collectURL = text => {
    const rUrlRegex = /(?:(?:(https?|ftp|telnet):\/\/|[\s\t\r\n\[\]\`\<\>\"\'])((?:[\w$\-_\.+!*\'\(\),]|%[0-9a-f][0-9a-f])*\:(?:[\w$\-_\.+!*\'\(\),;\?&=]|%[0-9a-f][0-9a-f])+\@)?(?:((?:(?:[a-z0-9\-가-힣]+\.)+[a-z0-9\-]{2,})|(?:[\d]{1,3}\.){3}[\d]{1,3})|localhost)(?:\:([0-9]+))?((?:\/(?:[\w$\-_\.+!*\'\(\),;:@&=ㄱ-ㅎㅏ-ㅣ가-힣]|%[0-9a-f][0-9a-f])+)*)(?:\/([^\s\/\?\.:<>|#]*(?:\.[^\s\/\?:<>|#]+)*))?(\/?[\?;](?:[a-z0-9\-]+(?:=[^\s:&<>]*)?\&)*[a-z0-9\-]+(?:=[^\s:&<>]*)?)?(#[\w\-]+)?)/gim;
    return text.match(rUrlRegex)?.[0];
  };

  console.log('children?????', children);

  const convertChildren = (children = '') => {
    let txt = '';
    let onTag = false;
    for (let i = 0; i < children.length; i++) {
      const char = children.charAt(i);
      if (char === '<' && onTag === true) {
        if (txt) {
          returnJSX.push(
            <Plain
              style={style}
              text={txt}
              marking={marking}
              longPressEvt={longPressEvt}
            />,
          );
        }
        txt = '';
      }
      if (char === '<' && onTag === false) {
        onTag = true;
        if (txt) {
          returnJSX.push(<Plain style={style} text={txt} marking={marking} />);
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
                  marking={marking}
                  style={{ ...styles[styleType], fontSize: sizes.chat }}
                  longPressEvt={longPressEvt}
                  {...attrs}
                  link={collectURL(attrs.link)}
                />
              );
            }
            break;
          case 'NEWLINE':
            if (children.charAt(i - 1) === '/') {
              isNewLine = true;
              returnJSX.push(<View style={styles.lineBreaker} />);
            }
            break;
          case 'TAG':
            if (attrs.value && attrs.text?.startsWith('#')) {
              returnTag = (
                <Tag
                  marking={marking}
                  style={{ ...styles[styleType], fontSize: sizes.chat }}
                  longPressEvt={longPressEvt}
                  {...attrs}
                />
              );
            }
            break;
          case 'STICKER':
            if (attrs.emoticonId) {
              returnTag = (
                <Sticker
                  style={{ ...styles[styleType], fontSize: sizes.chat }}
                  longPressEvt={longPressEvt}
                  {...attrs}
                />
              );
            }
            break;
          case 'MENTION':
            if (attrs.type) {
              returnTag = (
                <Mention
                  marking={marking}
                  mentionInfo={roomInfo?.members}
                  navigation={navigation}
                  style={{ ...styles[styleType], fontSize: sizes.chat }}
                  longPressEvt={longPressEvt}
                  {...attrs}
                />
              );
            }
            break;
          default:
            returnTag = <Plain style={style} text={txt} marking={marking} />;
            break;
        }
        if (isNewLine === false) {
          if (txt) {
            newlineJSX.push(
              returnTag ? (
                returnTag
              ) : (
                <Plain style={style} text={txt} marking={marking} />
              ),
            );
          }

          txt = '';
        } else {
          isNewLine = false;
          txt = '';
        }
        txt = '';
      } else {
        txt += char;
      }

      if (i === children.length - 1) {
        if (txt) {
          returnJSX.push(<Plain style={style} text={txt} marking={marking} />);
        }
        returnJSX.push(
          <View style={{ flexDirection: 'row' }}>{newlineJSX}</View>,
        );
      }
    }
    return returnJSX;
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
