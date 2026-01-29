/** ****************************************************************************
 * Indicia Sample geolocation functions.
 *
 * Sample geolocation events:
 * start, update, error, success, stop
 **************************************************************************** */
import { observable } from 'mobx';
import { PushNotifications } from '@capacitor/push-notifications';
import { updateModelLocation, device } from '@flumens';
import { isPlatform } from '@ionic/react';
import geojsonArea from '@mapbox/geojson-area';
import config from 'common/config';
import GPS from 'helpers/GPS';

const METERS_SINCE_LAST_LOCATION = 15;

type Coordinate = [number, number];
type LineString = Coordinate[];
type Polygon = Coordinate[][];

type Shape = {
  type: 'LineString' | 'Polygon';
  coordinates: LineString | Polygon;
};

type Location = {
  latitude: number;
  longitude: number;
  area: number;
  shape: Shape;
  source: string;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
};

type GPSLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
};

function calculateLineLenght(lineString: LineString): number {
  /**
   * Calculate the approximate distance between two coordinates (lat/lon)
   *
   * © Chris Veness, MIT-licensed,
   * http://www.movable-type.co.uk/scripts/latlong.html#equirectangular
   */
  function distance(λ1: number, φ1: number, λ2: number, φ2: number): number {
    const R = 6371000;
    const Δλ = ((λ2 - λ1) * Math.PI) / 180;
    φ1 = (φ1 * Math.PI) / 180; //eslint-disable-line
    φ2 = (φ2 * Math.PI) / 180; //eslint-disable-line
    const x = Δλ * Math.cos((φ1 + φ2) / 2);
    const y = φ2 - φ1;
    const d = Math.sqrt(x * x + y * y);
    return R * d;
  }

  if (lineString.length < 2) return 0;
  let result = 0;
  for (let i = 1; i < lineString.length; i++)
    result += distance(
      lineString[i - 1][0],
      lineString[i - 1][1],
      lineString[i][0],
      lineString[i][1]
    );
  return result;
}

type SampleWithLocation = {
  data: {
    location?: Location | null;
    surveyStartTime?: string;
  };
};

function getShape(sample: SampleWithLocation): Shape {
  const oldLocation = sample.data.location || ({} as Location);

  if (!oldLocation.shape) {
    return { type: 'LineString', coordinates: [] };
  }
  return JSON.parse(JSON.stringify(oldLocation.shape));
}

function isSufficientDistanceMade(
  coordinates: LineString | Polygon,
  latitude: number,
  longitude: number
): boolean {
  const lastLocation = [...(coordinates[coordinates.length - 1] || [])]
    .reverse()
    .map(Number) as Coordinate;
  const newLocation = [latitude, longitude].map(Number) as Coordinate;

  const distanceSinceLastLocation = calculateLineLenght([
    lastLocation,
    newLocation,
  ]);

  if (
    lastLocation.length &&
    distanceSinceLastLocation < METERS_SINCE_LAST_LOCATION
  ) {
    return false;
  }

  return true;
}

type SampleModel = SampleWithLocation & {
  setLocation: (
    shape: Shape,
    accuracy: number,
    altitude: number | null,
    altitudeAccuracy: number | null
  ) => Promise<void>;
  save: () => Promise<void>;
};

export function updateSampleArea(
  sample: SampleModel,
  location: GPSLocation
): Promise<void> {
  const { latitude, longitude, accuracy, altitude, altitudeAccuracy } =
    location;
  const shape = getShape(sample);
  const coordinates =
    shape.type === 'Polygon' ? shape.coordinates[0] : shape.coordinates;

  if (
    !isSufficientDistanceMade(coordinates as LineString, latitude, longitude)
  ) {
    return sample.save();
  }

  (coordinates as LineString).push([longitude, latitude]);
  if (coordinates.length === 1)
    (coordinates as LineString).push([longitude, latitude]); // can't have just one point

  return sample.setLocation(shape, accuracy, altitude, altitudeAccuracy);
}

export const calculateArea = (shape: Shape): number => {
  let area;

  if (shape.type === 'Polygon') {
    area = geojsonArea.geometry(shape);
  } else {
    area =
      config.DEFAULT_TRANSECT_BUFFER *
      calculateLineLenght(shape.coordinates as LineString);
  }

  return Math.floor(area);
};

type ExtensionThis = SampleModel & {
  gps: { locating: number | null };
  parent?: unknown;
  isTimerFinished: () => boolean;
  isGPSRunning: () => boolean;
  stopGPS: () => void;
  startGPS: () => void;
};

const extension = {
  setLocation(
    this: ExtensionThis,
    shape: Shape | null,
    accuracy: number,
    altitude: number | null,
    altitudeAccuracy: number | null
  ): Promise<void> {
    if (!shape) {
      this.data.location = null;
      return this.save();
    }

    const lastCoordinate =
      shape.type === 'Polygon'
        ? (shape.coordinates[0][shape.coordinates[0].length - 1] as Coordinate)
        : (shape.coordinates[shape.coordinates.length - 1] as Coordinate);

    const [longitude, latitude] = lastCoordinate;

    this.data.location = {
      latitude,
      longitude,
      area: calculateArea(shape),
      shape,
      source: 'map',
      accuracy,
      altitude,
      altitudeAccuracy,
    };

    return this.save();
  },

  toggleGPStracking(this: ExtensionThis, state?: boolean) {
    if (this.isGPSRunning() || state === false) {
      this.stopGPS();
      return;
    }

    this.startGPS();
  },

  gpsExtensionInit(this: ExtensionThis) {
    this.gps = observable({ locating: null });
  },

  startGPS(this: ExtensionThis) {
    // eslint-disable-next-line no-console
    console.log('SampleModel:GPS start');

    const showPushNotificationForBackgroundGPS = async () => {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive !== 'granted') {
        permStatus = await PushNotifications.requestPermissions();
      }
    };

    const ANDROID_12_VERSION = 12;
    const isPlatformAndroidAndDeviceVersionAbove12 =
      isPlatform('android') &&
      device &&
      Number(device.info?.osVersion) > ANDROID_12_VERSION;
    if (isPlatformAndroidAndDeviceVersionAbove12) {
      showPushNotificationForBackgroundGPS();
    }

    const onPosition = (error: Error | null, location?: GPSLocation) => {
      if (error) {
        const permissionsError = error?.message === 'User denied Geolocation';
        if (permissionsError) {
          // eslint-disable-next-line no-console
          console.log('GPS: error', error);
        } else {
          // eslint-disable-next-line no-console
          console.error('GPS: error', error);
        }

        this.stopGPS();
        return;
      }

      const isOverDefaultSurveyEndTime = this.isTimerFinished();
      if (this.data.surveyStartTime && isOverDefaultSurveyEndTime) {
        // eslint-disable-next-line no-console
        console.log('SampleModel:GPS: timed out stopping!');
        this.stopGPS();
        return;
      }

      const isPreciseAreaSubSample = !!this.parent;
      if (isPreciseAreaSubSample) {
        const locationForModel = {
          ...location!,
          altitude: location!.altitude ?? undefined,
          altitudeAccuracy: location!.altitudeAccuracy ?? undefined,
        };
        updateModelLocation(this, locationForModel);
        this.stopGPS();
        return;
      }

      updateSampleArea(this, location!);
    };

    this.gps.locating = GPS.start(onPosition);
  },

  stopGPS(this: ExtensionThis) {
    if (!this.isGPSRunning()) return;

    // eslint-disable-next-line no-console
    console.log('SampleModel:GPS stop');
    GPS.stop(this.gps.locating!);
    this.gps.locating = null;
  },

  isGPSRunning(this: ExtensionThis) {
    return !!(this.gps.locating || this.gps.locating === 0);
  },

  hasLoctionMissingAndIsnotLocating(this: ExtensionThis) {
    return !this.data.location?.latitude && !this.isGPSRunning();
  },
};

export default extension;
