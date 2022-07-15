import * as dbAction from '@/lib/appData/action';
import * as messageApi from '@API/message';
import { openModal, changeModal } from '@/modules/modal';
import { Plain, Link, Tag, Sticker, Mention } from '@C/chat/message/types';
import { View, StyleSheet } from 'react-native';
import React from 'react';

export const getMessage = async (
  roomID,
  startId,
  dist,
  unreadCntCallback,
  isNotice,
  loadCnt,
) => {
  const param = {
    roomID,
    startId,
    loadCnt: loadCnt ? loadCnt : 100,
    dist,
    isNotice,
  };

  const resultObj = await dbAction.getMessages(param);

  let messages = resultObj.data.result;

  if (messages.length > 0) {
    unreadCntCallback({
      roomId: roomID,
      startId: messages[0].messageID,
      endId: messages[messages.length - 1].messageID,
      isNotice,
    });
  }

  return resultObj;
};

export const getChannelMessage = (roomID, startId, dist) => {
  let resultObj;
  const param = {
    roomId: roomID,
    startId,
    loadCnt: 100,
    dist,
  };
  resultObj = messageApi.getChannelMessages(param);
  return resultObj;
};

export const getChannelSyncMessage = (roomID, startId) => {
  let resultObj;
  const param = {
    roomId: roomID,
    startId,
    loadCnt: 1000,
    dist: 'BEFORE',
  };

  resultObj = messageApi.getChannelMessages(param);
  return resultObj;
};

export const getNotice = (roomID, startId, dist) => {
  let resultObj;
  const param = {
    roomID,
    startId,
    loadCnt: 100,
    dist,
    isNotice: true,
  };

  // TODO: 서버가 아닌 AppData 에서 조회하도록 변경 필요
  // TODO: AppData 저장 여부값 조건 추가 필요
  /*if (DEVICE_TYPE == 'd') {
    resultObj = evalConnector({
      method: 'sendSync',
      channel: 'req-get-messages',
      message: param,
    });
  } else {*/
  resultObj = messageApi.getNotice(param);
  /*}*/

  return resultObj;
};

export const openMsgUtilBox = (messageData, dispatch) => {
  if (messageData === null || messageData === undefined) return null;

  dispatch(
    changeModal({
      modalData: {
        closeOnTouchOutside: true,
        type: 'msgExtension',
        messageData: messageData,
      },
    }),
  );

  dispatch(openModal());
};

export const getAttribute = tag => {
  const attrPattern = new RegExp(
    /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/,
    'gi',
  );
  let attrs = {};
  const match = tag?.match(attrPattern);

  if (match?.length) {
    match.forEach(item => {
      try {
        const key = item.split('=')[0];
        let value = decodeURIComponent(item.split('=')[1]);

        if (
          (value[0] === '"' && value[value.length - 1] === '"') ||
          (value[0] === "'" && value[value.length - 1] === "'")
        ) {
          value = value.substring(1, value.length - 1);
        }
        attrs[key] = value;
      } catch (e) {}
    });
  }
  return attrs;
};

export const convertChildren = ({
  children,
  style,
  styleType,
  marking,
  roomInfo,
  sizes,
  longPressEvt,
  navigation,
}) => {
  let newlineJSX = [];
  let returnJSX = [];
  let isNewLine = false;

  const collectURL = text => {
    const rUrlRegex = /(?:(?:(https?|ftp|telnet):\/\/|[\s\t\r\n\[\]\`\<\>\"\'])((?:[\w$\-_\.+!*\'\(\),]|%[0-9a-f][0-9a-f])*\:(?:[\w$\-_\.+!*\'\(\),;\?&=]|%[0-9a-f][0-9a-f])+\@)?(?:((?:(?:[a-z0-9\-가-힣]+\.)+[a-z0-9\-]{2,})|(?:[\d]{1,3}\.){3}[\d]{1,3})|localhost)(?:\:([0-9]+))?((?:\/(?:[\w$\-_\.+!*\'\(\),;:@&=ㄱ-ㅎㅏ-ㅣ가-힣]|%[0-9a-f][0-9a-f])+)*)(?:\/([^\s\/\?\.:<>|#]*(?:\.[^\s\/\?:<>|#]+)*))?(\/?[\?;](?:[a-z0-9\-]+(?:=[^\s:&<>]*)?\&)*[a-z0-9\-]+(?:=[^\s:&<>]*)?)?(#[\w\-]+)?)/gim;
    return text.match(rUrlRegex)?.[0];
  };

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

const styles = StyleSheet.create({
  lineBreaker: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
});
