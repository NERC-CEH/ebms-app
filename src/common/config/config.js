/** ****************************************************************************
 * Main app configuration file.
 **************************************************************************** */
import Indicia from 'indicia';
import DateHelp from 'helpers/date';
import Wkt from 'wicket';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

const HOST =
  process.env.APP_INDICIA_API_HOST || 'https://butterfly-monitoring.net/';

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

  DEFAULT_SURVEY_TIME: 15 * 60 * 1000, // 15 mins
  DEFAULT_TRANSECT_BUFFER: 10, // 5x2 meters

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
          values(location, submission) {
            // area
            const wkt = new Wkt.Wkt(location.shape);
            // eslint-disable-next-line
            submission.fields = {
              ...submission.fields,
              ...{
                [CONFIG.indicia.attrs.smp.area.id]: location.area,
                geom: wkt.write(),
              },
            };

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

        surveyStartTime: {
          id: 30,
          values: date => dateTimeFormat.format(new Date(date)),
        },
        surveyEndime: {
          id: 31,
          values: date => dateTimeFormat.format(new Date(date)),
        },

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
        count: { id: 7 },
      },
    },
  },
};

export default CONFIG;
