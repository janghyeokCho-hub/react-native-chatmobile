import { NativeModules, Platform } from 'react-native';
import { getSetting } from '@/config';

// json array 중복 제거
export const removeDuplicates = (jsonArray, key) => {
  jsonArray = jsonArray.filter(
    (jsonObj, idx, self) =>
      self.map(item => item[key]).indexOf(jsonObj[key]) === idx,
  );

  return jsonArray;
};

// 시스템 메시지 포맷
export const getSysMsgFormatStr = (str, data) => {
  if (str) {
    return data.reduce((p, c) => {
      let replaceData = null;

      if (c.type == 'Plain') {
        replaceData = c.data;
      } else if (c.type == 'MultiPlain') {
        replaceData = getDictionary(c.data);
      } else if (c.type == 'Array') {
        const separator = c.separator || ',';
        if (typeof c.data == 'object' && typeof c.data.join == 'function') {
          replaceData = c.data.join(separator);
        } else {
          replaceData = '';
        }
      } else if (c.type == 'MultiArray') {
        const separator = c.separator || ',';
        if (typeof c.data == 'object' && typeof c.data.join == 'function') {
          const arrMulti = c.data.map(item => getDictionary(item));

          replaceData = arrMulti.join(separator);
        } else {
          replaceData = '';
        }
      }

      if (replaceData) return p.replace(/%s/, replaceData);
      else return p;
    }, str);
  } else {
    return '';
  }
};

// URL 정규식 체크
// const urlRegularExp = /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gm;

const urlRegularExp = /(?:(?:(https?):\/\/)((?:[\w$\-_\.+!*\'\(\),]|%[0-9a-f][0-9a-f])*\:(?:[\w$\-_\.+!*\'\(\),;\?&=]|%[0-9a-f][0-9a-f])+\@)?(?:((?:(?:[a-z0-9\-가-힣]+\.)+[a-z0-9\-]{2,})|(?:[\d]{1,3}\.){3}[\d]{1,3})|localhost)(?:\:([0-9]+))?((?:\/(?:[\w$\-_\.+!*\'\(\),;:@&=ㄱ-ㅎㅏ-ㅣ가-힣]|%[0-9a-f][0-9a-f])+)*)(?:\/([^\s\/\?\.:<>|#]*(?:\.[^\s\/\?:<>|#]+)*))?(\/?[\?;](?:[a-z0-9\-]+(?:=[^\s:&<>]*)?\&)*[a-z0-9\-]+(?:=[^\s:&<>]*)?)?(#[\w\-]+)?)/gim;
export const eumTalkRegularExp = /eumtalk:\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gim;

export const checkURL = message => {
  let isURL = false;
  let result = message ? message.match(urlRegularExp) : ' ';
  let url = '';

  if (result != null) {
    url = result[0].trim();
    isURL = true;

    if (url.match(/(http:\/\/|https:\/\/)/gi) == null) {
      url = 'http://' + url;
    }
  }

  return { isURL: isURL, url: url };
};

export const convertURLMessage = message => {
  if (message == null) message = '';

  let retMessage = message.replace(urlRegularExp, item => {
    let link = item;

    if (item.match(/(http:\/\/|https:\/\/)/gi) == null) {
      link = 'http://' + item;
    }

    // tag 치환 방지
    return `<LINK link="${encodeURIComponent(link)}" text="${encodeURIComponent(
      item,
    )}" />`;

    /*
    if (DEVICE_TYPE == 'd') {
      return `<a onclick="openExternalPopup('${link}')">${item}</a>`;
    } else {
      return `<a href="${link}" target="_blank">${item}</a>`;
    }
    */
  });

  return retMessage;
};

export const convertEumTalkProtocol = (message, { messageType }) => {
  let returnObj = {
    type: 'message',
    message: message ? message : ' ',
    mentionInfo: [],
    roomInfo: {},
  };

  if (message == null) message = '';

  let procMsg = message.replace(eumTalkRegularExp, item => {
    if (returnObj.type === 'emoticon') return '';

    const protocol = item.replace('eumtalk://', '').split('.');
    const type = protocol[0];

    if (type === 'emoticon') {
      // emoticon이 포함된 메시지는 별도의 처리없이 drawtext를 emoticon으로 대체
      returnObj.type = 'emoticon';
      returnObj.message = `<STICKER groupId='${protocol[1]}' emoticonId='${
        protocol[2]
      }' type='${protocol[3]}' companyCode='${protocol[4]}'/>`;
      return item;
    } else if (type === 'mention') {
      // channel.currentChannel.members에 있는 값 매칭 필요
      const userId = protocol.slice(2).join('.');
      returnObj.mentionInfo.push({
        type: protocol[1],
        id: userId,
      });
      return `<MENTION type="${
        protocol[1]
      }" targetId="${userId}" messageType="${messageType}" />`;
    } else if (type === 'move') {
      returnObj.type = 'move';
      returnObj.args = {
        roomId: protocol[2],
      };
      return '';
    }
  });

  if (returnObj.type == 'message' || returnObj.type == 'move')
    returnObj.message = procMsg;

  return returnObj;
};

export const convertEumTalkProtocolPreview = message => {
  let returnObj = {
    type: 'message',
    message: message,
  };

  if (message == null) message = '';

  let procMsg = message.replace(eumTalkRegularExp, item => {
    if (returnObj.type == 'emoticon') return '';

    const protocol = item.replace('eumtalk://', '').split('.');
    const type = protocol[0];

    if (type == 'emoticon') {
      // emoticon이 포함된 메시지는 별도의 처리없이 drawtext를 emoticon으로 대체
      returnObj.type = 'emoticon';
      returnObj.message = '이모티콘';
      return item;
    } else {
      if (type == 'mention') {
        const userId = protocol.slice(2).join('.');
        return `@${userId}`;
      } else if (type == 'move') {
        return '';
      }
    }
  });

  if (returnObj.type == 'message') returnObj.message = procMsg;

  return returnObj;
};

export const removeTag = text => {
  return text.replace(/(<([^>]+)>)/gi, '');
};

export const getPlainText = text => {
  let procMsg = text.replace(eumTalkRegularExp, item => {
    const protocol = item.replace('eumtalk://', '').split('.');
    const type = protocol[0];

    if (type === 'mention') {
      // channel.currentChannel.members에 있는 값 매칭 필요
      const idVal = protocol[2];
      //TODO: 이름으로 바꿔줄 수 있는 방법 확인 필요 ( Mention 개편 시 함께 처리 필요 )
      return `@${idVal}`;
    } else {
      return '';
    }
  });

  return procMsg;
};

export const convertInputValue = str => {
  return str.replace(/[<>"']/g, function($0) {
    return '&' + { '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[$0] + ';';
  });
};

// TODO: 다국어 (이름 다국어, JobInfo 다국어)
export const getJobInfo = (userInfo, isEmptySpace) => {
  const jobInfo = getSetting('jobInfo') || 'PN';
  if (userInfo) {
    const userName = getDictionary(userInfo.name);
    const jobInfoLabel = userInfo[jobInfo];

    if (jobInfoLabel) {
      if (isEmptySpace) return `${userName}${getDictionary(jobInfoLabel)}`;
      else return `${userName} ${getDictionary(jobInfoLabel)}`;
    } else {
      return userName;
    }
  }
  return 'Unkown';
};

export const getDictionary = (multiDic, lang) => {
  let dictionary = '';
  if (typeof multiDic === 'string') dictionary = multiDic;

  let returnDic = dictionary;
  let findIdx = 0;
  let defaultIdx = 0;
  const arrDics = dictionary.split(';');

  let findLang = lang ? lang : getSetting('lang') || 'ko';
  let defaultLang = lang ? lang : getSetting('lang') || 'ko';

  try {
    if (arrDics.length > 0) {
      findIdx = getLanguageIndex(findLang);
      defaultIdx = getLanguageIndex(defaultLang);
    }
    returnDic = arrDics[findIdx];
    if (!returnDic) {
      returnDic = arrDics[defaultIdx];

      if (!returnDic) {
        returnDic = arrDics[0];
      }
    }
  } catch (e) {
    returnDic = arrDics[0];
  }
  return returnDic;
};

const getSysDefaultLang = () => {
  return Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
    : NativeModules.I18nManager.localeIdentifier;
};

const getLanguageIndex = lang => {
  let findIdx = 0;
  lang = lang.toLowerCase();
  switch (lang) {
    case 'ko':
      findIdx = 0;
      break;
    case 'en':
      findIdx = 1;
      break;
    case 'ja':
      findIdx = 2;
      break;
    case 'zh':
      findIdx = 3;
      break;
    case 'reserved1':
      findIdx = 4;
      break;
    case 'reserved2':
      findIdx = 5;
      break;
    case 'reserved3':
      findIdx = 6;
      break;
    case 'reserved4':
      findIdx = 7;
      break;
    case 'reserved5':
      findIdx = 8;
      break;
  }

  return findIdx;
};

export const getBackgroundColor = name => {
  const generalBackgroundColor = [
    '#e5acac',
    '#e7ccac',
    '#9bd59d',
    '#99c1e2',
    '#b497c6',
  ];

  let color = '';
  if (name && name != '') {
    color =
      generalBackgroundColor[
        (name.charCodeAt(0) + name.charCodeAt(1)) %
          generalBackgroundColor.length
      ];
  } else {
    color = generalBackgroundColor[0];
  }
  return color;
};

export const isJSONStr = str => {
  try {
    return typeof JSON.parse(str) == 'object';
  } catch (e) {
    return false;
  }
};
