import MigrationsManager from '@flumens/utils/dist/MigrationManager';
import { isPlatform } from '@ionic/core';
import config from './config';
import { Migration } from './flumens';
import appModel, { DEFAULT_SPECIES_GROUP } from './models/app';
import { db, samplesStore } from './models/store';

// Keep this historical ID here to avoid importing survey configs before models initialise.
const ABUNDANCE_ATTR_ID = 'occAttr:780';

type StoredSample = {
  metadata?: { survey?: string };
  occurrences?: { data: Record<string, unknown> }[];
  samples?: StoredSample[];
};

const migrateAbundance = (sample: StoredSample): boolean => {
  let changed = false;

  sample.occurrences?.forEach(({ data }) => {
    if (typeof data.count !== 'number') return;

    data[ABUNDANCE_ATTR_ID] ??=
      data.zeroAbundance || data.zero_abundance ? 0 : data.count;
    delete data.count;
    changed = true;
  });

  sample.samples?.forEach(subSample => {
    if (migrateAbundance(subSample)) changed = true;
  });

  return changed;
};

const migrations: Migration[] = [
  {
    version: '1.31.0',
    name: 'Move models to new schema & reset species groups',
    up: async () => {
      console.log('🔵 Starting migration to new model schema');

      await db.init();

      try {
        await db.query({ sql: "UPDATE samples SET id = NULL WHERE id is ''" });
        await db.query({ sql: "UPDATE groups SET id = NULL WHERE id is ''" });
        await db.query({
          sql: "UPDATE locations SET id = NULL WHERE id is ''",
        });

        appModel.data.speciesGroups = DEFAULT_SPECIES_GROUP;
        appModel.save();
      } catch (error) {
        console.debug(
          '🔵 groups or samples tables does not exist, skipping migration'
        );
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
  {
    version: '1.35.0',
    name: 'Move 15min occurrence count to abundance',
    up: async () => {
      await db.init();

      const records = await samplesStore.findAll();
      const migrateRecord = async (record: (typeof records)[number]) => {
        const storedSample = record.data as StoredSample;
        const survey = storedSample.metadata?.survey;
        if (
          survey !== 'precise-area' &&
          survey !== 'precise-single-species-area'
        )
          return;

        if (!migrateAbundance(storedSample)) return;

        await samplesStore.save({ ...record, data: storedSample });
      };

      await Promise.all(records.map(migrateRecord));
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
