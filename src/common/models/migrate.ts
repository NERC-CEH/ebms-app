import SQLiteDatabase from '@flumens/models/dist/Stores/SQLiteDatabase';
import { isPlatform, toastController } from '@ionic/core';
import { db, mainStore, samplesStore } from 'common/models/store';

export default async () => {
  console.log('SQLite migrate: START');

  async function showError(error: any) {
    (
      await toastController.create({
        message: error.message,
        position: 'top',
        duration: 100000000,
        color: 'danger',
      })
    ).present();
  }

  try {
    await SQLiteDatabase.migrateCordova(isPlatform('ios'));

    await db.init();
    console.log('SQLite migrate: db initialised');

    await mainStore.ready;

    const tables = await db.query({ sql: 'select * from sqlite_schema' });
    const hasGeneric = tables.find((t: any) => t.name === 'generic');
    if (hasGeneric) {
      await db.query({
        sql: `INSERT OR IGNORE INTO main (id, cid, data, created_at, updated_at, synced_at)
        SELECT json(value) ->> "$.id",
              key,
              COALESCE(json(value)->>"$.attrs", "{}"),
              COALESCE(json(value) ->> "$.metadata.createdOn", CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)),
              COALESCE(json(value) ->> "$.metadata.updatedOn", CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)),
              json(value) ->> "$.metadata.syncedOn"
        FROM generic;`,
      });

      console.log('SQLite migrate: main migrated');
    }

    const hasLocations = tables.find((t: any) => t.name === 'locations');
    if (hasLocations) {
      await db.query({ sql: `DROP TABLE IF EXISTS locations;` });
      console.log('SQLite migrate: locations dropped');
    }

    const hasGroups = tables.find((t: any) => t.name === 'groups');
    if (hasGroups) {
      await db.query({ sql: `DROP TABLE IF EXISTS groups;` });
      console.log('SQLite migrate: groups dropped');
    }

    await samplesStore.ready;

    const hasModels = tables.find((t: any) => t.name === 'models');
    if (hasModels) {
      await db.query({
        sql: `INSERT OR IGNORE INTO samples (id, cid, data, created_at, updated_at, synced_at)
        SELECT
              json(value) ->> "$.id",
              key,
              json(value),
              COALESCE(json(value) ->> "$.metadata.createdOn", CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)),
              COALESCE(json(value) ->> "$.metadata.updatedOn", CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)),
              json(value) ->> "$.metadata.syncedOn"
              FROM models
        WHERE json_extract(value, '$.metadata.syncedOn') IS NULL AND json_extract(value, '$.id') IS ''
        ORDER BY id DESC
        LIMIT 1000;`,
      });
      console.log('SQLite migrate: samples migrated');
    }
  } catch (error) {
    console.error(error);
    showError(error);
    console.log('SQLite migrate: error');
    throw error;
  }

  console.log('SQLite migrate: FINISH');
};
