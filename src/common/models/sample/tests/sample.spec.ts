/* eslint-disable @typescript-eslint/naming-convention */
import { device } from '@flumens';
import groups from 'common/data/groups';
import userModel from 'models/user';
import Sample from '..';

jest.mock('@flumens', () => {
  class BaseModel {
    data: Record<string, unknown>;

    metadata: Record<string, unknown>;

    samples: unknown[];

    occurrences: unknown[];

    media: unknown[];

    constructor(
      options: {
        data?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
      } = {}
    ) {
      this.data = options.data || {};
      this.metadata = options.metadata || {};
      this.samples = [];
      this.occurrences = [];
      this.media = [];
    }

    save() {
      return Promise.resolve();
    }
  }

  const stub = () => null;
  return new Proxy(
    {
      Collection: BaseModel,
      DrupalUserModel: BaseModel,
      LocationModel: BaseModel,
      MediaModel: BaseModel,
      Model: BaseModel,
      OccurrenceModel: BaseModel,
      SampleModel: BaseModel,
      Store: BaseModel,
      device: { isOnline: false },
      validateRemoteModel: jest.fn(),
    },
    { get: (target, key) => Reflect.get(target, key) || stub }
  );
});

jest.mock('@ionic/react', () => {
  const stub = () => null;
  return new Proxy(
    { isPlatform: () => false },
    { get: (target, key) => Reflect.get(target, key) || stub }
  );
});

jest.mock('Survey/AreaCount/config', () => ({
  __esModule: true,
  areaSizeAttr: { id: 'smpAttr:723' },
  default: { id: 565, name: 'precise-area' },
}));
jest.mock('Survey/AreaCount/configSpecies', () => ({
  __esModule: true,
  default: { id: 596, name: 'precise-single-species-area' },
}));
jest.mock('Survey/BaitTrap/config', () => ({
  __esModule: true,
  default: { id: 1, name: 'bait-trap' },
}));
jest.mock('Survey/MothTrap/config', () => ({
  __esModule: true,
  MachineInvolvement: { MACHINE: 5 },
  default: { id: 2, name: 'moth' },
}));
jest.mock('Survey/Transect/config', () => ({
  __esModule: true,
  default: { id: 3, name: 'transect' },
}));
jest.mock('Survey/common/config', () => ({
  areaSizeAttr: { id: 'smpAttr:723' },
  guidAttr: { id: 'smpAttr:2021' },
}));

const createSample = (survey: string, data: Record<string, unknown>) =>
  new Sample({
    metadata: { survey },
    data,
  } as ConstructorParameters<typeof Sample>[0]);

const getUploadSample = () => ({
  isSynchronising: false,
  isUploaded: false,
  getSurvey: jest.fn(() => ({ deprecated: false })),
  validateRemote: jest.fn((): unknown => null),
  metadata: { survey: 'precise-area' },
  setMissingSpeciesGroups: jest.fn(),
  cleanUp: jest.fn(),
  saveRemote: jest.fn(() => Promise.resolve('uploaded')),
});

describe('Sample project extensions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    device.isOnline = false;
  });

  test.each([
    [
      'count location',
      'precise-area',
      { location: { id: 'site-1', name: 'Meadow', area: 25 } },
      {
        locationId: 'site-1',
        locationName: 'Meadow',
        'smpAttr:723': 25,
        location: {},
      },
    ],
    [
      'moth coordinates',
      'moth',
      { location: { data: { lat: '51.5', lon: '-0.12' } } },
      {
        enteredSref: '51.5 -0.12',
        location: { data: { lon: '-0.12' } },
      },
    ],
    [
      'transect grid reference',
      'transect',
      {
        location: {
          centroidSref: 'TQ 300 800',
          centroidSrefSystem: 'OSGB',
        },
      },
      {
        enteredSref: 'TQ 300 800',
        enteredSrefSystem: 'OSGB',
        location: { centroidSrefSystem: 'OSGB' },
      },
    ],
  ])('migrates legacy %s', (_name, survey, data, expected) => {
    const sample = createSample(survey, data);

    expect(sample.data).toMatchObject(expected);
  });

  test('adds missing current and legacy species groups once', () => {
    const sample = {
      data: { speciesGroups: [groups.butterflies.id] },
      samples: [
        {
          occurrences: [{ data: { taxon: { taxonGroupId: groups.moths.id } } }],
        },
        {
          occurrences: [{ data: { taxon: { taxonGroupId: groups.moths.id } } }],
        },
        {
          occurrences: [
            { data: { taxon: { taxonGroupId: groups.dragonflies.listId } } },
          ],
        },
      ],
      save: jest.fn(),
    };

    Sample.prototype.setMissingSpeciesGroups.call(sample as unknown as Sample);

    expect(sample.data.speciesGroups).toEqual([
      groups.butterflies.id,
      groups.moths.id,
      groups.dragonflies.id,
    ]);
    expect(sample.save).toHaveBeenCalledTimes(1);
  });

  test('does not upload invalid, offline, or unverified records', async () => {
    const sample = getUploadSample();
    const checkActivation = jest
      .spyOn(userModel, 'checkActivation')
      .mockResolvedValue(false);

    sample.validateRemote.mockReturnValueOnce({ location: ['Missing'] });
    await expect(
      Sample.prototype.upload.call(sample as unknown as Sample)
    ).resolves.toBe(false);

    await expect(
      Sample.prototype.upload.call(sample as unknown as Sample)
    ).resolves.toBe(false);

    device.isOnline = true;
    await expect(
      Sample.prototype.upload.call(sample as unknown as Sample)
    ).resolves.toBe(false);

    expect(checkActivation).toHaveBeenCalledTimes(1);
    expect(sample.saveRemote).not.toHaveBeenCalled();
    expect(sample.cleanUp).not.toHaveBeenCalled();
  });

  test('prepares a valid count before handing it to saveRemote', async () => {
    const sample = getUploadSample();
    device.isOnline = true;
    jest.spyOn(userModel, 'checkActivation').mockResolvedValue(true);

    await expect(
      Sample.prototype.upload.call(sample as unknown as Sample)
    ).resolves.toBe('uploaded');

    expect(sample.setMissingSpeciesGroups).toHaveBeenCalledTimes(1);
    expect(sample.cleanUp).toHaveBeenCalledTimes(1);
    expect(sample.saveRemote).toHaveBeenCalledTimes(1);
  });
});
