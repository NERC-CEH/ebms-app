/* eslint-disable no-param-reassign, no-restricted-syntax */
import MigrationsManager from '@flumens/utils/dist/MigrationManager';
import { isPlatform } from '@ionic/core';
import config from './config';
import { Migration } from './flumens';
import appModel, { DEFAULT_SPECIES_GROUP } from './models/app';
import { db } from './models/store';

const migrations: Migration[] = [
  {
    version: '1.31.0',
    name: 'Move models to new schema & reset species groups',
    up: async () => {
      console.log('🔵 Starting migration to new model schema');

      await db.init();

      try {
        await db.query({ sql: `UPDATE samples SET id = NULL WHERE id is ''` });
        await db.query({ sql: `UPDATE groups SET id = NULL WHERE id is ''` });
        await db.query({
          sql: `UPDATE locations SET id = NULL WHERE id is ''`,
        });

        appModel.data.speciesGroups = DEFAULT_SPECIES_GROUP;
        appModel.save();
      } catch (error) {
        console.debug('🔵 groups table does not exist, skipping migration');
      }

      if (!isPlatform('hybrid')) {
        await new Promise(resolve => {
          setTimeout(resolve, 1000);
        });
        window.location.reload();
      }

      console.log('🔵 Migration completed successfully');
    },
  },
];

const newVersion = () => config.version;
const currentVersion = () =>
  window.localStorage.getItem('_lastAppMigratedVersion') || null;

const updateVersion = async (version: string) => {
  window.localStorage.setItem('_lastAppMigratedVersion', version);
};

const migrationManager = new MigrationsManager(
  migrations,
  newVersion,
  currentVersion,
  updateVersion
);

export default migrationManager;
