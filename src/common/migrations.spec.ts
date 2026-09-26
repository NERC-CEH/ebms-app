/* eslint-disable @typescript-eslint/naming-convention */
import migrationManager from './migrations';
import { db, samplesStore } from './models/store';

jest.mock('./config', () => ({
  __esModule: true,
  default: { version: '1.35.0' },
}));
jest.mock('./models/app', () => ({
  __esModule: true,
  default: { data: {}, save: jest.fn() },
  DEFAULT_SPECIES_GROUP: [],
}));
jest.mock('./models/store', () => ({
  db: { init: jest.fn().mockResolvedValue(undefined) },
  samplesStore: {
    findAll: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
  },
}));

test('migrates only 15min occurrence counts, including zero observations', async () => {
  const area = {
    cid: 'area',
    data: {
      metadata: { survey: 'precise-area' },
      occurrences: [{ data: { count: 2 } }],
      samples: [{ occurrences: [{ data: { count: 4 } }] }],
    },
  };
  const singleSpecies = {
    cid: 'single',
    data: {
      metadata: { survey: 'precise-single-species-area' },
      samples: [
        { occurrences: [{ data: { count: 1, zeroAbundance: true } }] },
        { occurrences: [{ data: { count: 1, zero_abundance: true } }] },
      ],
    },
  };
  const transect = {
    cid: 'transect',
    data: {
      metadata: { survey: 'transect' },
      samples: [{ occurrences: [{ data: { count: 3 } }] }],
    },
  };

  jest
    .mocked(samplesStore.findAll)
    .mockResolvedValue([area, singleSpecies, transect] as never);
  localStorage.setItem('_lastAppMigratedVersion', '1.34.1');

  await migrationManager.run();

  expect(area.data.occurrences[0].data).toEqual({ 'occAttr:780': 2 });
  expect(area.data.samples[0].occurrences[0].data).toEqual({
    'occAttr:780': 4,
  });
  expect(singleSpecies.data.samples[0].occurrences[0].data).toEqual({
    'occAttr:780': 0,
    zeroAbundance: true,
  });
  expect(singleSpecies.data.samples[1].occurrences[0].data).toEqual({
    'occAttr:780': 0,
    zero_abundance: true,
  });
  expect(transect.data.samples[0].occurrences[0].data).toEqual({ count: 3 });
  expect(samplesStore.save).toHaveBeenCalledTimes(2);
  expect(db.init).toHaveBeenCalledTimes(1);

  localStorage.setItem('_lastAppMigratedVersion', '1.34.1');
  await migrationManager.run();
  expect(samplesStore.save).toHaveBeenCalledTimes(2);

  localStorage.removeItem('_lastAppMigratedVersion');
});
