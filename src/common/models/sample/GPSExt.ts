/** ****************************************************************************
 * Indicia Sample geolocation functions.
 *
 * Sample geolocation events:
 * start, update, error, success, stop
 **************************************************************************** */
import { observable } from 'mobx';
import { PushNotifications } from '@capacitor/push-notifications';
import { updateModelLocation, device, type LocationModelLike } from '@flumens';
import { isPlatform } from '@ionic/react';
import geojsonArea from '@mapbox/geojson-area';
import config from 'common/config';
import GPS from 'helpers/GPS';
import { areaSizeAttr } from 'Survey/common/config';

const METERS_SINCE_LAST_LOCATION = 15;

export type Shape = GeoJSON.LineString | GeoJSON.Polygon;

type Location = {
  latitude: number;
  longitude: number;
  shape: Shape;
  source: string;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
};

type GPSLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
};

function calculateLineLength(coordinates: GeoJSON.Position[]): number {
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

  if (coordinates.length < 2) return 0;
  let result = 0;
  for (let i = 1; i < coordinates.length; i++)
    result += distance(
      coordinates[i - 1][0],
      coordinates[i - 1][1],
      coordinates[i][0],
      coordinates[i][1]
    );
  return result;
}

type SampleWithLocation = {
  data: {
    location?: Location;
    surveyStartTime?: string;
    [areaSizeAttr.id]?: number;
  };
};

function getShape(sample: SampleWithLocation): Shape {
  const oldLocation = sample.data.location || ({} as Location);

  if (!oldLocation.shape) {
    return { type: 'LineString', coordinates: [] };
  }
  return JSON.parse(JSON.stringify(oldLocation.shape)) as Shape;
}

function isSufficientDistanceMade(
  coordinates: GeoJSON.Position[],
  latitude: number,
  longitude: number
): boolean {
  const lastLocation = [...(coordinates[coordinates.length - 1] || [])]
    .reverse()
    .map(Number);
  const newLocation = [latitude, longitude];

  const distanceSinceLastLocation = calculateLineLength([
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
  gps: {
    setLocation: (
      shape: Shape,
      accuracy?: number,
      altitude?: number,
      altitudeAccuracy?: number
    ) => Promise<void>;
  };
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

  if (!isSufficientDistanceMade(coordinates, latitude, longitude)) {
    return sample.save();
  }

  coordinates.push([longitude, latitude]);
  if (coordinates.length === 1) coordinates.push([longitude, latitude]); // can't have just one point

  return sample.gps.setLocation(
    shape,
    accuracy,
    altitude ?? undefined,
    altitudeAccuracy ?? undefined
  );
}

export const calculateArea = (shape: Shape): number => {
  if (shape.type === 'Polygon') return Math.floor(geojsonArea.geometry(shape));

  return Math.floor(
    config.defaultTransectBuffer * calculateLineLength(shape.coordinates)
  );
};

type ExtensionModel = SampleModel & {
  parent?: object;
  isTimerFinished: () => boolean;
};

export type Extension = {
  locating: number | null;
  setLocation: (
    shape: Shape | null,
    accuracy?: number,
    altitude?: number,
    altitudeAccuracy?: number
  ) => Promise<void>;
  toggle: (state?: boolean) => void;
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
  hasNoLocationAndNotLocating: () => boolean;
};

const initGPSExtension = (model: ExtensionModel): Extension =>
  observable({
    locating: null,

    setLocation(
      shape: Shape | null,
      accuracy?: number,
      altitude?: number,
      altitudeAccuracy?: number
    ): Promise<void> {
      if (!shape) {
        model.data.location = undefined;
        return model.save();
      }

      const coordinates =
        shape.type === 'Polygon' ? shape.coordinates[0] : shape.coordinates;
      const [longitude, latitude] = coordinates[coordinates.length - 1];

      model.data.location = {
        latitude,
        longitude,
        shape,
        source: 'map',
        accuracy,
        altitude,
        altitudeAccuracy,
      };

      model.data[areaSizeAttr.id] = calculateArea(shape);

      return model.save();
    },

    toggle(state?: boolean) {
      if (this.isRunning() || state === false) {
        this.stop();
        return;
      }

      this.start();
    },

    start() {
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

          this.stop();
          return;
        }

        const isOverDefaultSurveyEndTime = model.isTimerFinished();
        if (model.data.surveyStartTime && isOverDefaultSurveyEndTime) {
          // eslint-disable-next-line no-console
          console.log('SampleModel:GPS: timed out stopping!');
          this.stop();
          return;
        }

        const isPreciseAreaSubSample = !!model.parent;
        if (isPreciseAreaSubSample) {
          const locationForModel = {
            ...location!,
            altitude: location!.altitude ?? undefined,
            altitudeAccuracy: location!.altitudeAccuracy ?? undefined,
          };
          updateModelLocation(
            model as unknown as LocationModelLike,
            locationForModel
          );
          this.stop();
          return;
        }

        updateSampleArea(model, location!);
      };

      this.locating = GPS.start(onPosition);
    },

    stop() {
      if (!this.isRunning()) return;

      // eslint-disable-next-line no-console
      console.log('SampleModel:GPS stop');
      GPS.stop(this.locating!);
      this.locating = null;
    },

    isRunning() {
      return !!(this.locating || this.locating === 0);
    },

    hasNoLocationAndNotLocating() {
      return !model.data.location?.latitude && !this.isRunning();
    },
  } as Extension);

export default initGPSExtension;
