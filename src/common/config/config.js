/** ****************************************************************************
 * Main app configuration file.
 **************************************************************************** */
import { Plugins, FilesystemDirectory } from '@capacitor/core';
import { isPlatform } from '@ionic/react';

const backendUrl =
  process.env.APP_BACKEND_URL || 'https://butterfly-monitoring.net';

const isTestEnv = process.env.NODE_ENV === 'test';

const config = {
  environment: process.env.NODE_ENV,
  version: process.env.APP_VERSION,
  build: process.env.APP_BUILD,

  log: !isTestEnv,

  sentryDNS: !isTestEnv && process.env.APP_SENTRY_KEY,

  feedbackEmail: 'apps%40ceh.ac.uk',

  DEFAULT_SURVEY_TIME: 15 * 60 * 1000, // 15 mins
  DEFAULT_TRANSECT_BUFFER: 10, // 5x2 meters

  map: {
    mapboxApiKey: process.env.APP_MAPBOX_MAP_KEY,
    mapboxSatelliteId: 'cehapps/cipqvo0c0000jcknge1z28ejp',
  },

  weatherSiteApiKey: process.env.APP_WEATHER_SITE_API_KEY,
  weatherSiteUrl: 'https://api.openweathermap.org/data/2.5/weather',

  backend: {
    url: backendUrl,
    apiKey: process.env.APP_INDICIA_API_KEY,
    websiteId: 118,
  },
};

(async function getMediaDirectory() {
  if (isPlatform('hybrid')) {
    const { uri } = await Plugins.Filesystem.getUri({
      path: '',
      directory: FilesystemDirectory.Data,
    });
    config.dataPath = uri;
  }
})();

export default config;
