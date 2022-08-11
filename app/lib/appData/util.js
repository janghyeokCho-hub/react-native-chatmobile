import * as db from '@/lib/appData/connector';

const SQLITE_LIMIT_VARIABLES = 999;
const splitCnt = 49;

// 동기화 날짜 세팅
export const setSyncDate = (transaction, key, date) => {
  db.tx(transaction, 'sync_date')
    .select(['COUNT(*) AS CNT'])
    .execute((tx, result) => {
      if (result.rows.item(0).CNT == 0) {
        db.tx(tx, 'sync_date')
          .insert({
            [key]: date,
          })
          .execute();
      } else {
        db.tx(tx, 'sync_date')
          .update({
            [key]: date,
          })
          .execute();
      }
    });
};

export const spliceInsert = (insertList, callBack, transaction, tableName) => {
  if (insertList.length > 0) {
    let insertArr = [];
    const length = insertList.length;
    for (let i = 0; i < Math.ceil(length / splitCnt); i++) {
      const temps = insertList.splice(0, splitCnt);
      insertArr.push(
        db
          .tx(transaction, tableName)
          .insert(temps)
          .execute(),
      );
    }

    Promise.all(insertArr).then(() => {
      callBack(true);
    });
  } else {
    callBack(true);
  }
};
