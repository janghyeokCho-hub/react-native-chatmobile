import AsyncStorage from '@react-native-community/async-storage';
import SQLite from 'react-native-sqlite-storage';
import base64 from 'base-64';

//__DEV__ && SQLite.DEBUG(true);
SQLite.enablePromise(true);

let dbCon = null;

const open = async dbName => {
  let domain = await AsyncStorage.getItem('EHINF');

  if (typeof domain === 'string') {
    domain = domain.replace(/http(s)?:\/\//i, '');
  } else {
    domain = '';
  }

  // domain.userid
  const openName = base64.encode(`${domain}.${dbName}`);

  let connection = dbCon;

  if (dbName != '') {
    if (connection == null) {
      try {
        connection = await SQLite.openDatabase({ name: `${openName}.db` });
        await initialize(connection);
      } catch (error) {
        console.log(error);
      }
    }
  }

  return connection;
};

const initialize = async connection => {
  const createTables = new Promise((resolve, reject) => [
    connection.transaction(tx => {
      tx.executeSql(
        "SELECT COUNT(*) AS CNT FROM sqlite_master WHERE type='table' AND name='access'",
        [],
        (db, result) => {
          if (result.rows.item(0).CNT === 0) {
            const qurey = Promise.all([
              tx.executeSql(
                'CREATE TABLE access (id varchar(50), token varchar(255), userinfo json, registDate bigint, reserved json, primary key (id))',
                [],
              ),
              tx.executeSql(
                'CREATE TABLE sync_date (contactSyncDate bigint, roomSyncDate bigint)',
                [],
              ),
              tx.executeSql(
                'CREATE TABLE mydept_member (memberCode varchar(50), displayName varchar(50), type CHARACTER(1), pChat CHARACTER(1), sortKey integer, primary key (memberCode))',
                [],
              ),
              tx.executeSql(
                'CREATE TABLE contact_folder (ownerID varchar(50), folderId integer, groupCode varchar(50), folderName varchar(100), folderType CHARACTER(1), folderSortKey varchar(10), pChat CHARACTER(1), registDate bigint, primary key (folderId))',
                [],
              ),
              tx.executeSql(
                'CREATE TABLE contact_item (folderId integer, contactTarget varchar(50), companyCode varchar(50), contactType char(2), globalFolder char(1), registDate bigint) ',
                [],
              ),
              tx.executeSql(
                'CREATE UNIQUE INDEX contact_item_folderid_contacttarget_unique on contact_item (folderId, contactTarget)',
                [],
              ),
              tx.executeSql(
                'CREATE TABLE message (messageId integer, context TEXT, sender varchar(50), sendDate bigint, roomId integer, roomType CHARACTER(1), receiver varchar(255), messageType CHARACTER(1), unreadCnt integer, isSyncUnread CHARACTER(1), readYN CHARACTER(1), isMine CHARACTER(1), tempId integer, fileInfos varchar(255), linkInfo varchar(255), tagInfo varchar(255), senderInfo text, reserved json, botInfo json, primary key (messageId))',
                [],
              ),
              tx.executeSql(
                'CREATE TABLE room (roomId integer, roomName varchar(255), roomType CHARACTER(1), ownerCode varchar(50), targetCode varchar(50), registDate bigint, deleteDate bigint, updateDate bigint, syncDate bigint, setting json, reserved json, primary key (roomId))',
                [],
              ),
              tx.executeSql(
                'CREATE TABLE room_member (roomId integer, userId varchar(50), registDate bigint, reserved json)',
                [],
              ),
              tx.executeSql(
                'CREATE TABLE users (id varchar(50), name varchar(255), isMobile CHARACTER(1), PN varchar(200), LN varchar(200), TN varchar(200), dept varchar(50), presence varchar(50), photoPath varchar(255), work varchar(255), sortKey integer, reserved1 json, primary key (id))',
                [],
              ),
              tx.executeSql(
                'CREATE UNIQUE INDEX room_member_roomid_userid_unique on room_member (roomId, userId)',
                [],
              ),
            ])
              .then(() => {
                console.log('create SUCCESS');
                resolve();
              })
              .catch(e => {
                reject(e);
              });

            qurey();
          } else {
            resolve();
            // alter table 날려서 try catch 처리 ( 차후에 제거 필요 ) ---> setting column 추가 2020/07/27 ---> 2020/08/12 제거
          }
        },
        error => {
          reject(error);
        },
      );
    }),
  ]);

  return createTables;
};

export const deleteDabase = (dbName, callBack) => {
  if (dbCon) {
    dbCon.close(async () => {
      let domain = await AsyncStorage.getItem('EHINF');

      if (typeof domain === 'string') {
        domain = domain.replace(/http(s)?:\/\//i, '');
      } else {
        domain = '';
      }

      // domain.userid
      const openName = base64.encode(`${domain}.${dbName}`);
      SQLite.deleteDatabase({ name: `${openName}.db` }, callBack);
      dbCon = null;
    });
  }
};

export const deleteLocalDb = async dbName => {
  let domain = await AsyncStorage.getItem('EHINF');

  if (typeof domain === 'string') {
    domain = domain.replace(/http(s)?:\/\//i, '');
  } else {
    domain = '';
  }

  // domain.userid
  const openName = base64.encode(`${domain}.${dbName}`);
  SQLite.deleteDatabase({ name: `${openName}.db` });
  dbCon = null;
};

export const getConnection = async openName => {
  if (dbCon == null) {
    dbCon = await open(openName);
  }
  return dbCon;
};

export const getTransactionProvider = async openName => {
  dbCon = await getConnection(openName);

  const txProvider = await dbCon.transaction(tx => {
    return tx;
  });
  return txProvider;
};

export const closeConnection = () => {
  if (dbCon != null) {
    dbCon.close();
    dbCon = null;
  }
  return true;
};

class TxData {
  constructor(tableName) {
    this.txSql = '';
    this.txTarget = '';
    this.txValues = '';
    this.condiction = null;
    this.sortKey = null;
    this.sort = '';
    this.isStaticQuery = false;
    this.resultHandler = null;
    this.tableName = tableName;
    this.limit = null;
  }
}

class TransactionBuilder {
  constructor(transaction, tableName) {
    this.transaction = transaction;
    this.txData = new TxData(tableName);
  }
  select = target => {
    this.txData.txSql = 'SELECT';
    if (target != null) {
      this.txData.txTarget = target;
    }
    return this;
  };
  update = values => {
    this.txData.txSql = 'UPDATE';
    if (values != null) {
      this.txData.txValues = values;
    }
    return this;
  };
  insert = values => {
    this.txData.txSql = 'INSERT';
    if (values != null) {
      this.txData.txValues = values;
    }
    return this;
  };
  delete = () => {
    this.txData.txSql = 'DELETE';
    return this;
  };
  where = cond => {
    this.txData.condiction = cond;
    return this;
  };
  orderBy = (sortKey, sort) => {
    this.txData.sortKey = sortKey;

    if (sort) {
      this.txData.sort = sort;
    }
    return this;
  };
  query = (query, args) => {
    this.txData.isStaticQuery = true;
    this.txData.txSql = query;
    this.txData.txValues = args;
    return this;
  };
  limit = index => {
    this.txData.limit = index;
    return this;
  };
  execute = (resultHandler, errorHandler) => {
    let returnPromise;

    if (this.txData.isStaticQuery) {
      if (resultHandler) {
        this.transaction.executeSql(
          this.txData.txSql,
          this.txData.txValues,
          resultHandler,
        );
      } else {
        returnPromise = this.transaction.executeSql(
          this.txData.txSql,
          this.txData.txValues,
        );
      }
    } else {
      let query = '';
      query += this.txData.txSql;

      let values = [];

      switch (this.txData.txSql) {
        case 'SELECT':
          if (this.txData.txTarget.length == 0) {
            query += ' * ';
          } else {
            this.txData.txTarget.map((data, index) => {
              if (index + 1 < this.txData.txTarget.length) {
                query += ` ${data},`;
              } else {
                query += ` ${data} `;
              }
            });
          }

          query += `FROM ${this.txData.tableName}`;

          if (this.txData.condiction) {
            query += ` WHERE ${this.txData.condiction}`;
          }
          if (this.txData.sortKey) {
            query += ` ORDER BY ${this.txData.sortKey} ${this.txData.sort}`;
          }
          if (this.txData.limit && this.txData.limit > 0) {
            query += ` LIMIT ${this.txData.limit}`;
          }

          break;

        case 'INSERT':
          query += ` INTO ${this.txData.tableName} (`;

          if (this.txData.txValues.constructor == Object) {
            const temp = this.txData.txValues;
            this.txData.txValues = [];
            this.txData.txValues.push(temp);
          }

          for (let [key, value] of Object.entries(this.txData.txValues[0])) {
            query += `${key}, `;
          }

          query = query.substring(0, query.length - 2);
          query += ') VALUES ';

          this.txData.txValues.forEach(item => {
            query += '(';
            for (let [key, value] of Object.entries(item)) {
              query += '?, ';
              values.push(value);
            }

            query = query.substring(0, query.length - 2);
            query += '), ';
          });

          query = query.substring(0, query.length - 2);

          break;

        case 'UPDATE':
          query += ` ${this.txData.tableName} SET `;

          for (let [key, value] of Object.entries(this.txData.txValues)) {
            query += `${key} = ?, `;
            values.push(value);
          }

          query = query.substring(0, query.length - 2);

          if (this.txData.condiction != null) {
            query += ` WHERE ${this.txData.condiction}`;
          }

          break;

        case 'DELETE':
          query += ` FROM ${this.txData.tableName}`;
          if (this.txData.condiction != null) {
            query += ` WHERE ${this.txData.condiction}`;
          }

          break;
      }

      if (resultHandler) {
        this.transaction.executeSql(query, values, resultHandler, errorHandler);
      } else {
        returnPromise = this.transaction.executeSql(query, values);
      }
    }

    return returnPromise;
  };
}

export const tx = (transaction, tableName) => {
  return new TransactionBuilder(transaction, tableName);
};
