export default class DatabaseMigrator {
  constructor(requiredVersion, migrationName, migrator) {
    this.requiredVersion = requiredVersion;
    this.migrationName = migrationName;
    this.migrator = migrator;
  }
  getRequiredVersion() {
    return this.requiredVersion;
  }
  getMigrationName() {
    return this.migrationName;
  }
  async migrate(userId) {
    try {
      await this?.migrator?.(userId);
    } catch (err) {
      console.log(
        `An error occured on mitration '${this.migrationName}' : `,
        err,
      );
      return 0;
    }
    return this.requiredVersion;
  }
}
