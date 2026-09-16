/* eslint-disable @typescript-eslint/naming-convention */
import GPS from 'helpers/GPS';
import { areaSizeAttr } from 'Survey/common/config';
import initGPSExtension, {
  calculateArea,
  updateSampleArea,
  type Shape,
} from '../GPSExt';

jest.mock('@flumens', () => ({
  device: { info: undefined },
  updateModelLocation: jest.fn(),
}));

jest.mock('@ionic/react', () => ({ isPlatform: () => false }));

jest.mock('helpers/GPS', () => ({
  __esModule: true,
  default: { start: jest.fn(), stop: jest.fn() },
}));

jest.mock('Survey/common/config', () => ({
  areaSizeAttr: { id: 'smpAttr:723' },
}));

const location = {
  latitude: 51.5,
  longitude: -0.12,
  accuracy: 5,
  altitude: null,
  altitudeAccuracy: null,
};

const getSample = (shape: Shape = { type: 'LineString', coordinates: [] }) => ({
  data: {
    location: { latitude: 51.5, longitude: -0.12, shape, source: 'map' },
  },
  gps: { setLocation: jest.fn(() => Promise.resolve()) },
  save: jest.fn(() => Promise.resolve()),
});

const getExtensionSample = (): {
  data: Record<string, unknown>;
  gps?: ReturnType<typeof initGPSExtension>;
  isTimerFinished: () => boolean;
  save: jest.Mock<Promise<void>>;
} => ({
  data: {},
  gps: undefined,
  isTimerFinished: () => false,
  save: jest.fn(() => Promise.resolve()),
});

describe('GPS extension', () => {
  test('creates a valid line from the first GPS point', async () => {
    const sample = getSample();

    await updateSampleArea(sample, location);

    expect(sample.gps.setLocation).toHaveBeenCalledWith(
      {
        type: 'LineString',
        coordinates: [
          [-0.12, 51.5],
          [-0.12, 51.5],
        ],
      },
      5,
      undefined,
      undefined
    );
    expect(sample.save).not.toHaveBeenCalled();
  });

  test('only adds route points after moving at least 15 metres', async () => {
    const shape: Shape = {
      type: 'LineString',
      coordinates: [
        [-0.12, 51.5],
        [-0.12, 51.5],
      ],
    };
    const sample = getSample(shape);

    await updateSampleArea(sample, { ...location, latitude: 51.50001 });

    expect(sample.save).toHaveBeenCalledTimes(1);
    expect(sample.gps.setLocation).not.toHaveBeenCalled();

    await updateSampleArea(sample, { ...location, latitude: 51.5002 });

    expect(sample.gps.setLocation).toHaveBeenCalledWith(
      {
        type: 'LineString',
        coordinates: [
          [-0.12, 51.5],
          [-0.12, 51.5],
          [-0.12, 51.5002],
        ],
      },
      5,
      undefined,
      undefined
    );
  });

  test('calculates buffered line and polygon areas', () => {
    const line: Shape = {
      type: 'LineString',
      coordinates: [
        [0, 0],
        [0, 0.001],
      ],
    };
    const polygon: Shape = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [0.001, 0],
          [0.001, 0.001],
          [0, 0.001],
          [0, 0],
        ],
      ],
    };

    expect(calculateArea(line)).toBe(555);
    expect(calculateArea(polygon)).toBe(12392);
  });

  test('setLocation stores the latest point and calculated area', async () => {
    const shape: Shape = {
      type: 'LineString',
      coordinates: [
        [-0.12, 51.5],
        [-0.119, 51.5],
      ],
    };
    const sample = getExtensionSample();
    const gps = initGPSExtension(sample as never);
    sample.gps = gps;

    await gps.setLocation(shape, 4, 10, 2);

    expect(sample.data).toEqual({
      location: {
        latitude: 51.5,
        longitude: -0.119,
        shape,
        source: 'map',
        accuracy: 4,
        altitude: 10,
        altitudeAccuracy: 2,
      },
      [areaSizeAttr.id]: calculateArea(shape),
    });
    expect(sample.save).toHaveBeenCalledTimes(1);
  });

  test('starts GPS through the nested extension', () => {
    const sample = getExtensionSample();
    sample.gps = initGPSExtension(sample as never);
    (GPS.start as jest.Mock).mockReturnValue(7);

    sample.gps.start();

    expect(GPS.start).toHaveBeenCalledTimes(1);
    expect(sample.gps.locating).toBe(7);
  });
});
