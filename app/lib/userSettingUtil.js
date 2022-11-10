import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { getDic, getServerDictionary } from '@/config';
import { restartApp } from '@/lib/device/common';
import { setUserDefinedSettings } from '@/lib/api/setting';
import { isEmptyValue, isSameValue } from '@/lib/validation';

export const getJobInfo = async () => {
  const jobInfo = await AsyncStorage.getItem('covi_user_jobInfo');

  return jobInfo === 'NN' ? '' : jobInfo; //직무없음 ->빈값으로 보내도록(사이드이팩트방지)
};

/**
 * 2022.10.24
 * mismatchTrigger 우선순위
 * ex) fallback 트리거가 reload, restart인 설정값 불일치가 모두 발생한 경우, 최종적으로 restart를 실행함
 *
 * !! 설정값 불일치에 대한 fallback이 앱 라이프사이클과 관계없는 경우에는 priority와 관계없이 별도 로직으로 비교 && fallback 처리를 실행하면 됨 !!
 */
const TRIGGER_PRIORITY = {
  /* trigger list */
  restart: 10,
  /* invalid list */
  0: 0,
  null: -1,
  NaN: -2,
  undefined: -3,
};

/**
 * 2022.10.24
 * [SETTINGS_KEY]: {
 *    mismatchTrigger: 'restart' or null/undefined
 *    storageKey: [ASYNC_STORAGE_KEY]
 * }
 * mismatchTrigger => 클라이언트 설정값과 서버측 설정값이 다를경우 실행할 fallback 트리거 명명
 * storageKey => 서버측 설정값 키(SETTINGS_KEY)에 대응하는 클라이언트측 설정값 key
 */
const USER_SETTINGS_MAP = {
  clientLang: {
    mismatchTrigger: 'restart',
    storageKey: 'covi_user_lang',
    async onUpdate(prev, next) {
      try {
        // Refresh dic in AsyncLocalStorage
        const hostInfo = await AsyncStorage.getItem('EHINF');
        const response = await getServerDictionary(hostInfo, next);
        if (response.data.result) {
          await AsyncStorage.setItem(
            'ESETINF',
            JSON.stringify(response.data.result),
          );
        }
      } catch (err) {
        console.log('covi_user_lang error: ', err);
      }
    },
  },
  jobInfo: {
    mismatchTrigger: null,
    storageKey: 'covi_user_jobInfo',
  },
};

function restartAlert() {
  Alert.alert(
    null,
    getDic(
      'Msg_RestartSync',
      '사용자 지정 설정(예: 언어 표기, 위치 표시)의 동기화를 위해 재시작이 필요합니다.확인을 누르면 앱이 재시작됩니다.',
    ),
    [
      {
        text: getDic('Cancel'),
      },
      {
        text: getDic('Ok'),
        onPress() {
          return restartApp();
        },
      },
    ],
  );
}

export async function triggerUserDefinedSettingsFallback(trigger) {
  if (trigger <= TRIGGER_PRIORITY[0]) {
    return;
  }

  switch (trigger) {
    case TRIGGER_PRIORITY.restart:
      // 설정값 반영을 위해 재시작이 필요한 경우 Confirm 후 재시작 실행
      restartAlert();
      break;
    default:
      break;
  }
}

export async function syncUserDefinedSettings(settings) {
  let trigger = TRIGGER_PRIORITY[0];
  if (!settings || typeof settings !== 'object') {
    return;
  }
  // client > server로 동기화 할 데이터 목록
  const updateList = {};

  // eslint-disable-next-line no-unused-vars
  for (const serverSideKey in settings) {
    let serverSideValue = settings?.[serverSideKey];
    if (!serverSideValue) {
      continue;
    }
    const { mismatchTrigger, storageKey, onUpdate } = USER_SETTINGS_MAP[
      serverSideKey
    ];
    const clientSideValue = await AsyncStorage.getItem(storageKey);
    const [serverSideEmpty, clientSideEmpty] = [
      isEmptyValue(serverSideValue),
      isEmptyValue(clientSideValue),
    ];

    if (serverSideEmpty && !clientSideEmpty) {
      // clientSideValue만 있고serverSideValue가 비어있는 경우,
      // updateList에 추가
      updateList[serverSideKey] = clientSideValue;
    } else if (
      !serverSideEmpty &&
      isSameValue(serverSideValue, clientSideValue) === false
    ) {
      // serverSideValue와 clientSideValue가 서로 다를 경우,
      // serverSideValue 값으로 AsyncStorage 갱신
      try {
        await AsyncStorage.setItem(storageKey, serverSideValue);
        await onUpdate?.(clientSideValue, serverSideValue);
      } catch (err) {
        console.log(`Sync[${storageKey}] error: `, err);
      }
      trigger = Math.max(trigger, TRIGGER_PRIORITY[mismatchTrigger]);
    }
  }
  if (isEmptyValue(updateList) === false) {
    // updateList을 서버와 동기화
    await setUserDefinedSettings(updateList);
  }
  await triggerUserDefinedSettingsFallback(trigger);
}
