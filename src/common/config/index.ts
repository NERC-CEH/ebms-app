/** ****************************************************************************
 * Main app configuration file.
 **************************************************************************** */
import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';
import { isPlatform } from '@ionic/react';

const backendUrl =
  process.env.APP_BACKEND_URL || 'https://butterfly-monitoring.net';

const indiciaUrl =
  process.env.APP_BACKEND_INDICIA_URL || 'https://warehouse1.indicia.org.uk';

const config = {
  dataPath: '',

  environment: process.env.NODE_ENV as string,
  version: process.env.APP_VERSION as string,
  build: process.env.APP_BUILD as string,

  // AI classifier
  classifierID: 20098,

  sentryDSN: process.env.APP_SENTRY_KEY as string,

  feedbackEmail: 'apps%40ceh.ac.uk',

  DEFAULT_SURVEY_TIME: 15 * 60 * 1000, // 15 mins
  DEFAULT_TRANSECT_BUFFER: 5, // 2.5x2 meters

  map: {
    mapboxApiKey: process.env.APP_MAPBOX_MAP_KEY as string,
  },

  weatherSiteApiKey: process.env.APP_WEATHER_SITE_API_KEY as string,
  weatherSiteUrl: 'https://api.openweathermap.org',

  backend: {
    url: backendUrl,
    websiteId: 118,
    clientId: process.env.APP_BACKEND_CLIENT_ID as string,
    clientPass: process.env.APP_BACKEND_CLIENT_PASS as string,

    occurrenceServiceURL: `${indiciaUrl}/index.php/services/rest/es-occurrences/_search`,
    sampleServiceURL: `${indiciaUrl}/index.php/services/rest/es-samples/_search`,

    mediaUrl: `${indiciaUrl}/upload/`,

    indicia: {
      url: indiciaUrl,
    },
  },
};

(async function getMediaDirectory() {
  if (isPlatform('hybrid')) {
    const { uri } = await Filesystem.getUri({
      path: '',
      directory: FilesystemDirectory.Data,
    });
    config.dataPath = uri;
  }
})();

export default config;
