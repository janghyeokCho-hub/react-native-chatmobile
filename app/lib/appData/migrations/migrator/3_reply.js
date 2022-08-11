import { validateTableColumn, addMultipleColumn } from '../query';

export default async function migrateReply(conn) {
  const includesReplyID = await validateTableColumn(conn, 'message', 'replyID');
  /* Check if column already exists in db */
  if (includesReplyID === true) {
    return;
  }
  /* Add columns */
  await addMultipleColumn(conn, 'message', [
    'replyID integer',
    'replyInfo json',
  ]);
}
