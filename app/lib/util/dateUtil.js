import {
    format,
    isValid,
    startOfToday,
    differenceInMilliseconds,
} from 'date-fns';

export function makeDateTime(timestamp) {
    if (isValid(new Date(timestamp))) {
        const toDay = startOfToday();
        const procTime = new Date(timestamp);
        let dateText = '';

        if (differenceInMilliseconds(procTime, toDay) >= 0) {
            // 오늘보다 큰 경우 시간 표시
            dateText = format(procTime, 'HH:mm');
        } else {
            // 오늘과 이틀이상 차이나는 경우 날짜로 표시
            dateText = format(procTime, 'yyyy.MM.dd');
        }

        // 오늘과 하루 차이인 경우 어제로 표시 -- 차후에 추가 ( 다국어처리 )

        return dateText;
    } else {
        return '';
    }
};