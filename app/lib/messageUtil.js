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

/**
 * Reply 본문 메시지 ID + 10 부터 해당 방의 마지막 메시지까지
 * @param {*} roomID 대화방 OR 채널 ID
 * @param {*} startId replyID
 * @param {*} cnt 위로 더 불러올 갯수
 * @param {*} roomType CHAT / CHANNEL
 * @returns [...messages]
 */
export const getMessageBetween = async (
  roomID,
  startId,
  cnt = 10,
  roomType = 'CHAT',
) => {
  const param = {
    roomID,
    startId,
    cnt,
  };

  if (roomType === 'CHAT') {
    return await dbAction.selectBetweenMessagesByIDs(param);
  } else {
    // CHANNEL
    return await messageApi.getMessageBetween(param);
  }
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
  let txt = '';
  let onTag = false;
  for (let i = 0; i < children.length; i++) {
    const char = children.charAt(i);
    if (char === '<') {
      onTag = onTag ? onTag : !onTag;
      if (txt) {
        newlineJSX.push(
          <Plain
            key={returnJSX.length}
            style={{ ...styles[styleType], fontSize: sizes.chat }}
            text={txt}
            marking={marking}
            longPressEvt={longPressEvt}
          />,
        );
      }
      txt = '';
    }
    if (onTag && char === '>') {
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
                style={{ ...styles[styleType], fontSize: sizes.chat }}
                longPressEvt={longPressEvt}
                {...attrs}
                link={attrs.link}
              />
            );
          }
          break;
        case 'NEWLINE':
          if (children.charAt(i - 1) === '/') {
            isNewLine = true;
            returnJSX.push(
              <View key={returnJSX.length} style={styles.lineBreaker} >
                {[...newlineJSX]}
              </View>,
            );
            newlineJSX = [];
          }
          break;
        case 'TAG':
          if (attrs.value && attrs.text?.startsWith('#')) {
            returnTag = (
              <Tag
                key={returnJSX.length}
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
                key={returnJSX.length}
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
                key={returnJSX.length}
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
          returnTag = (
            <Plain
              key={returnJSX.length}
              style={{ ...styles[styleType], fontSize: sizes.chat }}
              text={txt}
              marking={marking}
              longPressEvt={longPressEvt}
            />
          );
          break;
      }
      if (isNewLine === false) {
        if (txt) {
          newlineJSX.push(
            returnTag ? (
              returnTag
            ) : (
              <Plain
                style={{ ...styles[styleType], fontSize: sizes.chat }}
                text={txt}
                key={returnJSX.length}
                marking={marking}
                longPressEvt={longPressEvt}
              />
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
        newlineJSX.push(
          <Plain
            key={returnJSX.length}
            style={{ ...styles[styleType], fontSize: sizes.chat }}
            text={txt}
            marking={marking}
            longPressEvt={longPressEvt}
          />,
        );
      }
      returnJSX.push(
        <View  key={returnJSX.length} style={{ flexDirection: 'row' }}>{newlineJSX}</View>,
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
