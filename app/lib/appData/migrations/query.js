import { tx } from '@/lib/appData/connector';

export async function validateTableColumn(conn, tableName, columnName) {
  let isValid = false;
  await conn.transaction(async _tx => {
    const query = await tx(_tx)
      .query(`PRAGMA table_info(${tableName})`)
      .execute();
    const tableInfo = query[1].rows.raw();
    isValid = tableInfo.some(column => column.name === columnName);
  });
  return isValid;
}

export async function addSingleColumn(conn, tableName, column) {
  if (!column) {
    return;
  }
  await conn.transaction(async _tx => {
    const alterTableQuery = `ALTER TABLE ${tableName} ADD COLUMN ` + column;
    console.log('Execute Query: ', alterTableQuery);
    await tx(_tx)
      .query(alterTableQuery)
      .execute();
  });
}

export async function addMultipleColumn(conn, table, columns = []) {
  if (Array.isArray(columns) === false || columns.length === 0) {
    return;
  }
  // eslint-disable-next-line no-unused-vars
  for await (const column of columns) {
    await addSingleColumn(conn, table, column);
  }
}
