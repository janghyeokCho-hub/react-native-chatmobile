export default class DatabaseMigrationManager {
  constructor(migrations) {
    this.migrations = migrations || [];
  }
  addMigration(migrator) {
    this.migrations.push(migrator);
  }
  getLatestVersion() {
    const numOfMigrations = this.migrations.length;
    if (!numOfMigrations) {
      return 0;
    }
    return this.migrations[numOfMigrations - 1]?.getRequiredVersion();
  }
  async startMigration(conn, currentVersion) {
    try {
      let migrationResult = false;
      // eslint-disable-next-line no-unused-vars
      for await (const migration of this.migrations) {
        const requiredVersion = migration?.getRequiredVersion();
        const migrationName = migration?.getMigrationName();
        if (currentVersion >= requiredVersion) {
          console.log(
            `Skip migration '${migrationName}': currentVersion(${currentVersion}) >= requiredVersion(${requiredVersion})`,
          );
        } else {
          console.log(`Start migration '${migration.migrationName}'`);
          const migrationStatus = await migration?.migrate(conn);
          if (migrationStatus) {
            console.log(`Migration ${migration.migrationName}: Success`);
            if (migrationStatus) {
              migrationResult = migrationStatus;
            }
          } else {
            console.log(`Migration ${migration.migrationName}: Failed`);
            migrationResult = false;
          }
        }
      }
      return migrationResult;
    } catch (err) {
      console.log('Database migration occured an error : ', err);
    }
  }
}
