import { validateTableColumn, addSingleColumn } from '../query';

export default async function migrateBotInfo(conn) {
  const includesBotInfo = await validateTableColumn(conn, 'message', 'botInfo');
  if (includesBotInfo === true) {
    return;
  }
  /* Add column `botInfo` if not exists */
  await addSingleColumn(conn, 'message', 'botinfo json');
}
