import {
  validateTableColumn,
  addSingleColumn,
  addMultipleColumn,
} from '../query';

export default async function migrateCustomGroup(conn) {
  const validateContactFolder = await validateTableColumn(
    conn,
    'contact_folder',
    'ownerID',
  );
  if (validateContactFolder === false) {
    await addSingleColumn(conn, 'contact_folder', 'ownerID varchar(50)');
  }
  const validateContactitem = await validateTableColumn(
    conn,
    'contact_item',
    'companyCode',
  );
  if (validateContactitem === false) {
    await addMultipleColumn(conn, 'contact_item', [
      'companyCode varchar(50)',
      'contactType char(2)',
      'globalFolder char(1)',
    ]);
  }
}
