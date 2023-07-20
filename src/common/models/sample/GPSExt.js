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

function calculateLineLenght(lineString) {
  /**
   * Calculate the approximate distance between two coordinates (lat/lon)
   *
   * © Chris Veness, MIT-licensed,
   * http://www.movable-type.co.uk/scripts/latlong.html#equirectangular
   */
  function distance(λ1, φ1, λ2, φ2) {
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

function getShape(sample) {
  const oldLocation = sample.attrs.location || {};

  if (!oldLocation.shape) {
    return { type: 'LineString', coordinates: [] };
  }
  return JSON.parse(JSON.stringify(oldLocation.shape));
}

function isSufficientDistanceMade(coordinates, latitude, longitude) {
  const lastLocation = [...(coordinates[coordinates.length - 1] || [])]
    .reverse()
    .map(parseFloat);
  const newLocation = [latitude, longitude].map(parseFloat);

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

export function updateSampleArea(sample, location) {
  const { latitude, longitude, accuracy, altitude, altitudeAccuracy } =
    location;
  const shape = getShape(sample);
  const coordinates =
    shape.type === 'Polygon' ? shape.coordinates[0] : shape.coordinates;

  if (!isSufficientDistanceMade(coordinates, latitude, longitude)) {
    return sample;
  }

  coordinates.push([longitude, latitude]);
  return sample.setLocation(shape, accuracy, altitude, altitudeAccuracy);
}

const extension = {
  setLocation(shape, accuracy, altitude, altitudeAccuracy) {
    if (!shape) {
      this.attrs.location = null;
      return this.save();
    }

    let area;
    let [longitude, latitude] = shape.coordinates[shape.coordinates.length - 1];

    if (shape.type === 'Polygon') {
      area = geojsonArea.geometry(shape);
      [longitude, latitude] =
        shape.coordinates[0][shape.coordinates[0].length - 1]; // eslint-disable-line
    } else {
      area =
        config.DEFAULT_TRANSECT_BUFFER * calculateLineLenght(shape.coordinates);
    }

    area = Math.floor(area);

    this.attrs.location = {
      latitude,
      longitude,
      area,
      shape,
      source: 'map',
      accuracy,
      altitude,
      altitudeAccuracy,
    };

    return this.save();
  },

  toggleGPStracking(state) {
    if (this.isGPSRunning() || state === false) {
      this.stopGPS();
      return;
    }

    this.startGPS();
  },

  gpsExtensionInit() {
    this.gps = observable({ locating: null });
  },

  startGPS() {
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

    // eslint-disable-next-line
    const onPosition = (error, location) => {
      if (error) {
        const permissionsError = error?.message === 'User denied Geolocation';
        if (permissionsError) {
          console.log('GPS: error', error);
        } else {
          console.error('GPS: error', error);
        }

        this.stopGPS();
        return;
      }

      const parsedLocation = {
        ...location,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
      };

      const isOverDefaultSurveyEndTime = this.isTimerFinished();
      if (this.attrs.surveyStartTime && isOverDefaultSurveyEndTime) {
        console.log('SampleModel:GPS: timed out stopping!');
        this.stopGPS();
        return;
      }

      const isPreciseAreaSubSample = !!this.parent;
      if (isPreciseAreaSubSample) {
        updateModelLocation(this, parsedLocation);
        this.stopGPS();
        return;
      }

      updateSampleArea(this, parsedLocation);
    };

    this.gps.locating = GPS.start(onPosition);
  },

  stopGPS() {
    if (!this.isGPSRunning()) {
      return;
    }

    console.log('SampleModel:GPS stop');
    GPS.stop(this.gps.locating);
    this.gps.locating = null;
  },

  isGPSRunning() {
    return !!(this.gps.locating || this.gps.locating === 0);
  },

  hasLoctionMissingAndIsnotLocating() {
    return (
      (!this.attrs.location || !this.attrs.location.latitude) &&
      !this.isGPSRunning()
    );
  },
};

export { extension as default };
