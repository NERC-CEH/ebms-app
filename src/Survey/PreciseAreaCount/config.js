import { date as dateHelp } from '@apps';
import { chatboxOutline } from 'ionicons/icons';
import Wkt from 'wicket';
import { toJS } from 'mobx';
import L from 'leaflet';
import * as Yup from 'yup';

const locationSchema = Yup.object().shape({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
  area: Yup.number().max(20000000, 'Please select a smaller area.').required(),
  shape: Yup.object().required(),
  source: Yup.string().required('Please add survey area information.'),
});

const validateLocation = val => {
  if (!val) {
    return false;
  }

  locationSchema.validateSync(val);
  return true;
};

const areaCountSchema = Yup.object().shape({
  location: Yup.mixed().test(
    'area',
    'Please add survey area information.',
    validateLocation
  ),

  surveyStartTime: Yup.date().required('Date is missing'),
  location_type: Yup.string()
    .matches(/latlon/)
    .required('Location type is missing'),
});

function transformToMeters(coordinates) {
  const transform = ([lng, lat]) => {
    const { x, y } = L.Projection.SphericalMercator.project({ lat, lng });
    return [x, y];
  };
  return coordinates.map(transform);
}
function getGeomString(shape) {
  const geoJSON = toJS(shape);
  if (geoJSON.type === 'Polygon') {
    geoJSON.coordinates[0] = transformToMeters(geoJSON.coordinates[0]);
  } else {
    geoJSON.coordinates = transformToMeters(geoJSON.coordinates);
  }

  const wkt = new Wkt.Wkt(geoJSON);
  return wkt.write();
}

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

const dateAttr = {
  values(date) {
    return dateHelp.print(date);
  },
  isValid: val => val && val.toString() !== 'Invalid Date',
  type: 'date',
  max: () => new Date(),
};

const config = {
  id: 565,
  name: 'precise-area',
  label: 'Precise 15min Count',
  webForm: 'enter-app-record',
  attrs: {
    location: {
      id: 'entered_sref',
      values(location, submission) {
        const areaId = config.attrs.area.id;

        const geomAndArea = {
          [areaId]: location.area,
          geom: getGeomString(location.shape),
        };

        // eslint-disable-next-line
        submission.fields = {
          ...submission.fields,
          ...geomAndArea,
        };

        return `${parseFloat(location.latitude).toFixed(7)}, ${parseFloat(
          location.longitude
        ).toFixed(7)}`;
      },
    },
    device: {
      id: 922,
      values: {
        iOS: 2398,
        Android: 2399,
      },
    },
    device_version: { id: 759 },
    app_version: { id: 1139 },

    date: dateAttr,

    surveyStartTime: {
      id: 1385,
      values: date => dateTimeFormat.format(new Date(date)),
    },
    surveyEndime: {
      id: 1386,
      values: date => dateTimeFormat.format(new Date(date)),
    },

    area: { id: 723 },

    comment: {
      label: 'Comment',
      type: 'textarea',
      info: 'Please add any extra info about this record.',
    },
    temperature: {
      id: 1388,
      label: 'Temperature',
      type: 'radio',
      info: 'Please specify the temperature C°.',
      values: [
        {
          value: '',
          label: 'Not recorded/no data',
          id: 16556,
          isDefault: true,
        },
        { value: 10, id: 16530 },
        { value: 11, id: 16531 },
        { value: 12, id: 16532 },
        { value: 13, id: 16533 },
        { value: 14, id: 16534 },
        { value: 15, id: 16535 },
        { value: 16, id: 16536 },
        { value: 17, id: 16537 },
        { value: 18, id: 16538 },
        { value: 19, id: 16539 },
        { value: 20, id: 16540 },
        { value: 21, id: 16541 },
        { value: 22, id: 16542 },
        { value: 23, id: 16543 },
        { value: 24, id: 16544 },
        { value: 25, id: 16545 },
        { value: 26, id: 16546 },
        { value: 27, id: 16547 },
        { value: 28, id: 16548 },
        { value: 29, id: 16549 },
        { value: 30, id: 16550 },
        { value: 31, id: 16551 },
        { value: 32, id: 16552 },
        { value: 33, id: 16553 },
        { value: 34, id: 16554 },
        { value: 35, id: 16555 },
      ],
    },
    cloud: {
      id: 1457,
      label: 'Cloud',
      type: 'slider',
      info: 'Please specify the % of cloud cover.',
      max: 100,
      min: 0,
    },
    windDirection: {
      id: 1389,
      label: 'Wind Direction',
      type: 'radio',
      info: 'Please specify the wind direction.',
      values: [
        { value: '', label: 'Not recorded/no data', id: 2460, isDefault: true },
        { value: 'S', id: 2461 },
        { value: 'SW', id: 2462 },
        { value: 'W', id: 2463 },
        { value: 'NW', id: 2464 },
        { value: 'N', id: 2465 },
        { value: 'NE', id: 2466 },
        { value: 'E', id: 2467 },
        { value: 'SE', id: 2468 },
        { value: 'No direction', id: 2469 },
      ],
    },
    windSpeed: {
      id: 1390,
      label: 'Wind Speed',
      type: 'radio',
      info: 'Please specify the wind speed.',
      values: [
        { value: '', label: 'Not recorded/no data', id: 2459, isDefault: true },
        { value: 'Smoke rises vertically', id: 2606 },
        { value: 'Slight smoke drift', id: 2453 },
        { value: 'Wind felt on face, leaves rustle', id: 2454 },
        { value: 'Leaves and twigs in slight motion', id: 2455 },
        { value: 'Dust raised and small branches move', id: 2456 },
        { value: 'Small trees in leaf begin to sway', id: 2457 },
        { value: 'Large branches move and trees sway', id: 2458 },
      ],
    },
  },

  smp: {
    attrs: {
      location: {
        id: 'entered_sref',
        values(location) {
          return `${parseFloat(location.latitude).toFixed(7)}, ${parseFloat(
            location.longitude
          ).toFixed(7)}`;
        },
      },
      date: dateAttr,
    },

    create(Sample, Occurrence, taxon) {
      const sample = new Sample({
        metadata: {
          survey: config.name,
        },
        attrs: { location: {} },
      });

      const occurrence = config.smp.occ.create(Occurrence, taxon);
      sample.occurrences.push(occurrence);

      sample.startGPS();

      return sample;
    },

    verify(attrs) {
      try {
        Yup.object()
          .shape({
            location: Yup.mixed().test(
              'area',
              'Please add location information.',
              val => !(!val || !val.latitude)
            ),
          })
          .validateSync(attrs, { abortEarly: false });
      } catch (attrError) {
        return attrError;
      }

      return null;
    },

    occ: {
      attrs: {
        training: {
          id: 'training',
        },

        taxon: {
          id: 'taxa_taxon_list_id',
          values(taxon) {
            return taxon.warehouse_id;
          },
        },
        count: { id: 780 },
        stage: {
          id: 293,
          label: 'Stage',
          type: 'radio',

          values: [
            { value: null, isDefault: true, label: 'Not Recorded' },
            { value: 'Adult', id: 3929 },
            { value: 'Larva', id: 3931 },
            { value: 'Egg', id: 3932 },
            { value: 'Pupae', id: 3930 },
            { value: 'Larval web', id: 14079 },
          ],
        },
        comment: {
          label: 'Comment',
          id: 'comment',
          icon: chatboxOutline,
          type: 'textarea',
          info: 'Please add any extra information about your survey.',
          skipValueTranslation: true,
        },
      },

      create(Occurrence, taxon) {
        return new Occurrence({
          attrs: {
            comment: null,
            stage: 'Adult',
            taxon,
          },
        });
      },
    },
  },

  verify(attrs) {
    try {
      areaCountSchema.validateSync(attrs, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  create(Sample) {
    const sample = new Sample({
      metadata: {
        survey: config.name,
        pausedTime: 0,
      },
      attrs: {
        surveyStartTime: null,
        location: {},
        temperature: '',
        windDirection: '',
        windSpeed: '',
      },
    });
    sample.attrs.surveyStartTime = sample.metadata.created_on; // this can't be done in defaults
    sample.toggleGPStracking();
    sample.startVibrateCounter();
    sample.startMetOfficePull();

    return sample;
  },
};

export default config;
