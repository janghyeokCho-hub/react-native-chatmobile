import { managesvr } from '@/lib/api/api';
import AsyncStorage from '@react-native-community/async-storage';

export default class ParamUtil {
  constructor(str, obj) {
    this.str = str;
    this.obj = obj;
    this.queue = [];
    this.regex = new RegExp(/#|\+|\$|&/g);
  }

  static toValue = (object, key) => {
    let path = key.split('.');
    for (let i = 0; i < path.length; i++) {
      if (object[path[i]] === undefined) {
        return undefined;
      }
      object = object[path[i]];
    }
    return object;
  };

  static toDate = () => new Date().getTime();

  static toPlain = val => val;

  static toMerge = a => b => a + b;

  static compose = funcs => {
    return funcs.reduceRight(
      (acc, curr) => {
        return () => curr(acc());
      },
      val => val,
    );
  };

  static matchAll = (str, regex) => {
    const matches = str.match(regex);
    const matchArr = matches.reduce((acc, curr) => {
      const lastGroup = acc.length > 0 ? acc[acc.length - 1] : null;
      let result = null;
      if (lastGroup) {
        const groupStr = lastGroup.remainStr.substring(
          lastGroup.remainStr.indexOf(curr),
        );
        result = {
          0: curr,
          input: str,
          index: str.length - groupStr.length,
          remainStr: groupStr,
        };
      } else {
        const groupStr = str.substring(str.indexOf(curr));
        result = {
          0: curr,
          input: str,
          index: str.length - groupStr.length,
          remainStr: groupStr,
        };
      }

      acc.push(result);

      return acc;
    }, []);

    return matchArr;
  };

  getURLParam = async () => {
    let matches = null;
    if (typeof String.prototype.matchAll === 'function') {
      matches = matches = this.str.matchAll(this.regex);
    } else {
      matches = ParamUtil.matchAll(this.str, this.regex);
    }

    let splitIdx = 0;
    for (let call of matches) {
      const type = call[0];

      const callVal =
        (type !== '+' && this.str.substring(splitIdx, call.index)) || 'toMerge';

      if (type === '#') {
        if (callVal === 'toToken') {
          const token = await AsyncStorage.getItem('covi_user_access_token');
          this.queue.push(() => ParamUtil.toPlain(token));
        } else {
          this.queue.push(ParamUtil[callVal]);
        }
      } else if (type === '+') {
        this.queue.push(ParamUtil.toMerge(this.queue.pop()()));
      } else if (type === '$') {
        console.log(this.obj);
        this.queue.push(() => ParamUtil.toValue(this.obj, callVal));
      } else if (type === '&') {
        this.queue.push(() => ParamUtil.toPlain(callVal));
      }

      splitIdx = call.index + 1;
    }

    if (this.queue.length > 0) {
      const composeFunc = ParamUtil.compose(this.queue);
      this.queue = [];

      return composeFunc();
    } else {
      return '';
    }
  };
}

export const encryptText = plainText => {
  return managesvr('get', `/netaes?pt=${encodeURIComponent(plainText)}`, null);
};

export function makePhotoPath(img) {
  let photoSrc = img;
  const urlParts = photoSrc?.split('?');
  /**
   * 2021.10.22
   * query string '?' identifier 중복 제거
   *
   * 그룹웨어에서 사진의 물리경로를 querystring 파라미터로 정의하는 케이스에서
   * '?'를 추가로 붙이면 사진 경로값이 바뀌어  사진을 불러오지 못하는 오류발생
   */
  if (Array.isArray(urlParts) && urlParts.length >= 2) {
    const urlBase = urlParts.shift();
    photoSrc = urlBase + '?' + urlParts.join('&');
  } else {
    photoSrc = img;
  }
  return photoSrc;
}
