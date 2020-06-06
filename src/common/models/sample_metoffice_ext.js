import Log from 'helpers/log';
import config from 'config';
import { observe } from 'mobx';
import * as Sentry from '@sentry/browser';

// TODO get values from config

const url = config.weatherSiteUrl;

function getCelsiusTemperature(fahrenheitFromService) {
  const fahrenheit = parseFloat(fahrenheitFromService);

  if (Number.isNaN(fahrenheit)) {
    return null;
  }

  return Math.round(((fahrenheit - 32) * 5) / 9);
}

const getWindDirection = degreesFromService => {
  const degrees = parseFloat(degreesFromService);

  if (Number.isNaN(degrees) || degrees > 360) {
    return null;
  }

  if (degrees < 45) {
    return 'N';
  }
  if (degrees < 45 * 2) {
    return 'NE';
  }
  if (degrees < 45 * 3) {
    return 'E';
  }
  if (degrees < 45 * 4) {
    return 'SE';
  }
  if (degrees < 45 * 5) {
    return 'S';
  }
  if (degrees < 45 * 6) {
    return 'SW';
  }
  if (degrees < 45 * 7) {
    return 'W';
  }

  return 'NW';
};

const getWindSpeed = speedFromService => {
  const speed = parseFloat(speedFromService);

  if (Number.isNaN(speed)) {
    return null;
  }

  if (speed < 1) {
    return 'Smoke rises vertically';
  }
  if (speed <= 3) {
    return 'Slight smoke drift';
  }
  if (speed <= 7) {
    return 'Wind felt on face, leaves rustle';
  }
  if (speed <= 12) {
    return 'Leaves and twigs in slight motion';
  }
  if (speed <= 18) {
    return 'Dust raised and small branches move';
  }
  if (speed <= 24) {
    return 'Small trees in leaf begin to sway';
  }

  return 'Large branches move and trees sway';
};

const getCloud = cloudFromService => {
  const cloud = parseFloat(cloudFromService);

  if (Number.isNaN(cloud)) {
    return null;
  }

  return Math.round(cloud);
};

const fetchWeatherData = ({ latitude, longitude }) => {
  return fetch(
    `${url}?lat=${latitude}&lon=${longitude}&units=Imperial&appid=${config.weatherSiteApiKey}`
  ).then(response => response.json());
};

const normaliseResponseValues = ({ main, wind, clouds }) => ({
  temperature: getCelsiusTemperature((main || {}).temp),
  windSpeed: getWindSpeed((wind || {}).speed),
  windDirection: getWindDirection((wind || {}).deg),
  clouds: getCloud((clouds || {}).all),
});

function setNewWeatherValues(sample, newWeatherValues) {
  if (!sample.attrs.temperature && newWeatherValues.temperature) {
    sample.attrs.temperature = newWeatherValues.temperature; // eslint-disable-line
  }
  if (!sample.attrs.windDirection && newWeatherValues.windDirection) {
    sample.attrs.windDirection = newWeatherValues.windDirection; // eslint-disable-line
  }
  if (!sample.attrs.windSpeed && newWeatherValues.windSpeed) {
    sample.attrs.windSpeed = newWeatherValues.windSpeed; // eslint-disable-line
  }
  if (!sample.attrs.cloud && newWeatherValues.clouds) {
    sample.attrs.cloud = newWeatherValues.clouds; // eslint-disable-line
  }

  sample.save();
}

const extension = {
  startMetOfficePull() {
    Log('SampleModel:MetOffice: start.');

    let stopLocationObserver;

    const observeLocation = async ({ newValue }) => {
      if (!newValue || !newValue.longitude) {
        return;
      }

      try {
        stopLocationObserver();

        const response = await fetchWeatherData(newValue);

        const weatherValues = normaliseResponseValues(response);

        setNewWeatherValues(this, weatherValues);
      } catch (err) {
        Sentry.captureException(err);
      }
    };

    stopLocationObserver = observe(this.attrs, 'location', observeLocation);
  },
};

export { extension as default };
