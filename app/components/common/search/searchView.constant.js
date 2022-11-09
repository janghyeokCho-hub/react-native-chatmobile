import { format, isMatch } from 'date-fns';

export const SEARCHVIEW_OPTIONS = {
  CONTEXT: 'Context',
  SENDER: 'Note_Sender',
  DATE: 'Date',
};

export const SEARCH_DATE_FORMAT = 'yyyy-MM-dd';

function _paddingZero(num) {
  if (num > 0 && num < 10) {
    return '0' + num;
  }
  return num;
}

export function convertDate(date, dateFormat = SEARCH_DATE_FORMAT) {
  return format(new Date(date), dateFormat);
}

export function getCurrentDate(dateFormat = SEARCH_DATE_FORMAT) {
  return convertDate(Date.now(), dateFormat);
}

export function isValidDate(date, dateFormat = SEARCH_DATE_FORMAT) {
  return isMatch(date, dateFormat);
}

export function parseDate(date, dateFormat = SEARCH_DATE_FORMAT) {
  const dateType = typeof date;
  try {
    if (dateType === 'string') {
      /**
       * 2022.10.20
       * React-native 런타임에서는 month, date의 padding 여부에 따라 결과가 string 파싱 결과가 달라짐
       * '2022-10-1': invalid (returns NaN)
       * '2022-10-01':valid
       */
      const formattedDate = date
        .split('-')
        .map(part => _paddingZero(Number(part)))
        .join('-');
      return convertDate(formattedDate, dateFormat);
    }
    return convertDate(date, dateFormat);
  } catch (err) {
    console.log(`ParseDate([${dateType}]${date}): `, err);
    return null;
  }
}

export function isSameDate(from, to) {
  if (!from || !to) {
    return false;
  }
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  if (!fromDate || !toDate) {
    return false;
  }
  return fromDate === toDate;
}
