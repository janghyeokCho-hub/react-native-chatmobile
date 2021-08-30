import useSWR from 'swr';
import produce from 'immer';
import LRU from 'lru-cache';
import qs from 'qs';

import { getNoteList, getNote, getReadList } from '@/lib/note/fetch';
import { managesvr } from '@API/api';
import { useEffect, useLayoutEffect } from 'react';
import { getDictionary } from '@/lib/common';
import { getDic } from '@/config';
import format from 'date-fns/formatISO9075';

// 데이터 split 구분자
export const NOTE_DATA_SEPARATOR = "$$";
export const NOTE_RECEIVER_SEPARATOR = "|";

// 긴급쪽지(컴플라이언스) 표기 전용 특수문자
export const emergencyMark = '❗';
export const nonEmergencyMark = '❕';

const cache = new LRU({
    max: 30,
    length: (n, key) => n * 2 + key.length,
    // 쪽지 읽기/읽음확인 데이터 1시간 주기로 캐싱
    maxAge: 1000 * 60 * 60
});

export function convertTimeFormat(timestamp) {
    if (!timestamp) {
        return '';
    }

    const sendDate = new Date(timestamp);
    const date = format(sendDate, { representation: 'date' });
    const time = format(sendDate, { representation: 'time' });

    return `${date} ${time}`;
}

export function useNoteList({ viewType = 'receive' } = {}) {
    const path = `/note/list/${viewType}`;

    const state = useSWR(path, () => getNoteList(`/note/list/${viewType}`), { revalidateOnMount: false, revalidateOnFocus: false, revalidateOnReconnect: false, shouldRetryOnError: false });
    const searchState = useSWR('/note/list/search', null, { initialData: null });
    
    return {
        ...state,
        data: searchState.data ? searchState.data : state.data,
        async initNoteList(_viewType = 'receive') {
            await state.revalidate();
        },
        async search(searchText, sortName, sort) {
            if(!searchText) {
                // 검색 텍스트가 없을 경우 searchState clear
                searchState.mutate(null);
                return;
            }
            const queryParams = {
                value: (typeof searchText === 'string' && searchText.length) ? searchText : undefined,
                sortName,
                sort
            };
            const result = await managesvr(
                'GET',
                path + qs.stringify(queryParams, { addQueryPrefix: true }),
                {
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            );
            if (result && result.data && result.data.status === 'SUCCESS') {
                searchState.mutate(result.data.result, false);
            }
        },
        find(noteId) {
            return state.data?.find((note) => note.noteId === noteId);
        },
        removeNote(_viewType, noteId) {
            const targetNoteIdx = state.data?.findIndex((note) => note.noteId === noteId);
            // 대상 쪽지가 state 내에 없거나 viewType mismatch인 경우 로직 생략
            if ((targetNoteIdx >= 0) === false || (viewType !== _viewType)) {
                return;
            }
            return state.mutate((prev) => produce(prev, draft => {
                // 캐시에 남아있는 쪽지 데이터 삭제 TODO
                // cachedNote.del(targetNoteIdx);

                // state에서 쪽지 삭제
                draft.splice(targetNoteIdx, 1);
            }));
        },
        readNote(_viewType, noteId) {
            const targetNoteIdx = state.data?.findIndex((note) => note.noteId === noteId);

            // 대상 쪽지가 state 내에 없거나 viewType mismatch인 경우 로직 생략
            if ((targetNoteIdx >= 0) === false || (viewType !== _viewType)) {
                return;
            }

            return state.mutate((prev) => produce(prev, draft => {
                const targetNote = draft[targetNoteIdx];
                // update readFlag
                targetNote && draft.splice(targetNoteIdx, 1, {
                    ...targetNote,
                    readFlag: 'Y'
                });
            }));
        }
    }
}

export function useNote({ viewType, noteId }) {
    const { readNote } = useNoteList({ viewType });
    return useSWR(['/note/', noteId], async (key, _noteId) => {
        const cachedData = cache.get(key + noteId);
        if (cachedData) {
            return cachedData;
        }
        const noteInfo = await getNote(_noteId);
        cache.set(key + noteId, noteInfo);
        // 읽지 않은 쪽지를 fetch할때마다 local state에 바로 readFlag Y로 갱신
        noteInfo?.readFlag !== 'Y' && readNote(viewType, noteId);
        return noteInfo;
    }, {
        revalidateOnReconnect: false,
        revalidateOnFocus: false
    });
}

export function useNoteReadList({ noteId }) {
    return useSWR(['/note/readlist', noteId], async (key, _) => {
        const cachedData = cache.get(key + noteId);
        if (cachedData) {
            return cachedData;
        }
        const readListData = await getReadList({ noteId });
        // readList 캐싱기간이 길면 읽음확인 여부 갱신이 느리므로 maxAge 짧게 조정
        cache.set(key + noteId, readListData, 1000 * 30);
        return readListData;
    }, {
        revalidateOnFocus: false,
        onErrorRetry: false
    });
}

export const SORT = {
    NAME: 'senderName',
    DATE: 'sendDate',
    ASC: 'A',
    DESC: 'D'
};
export function useSortState({ initialize = false } = {}) {
    const initialData = {
        sortName: SORT.DATE,
        sort: SORT.DESC
    };
    const state = useSWR('/note/list/sort', null, initialize && { initialData });
    return {
        ...state,
        reverse(sort) {
            return sort === SORT.DESC ? SORT.ASC : SORT.DESC;
        },
        toggle(sortName) {
            if (sortName !== SORT.NAME && sortName !== SORT.DATE) {
                return;
            }
            return state.mutate((prev) => produce(prev, draft => {
                console.log(`Change to ${draft[sortName]} => ${this.reverse(draft[sortName])}`);
                draft[sortName] = this.reverse(draft[sortName]);
            }));
        }
    }
}

export function useSearchState(initialData) {
    const state = useSWR('/note/list/search', null, { initialData });
    return [state.data, state.mutate];
}

export function useViewType(initialData = 'receive') {
    const state = useSWR('/note/viewType', null, { initialData });
    return [state.data, state.mutate];
}

export function _translateName(user) {
    const displayName = user?.displayName || user?.name;
    if (typeof displayName !== 'string') {
        // string이 아닐경우 다국어 처리 하지않고 원본 반환
        return displayName;
    }
    const name = getDictionary(displayName);
    const jp = user.jobPosition ? getDictionary(user.jobPosition) : '';

    return jp.length ? `${name} ${jp}` : name;
}

export function translateName(users, currentUserId = -1) {
    if (Array.isArray(users) === true) {
        return users.map(user => {
            if(currentUserId === user?.id) {
                return getDic('Me', '나');
            }
            return _translateName(user);
        }).join(", ");
    } else if (typeof users?.displayName !== 'string') {
        // string이 아닐경우 다국어 처리 하지않고 원본 반환
        return users?.displayName;
    }

    if(currentUserId === users?.id) {
        return getDic('Me', "나");
    }
    return _translateName(users);
}

/**
 * 쪽지 데이터에 sender* 키값으로 붙어온 senderInfo 획득
 * @param {NoteInfo | Object} info 
 * @returns {Object}
 */
function _parseSenderInfo(info, opts) {
    const { jobPositionKey, nameKey } = opts;
    const returnData = {
        id: info.senderUserId,
        photoPath: info.senderPhotoPath,
        jobKey: info.senderJobKey,
        [nameKey]: info.senderDisplayName,
        // (가정) sender은 항상 유저
        type: 'U'
    };
    // jobPositionKey가 지정되어 있는 경우에만 해당키로 데이터 주입
    if (jobPositionKey === null) {
        returnData.LN = info.senderJobPositionName;
        returnData.PN = info.senderJobPositionName;
        returnData.TN = info.senderJobPositionName;
        returnData.jobPosition = info.senderJobPositionName;
    } else {
        returnData[jobPositionKey] = info.senderJobPositionName;
    }
    // presence 옵션처리 
    if (opts.removePresence === false) {
        returnData.presence = info.senderPresence;
    }

    if (typeof info.receiveDisplayName !== 'undefined') {
        const receivers = _parseReceiveData({ displayName: info.receiveDisplayName }, opts);
        return {
            sender: {
                ...returnData,
                /**
                 * 2021.06.25
                 * 쪽지 데이터의 sender.jobkey: number
                 * 조직도 검색의 jobKey: string
                 */
                ...(returnData?.jobKey && { jobKey: returnData.jobKey.toString() })
            },
            receivers
        };
    }
    return returnData;
}

/**
 * 문자열 파싱하여 sender 정보 획득
 * 
 * 발신함
 * - displayName 포맷
 *      MY $$ {name}
 * 보관함
 * - 발신쪽지 displayName 포맷
 *      MY $$ {name} $$ {jobPosition}
 * - 수신쪽지 displayName 포맷
 *      S $$ {name} $$ {photoPath} $$ {jobPosition} $$ {id} $$ {presence}
 * 
 * @param {string} data 
 * @returns {Object}
 */
function _parseSenderData(data, opts) {
    try {
        const parsed = JSON.parse(data.displayName);
        if (Array.isArray(parsed) === true) {
            return parsed.map((info) => {
                if (typeof info.displayName !== 'string') {
                    return null;
                }
                const users = info.displayName.split(NOTE_DATA_SEPARATOR);
                const isMine = users[0] === 'MY';
                const { jobPositionKey } = opts;
                let returnData = null;

                if (isMine === true) {
                    returnData = {
                        isMine,
                        displayName: users[1],
                        [jobPositionKey]: users[2] || '',
                    }
                } else {
                    returnData = {
                        isMine,
                        displayName: users[1],
                        photoPath: users[2],
                        [jobPositionKey]: users[3] || '',
                        id: users[4]
                    };
                    if (opts.removePresence === false) {
                        returnData.presence = users[5];
                    }
                }
                return returnData;
            }).filter(u => u !== null);
        }
    } catch (err) {
        console.info(err.message);
        return 'Unknown';
    }
}

/**
 * 문자열 파싱하여 receiver 정보 획득
 * 
 * 쪽지조회
 * - receiveDisplayName 포맷
 *      S $$ {name} $$ {jobPosition}?
 * 
 * @param {string} data 
 * @returns {Object}
 */
function _parseReceiveData(data, opts) {
    try {
        const parsed = JSON.parse(data.displayName);
        const { jobPositionKey, nameKey } = opts;

        if (Array.isArray(parsed) === true) {
            return parsed.map((info) => {
                if (typeof info.displayName !== 'string') {
                    return null;
                }
                const users = info.displayName.split(NOTE_DATA_SEPARATOR);
                const isMine = users[0] === 'MY';
                if (users.length > 5) {
                    /**
                     * 유저일 경우
                     * 0 isMine
                     * 1 displayName
                     * 2 jobPosition
                     * 3 id
                     * 4 photoPath
                     * 5 companyCode
                     * 6 jobKey
                     */
                    const jobPositionValue = users[2] || '';
                    const returnData = {
                        isMine,
                        [nameKey]: users[1],
                        id: users[3],
                        photoPath: users[4],
                        jobKey: users[6],
                        type: 'U'
                    };
                    // jobPositionKey가 지정되어 있는 경우에만 해당키로 데이터 주입
                    if (jobPositionKey === null) {
                        returnData.LN = jobPositionValue;
                        returnData.PN = jobPositionValue;
                        returnData.TN = jobPositionValue;
                        returnData.jobPosition = jobPositionValue;
                    } else {
                        returnData[jobPositionKey] = jobPositionValue;
                    }
                    return returnData;
                } else {
                    /**
                     * 그룹일 경우
                     * 0 isMine
                     * 1 displayName
                     * 2 companyCode
                     * 3 groupCode(id)
                     */
                    return {
                        isMine,
                        name: users[1],
                        displayName: users[1],
                        companyCode: users[2],
                        id: users[3],
                        type: 'G'
                    };
                }
            }).filter(u => u !== null);
        }
    } catch (err) {
        console.info(err.message);
        return 'Unknown';
    }
}

export function parseSender(info, opts) {
    // opts 방어코드
    const defaultOpts = {
        useOrgChartFormat: false,
        removePresence: false
    };
    const _opts = Object.assign(defaultOpts, opts);
    if (_opts.useOrgChartFormat) {
        // 모바일은 localStorage.getItem 비동기처리 구조가 복잡해지므로 jobPosition 일괄처리
        // _opts.jobPositionKey = localStorage.getItem('covi_user_jobInfo');
        _opts.jobPositionKey = null;
        _opts.nameKey = 'name';
    } else {
        _opts.jobPositionKey = 'jobPosition';
        _opts.nameKey = 'displayName';
    }

    const isReceiveData = typeof info?.senderUserId !== 'undefined';

    if (isReceiveData === true) {
        return _parseSenderInfo(info, _opts);
    } else {
        return _parseSenderData(info, _opts);
    }
}

export function calculateNoteUnreadCount(list) {
    if (!list || list.length === 0) {
        return 0;
    } else {
        const cnt = list.reduce((acc, cur, i) => {
            if (cur.readFlag === 'N') {
                return acc + 1;
            }
            return acc;
        }, 0);
        return cnt;
    }
}

export function useNoteUnreadCount() {
    const { data:noteList, mutate: setNoteList } = useSWR('/note/list/receive', null);
    const { data:unreadCnt, mutate:setUnreadCnt } = useSWR('/note/list/receive/unread', null, {initialData: 0});

    async function init() {
        const initialData = await getNoteList(`/note/list/receive`);
        setNoteList(initialData);
    }

    useLayoutEffect(() => {
        !noteList?.length && init();
    }, []);

    useEffect(() => {
        setUnreadCnt(calculateNoteUnreadCount(noteList));
    }, [noteList]);

    return unreadCnt;
}