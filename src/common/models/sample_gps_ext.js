/** ****************************************************************************
 * Indicia Sample geolocation functions.
 *
 * Sample geolocation events:
 * start, update, error, success, stop
 **************************************************************************** */
import GPS from 'helpers/GPS';
import Log from 'helpers/log';
import config from 'config';
import { observable } from 'mobx';
import geojsonArea from '@mapbox/geojson-area';

const DEFAULT_MIN_DISTANCE_SINCE_LAST_LOCATION = 20; // meters

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
  const oldLocation = sample.get('location') || {};

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
    distanceSinceLastLocation < DEFAULT_MIN_DISTANCE_SINCE_LAST_LOCATION
  ) {
    return false;
  }

  return true;
}

export function updateSampleLocation(sample, { latitude, longitude }) {
  const shape = getShape(sample);
  const coordinates =
    shape.type === 'Polygon' ? shape.coordinates[0] : shape.coordinates;

  if (!isSufficientDistanceMade(coordinates, latitude, longitude)) {
    return sample;
  }

  coordinates.push([longitude, latitude]);
  return sample.setLocation(shape);
}

const extension = {
  setLocation(shape) {
    if (!shape) {
      return this.save({
        location: null,
      });
    }

    let area;
    let [longitude, latitude] = shape.coordinates[0];

    if (shape.type === 'Polygon') {
      area = geojsonArea.geometry(shape);
      [longitude, latitude] = shape.coordinates[0][0]; // eslint-disable-line
    } else {
      area =
        config.DEFAULT_TRANSECT_BUFFER * calculateLineLenght(shape.coordinates);
    }

    area = Math.floor(area);

    return this.save({
      location: {
        latitude,
        longitude,
        area,
        shape,
        source: 'map',
      },
    });
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

    // TODO: remove
    // window.testing.GPS.mock();
  },

  startGPS(accuracyLimit) {
    Log('SampleModel:GPS: start.');

    // eslint-disable-next-line
    const that = this;
    const options = {
      accuracyLimit,

      onUpdate(location) {
        console.log('GPS onUpdate');
        console.log(location);
      },

      callback(error, location) {
        if (error) {
          console.log('GPS onError');
          console.log(error);
          that.stopGPS();
          return;
        }

        const startTime = new Date(that.get('surveyStartTime'));
        const defaultSurveyEndTime =
          startTime.getTime() + config.DEFAULT_SURVEY_TIME;
        const isOverDefaultSurveyEndTime =
          defaultSurveyEndTime < new Date().getTime();
        if (isOverDefaultSurveyEndTime) {
          that.stopGPS();
          return;
        }

        console.log('GPS callback');
        console.log(location);
        updateSampleLocation(that, location);
      },
    };

    this.gps.locating = GPS.start(options);
  },

  stopGPS() {
    Log('SampleModel:GPS: stop.');

    GPS.stop(this.gps.locating);
    this.gps.locating = null;
  },

  isGPSRunning() {
    return !!(this.gps.locating || this.gps.locating === 0);
  },
};

export { extension as default };
