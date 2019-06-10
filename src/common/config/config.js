/** ****************************************************************************
 * Main app configuration file.
 **************************************************************************** */
import Indicia from 'indicia';
import DateHelp from 'helpers/date';

const HOST =
  process.env.APP_INDICIA_API_HOST || 'http://www.butterfly-monitoring.net/';

const CONFIG = {
  // variables replaced on build
  version: process.env.APP_VERSION,
  build: process.env.APP_BUILD,
  name: process.env.APP_NAME,

  environment: __ENV__,
  experiments: process.env.APP_EXPERIMENTS,
  training: process.env.APP_TRAINING,

  gps_accuracy_limit: 100,

  site_url: HOST,

  // use prod logging if testing otherwise full log
  log: !__TEST__,

  // google analytics
  ga: {
    id: !__TEST__ && process.env.APP_GA,
  },

  // error analytics
  sentry: {
    key: !__TEST__ && process.env.APP_SENTRY_KEY,
    project: '1448211',
  },

  users: {
    url: `${HOST + Indicia.API_BASE + Indicia.API_VER}/users/`,
    timeout: 80000,
  },

  reports: {
    url: `${HOST +
      Indicia.API_BASE +
      Indicia.API_VER +
      Indicia.API_REPORTS_PATH}`,
    timeout: 80000,
  },

  // mapping
  map: {
    mapbox_api_key: process.env.APP_MAPBOX_MAP_KEY,
    mapbox_osm_id: 'cehapps.0fenl1fe',
    mapbox_satellite_id: 'cehapps.0femh3mh',
  },

  // indicia configuration
  indicia: {
    host: HOST,
    api_key: process.env.APP_INDICIA_API_KEY,
    website_id: 120,
    id: 291,
    webForm: 'enter-app-record',
    attrs: {
      smp: {
        location: {
          values(location) {
            return `${parseFloat(location.latitude).toFixed(7)}, ${parseFloat(
              location.longitude
            ).toFixed(7)}`;
          },
        },
        device: {
          id: 829,
          values: {
            iOS: 14317,
            Android: 14318,
          },
        },
        device_version: { id: 836 },
        app_version: { id: 934 },

        date: {
          values(date) {
            return DateHelp.print(date);
          },
          isValid: val => val && val.toString() !== 'Invalid Date',
          type: 'date',
          max: () => new Date(),
        },

        customSurveyStartTime: { id: 30 },
        customSurveyEndime: { id: 31 },

        area: { id: 933 },
      },
      occ: {
        training: {
          id: 'training',
        },

        taxon: {
          values(taxon) {
            return taxon.warehouse_id;
          },
        },
      },
    },
  },
};

export default CONFIG;
