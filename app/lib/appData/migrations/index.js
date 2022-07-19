import { getConnection } from '@/lib/appData/connector';
import AsyncStorage from '@react-native-community/async-storage';
import DatabaseMigrator from './DatabaseMigrator';
import DatabaseMigrationManager from './DatabaseMigrationManager';
import migrateCustomGroup from './migrator/1_customGroup';
import migrateBotInfo from './migrator/2_botInfo';

const migrationManager = new DatabaseMigrationManager([
  new DatabaseMigrator(1, '1. Custom Group', migrateCustomGroup),
  new DatabaseMigrator(2, '2. Bot Info', migrateBotInfo),
]);

export async function checkDatabaseMigration(userId) {
  const conn = await getConnection(userId);
  const versionKey = `SQLITE_SCHEME_VERSION_${userId}`;
  const currentVersion = Number(await AsyncStorage.getItem(versionKey)) || 0;
  const latestVersion = migrationManager.getLatestVersion();

  if (currentVersion >= latestVersion) {
    console.log(
      `currentVersion(${currentVersion}) >= latestVersion(${latestVersion}). Skip database migration.`,
    );
    return;
  }
  const migrationResult = await migrationManager.startMigration(
    conn,
    currentVersion,
  );
  if (migrationResult) {
    await AsyncStorage.setItem(versionKey, JSON.stringify(migrationResult));
  }
}
