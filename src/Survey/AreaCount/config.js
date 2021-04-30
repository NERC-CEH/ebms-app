import { isPlatform } from '@ionic/react';
import config from 'config';
import appModel from 'appModel';
import Wkt from 'wicket';
import { toJS } from 'mobx';
import L from 'leaflet';
import * as Yup from 'yup';
import {
  deviceAttr,
  deviceVersionAttr,
  appVersionAttr,
  windSpeedAttr,
  temperatureAttr,
  windDirectionAttr,
  cloudAttr,
  taxonAttr,
  surveyStartTimeAttr,
  surveyEndTimeAttr,
  commentAttr,
  dateAttr,
} from 'Survey/common/config';

const locationSchema = Yup.object().shape({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
  area: Yup.number().max(20000000, 'Please select a smaller area.').required(),
  shape: Yup.object().required(),
  source: Yup.string().required('Please add survey area information.'),
});

const areaCountSchema = Yup.object().shape({
  location: Yup.mixed().test(
    'area',
    'Please add survey area information.',
    val => {
      if (!val) {
        return false;
      }
      locationSchema.validateSync(val);
      return true;
    }
  ),

  surveyStartTime: Yup.date().required('Date is missing'),
  location_type: Yup.string()
    .matches(/latlon/)
    .required('Location type is missing'),
});

function transformToMeters(coordinates) {
  return coordinates.map(([lng, lat]) => {
    const { x, y } = L.Projection.SphericalMercator.project({ lat, lng });
    return [x, y];
  });
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

const stageValues = [
  { value: null, isDefault: true, label: 'Not Recorded' },
  { value: 'Adults', id: 3929 },
  { value: 'Larvae', id: 3931 },
  { value: 'Eggs', id: 3932 },
  { value: 'Pupae', id: 3930 },
  { value: 'Larval webs', id: 14079 },
];

const survey = {
  id: 565,
  name: 'area',
  label: '15min Count',
  webForm: 'enter-app-record',

  attrs: {
    device: deviceAttr,
    device_version: deviceVersionAttr,
    app_version: appVersionAttr,
    date: dateAttr,
    surveyStartTime: surveyStartTimeAttr,
    surveyEndime: surveyEndTimeAttr,
    comment: commentAttr,
    temperature: temperatureAttr,
    cloud: cloudAttr,
    windDirection: windDirectionAttr,
    windSpeed: windSpeedAttr,

    location: {
      remote: {
        id: 'entered_sref',
        values(location, submission) {
          const areaId = survey.attrs.area.remote.id;

          // eslint-disable-next-line
          submission.fields = {
            ...submission.fields,
            [areaId]: location.area,
            geom: getGeomString(location.shape),
          };

          return `${parseFloat(location.latitude).toFixed(7)}, ${parseFloat(
            location.longitude
          ).toFixed(7)}`;
        },
      },
    },

    area: { remote: { id: 723 } },
  },

  occ: {
    attrs: {
      taxon: taxonAttr,
      comment: commentAttr,

      count: { remote: { id: 780 } },
      stage: {
        pageProps: {
          attrProps: {
            input: 'radio',
            inputProps: { options: stageValues },
          },
        },
        remote: { id: 293, values: stageValues },
      },
    },

    create(Occurrence, attrs) {
      return new Occurrence({
        attrs: {
          count: 1,
          comment: null,
          stage: null,
          taxon: {
            scientific_name: null,
            warehouse_id: null,
          },
          ...attrs,
        },
      });
    },

    modifySubmission(submission, occ) {
      if (!occ.attrs.count) {
        return [];
      }

      if (!submission[0].survey_id) {
        // backwards compatible
        submission[0].survey_id = survey.id; //eslint-disable-line
      }

      return submission;
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
    const training = appModel.attrs.useTraining ? 't' : 'f';

    const sample = new Sample({
      metadata: {
        // survey_id: survey.id,
        survey: survey.name,
        pausedTime: 0,
      },
      attrs: {
        input_form: survey.webForm,
        device: isPlatform('android') ? 'android' : 'ios',
        app_version: config.version,
        training,

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

  modifySubmission(submission) {
    if (!submission[0].survey_id) {
      // backwards compatible
      submission[0].survey_id = survey.id; //eslint-disable-line
    }

    return submission;
  },
};

export default survey;
