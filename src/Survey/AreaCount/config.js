import { isPlatform } from '@ionic/react';
import config from 'config';
import Wkt from 'wicket';
import { toJS } from 'mobx';
import L from 'leaflet';
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
  areaCountSchema,
} from 'Survey/common/config';

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

const stageValues = [
  { value: null, isDefault: true, label: 'Not Recorded' },
  { value: 'Adult', id: 3929 },
  { value: 'Egg', id: 3932 },
  { value: 'Larva', id: 3931 },
  { value: 'Larval web', id: 14079 },
  { value: 'Pupa', id: 3930 },
];

const survey = {
  id: 565,
  name: 'precise-area',
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
          const { accuracy, altitude, altitudeAccuracy } = location;

          // eslint-disable-next-line
          submission.values = {
            ...submission.values,
            geom: getGeomString(location.shape),
          };

          submission.values['smpAttr:282'] = accuracy; // eslint-disable-line
          submission.values['smpAttr:283'] = altitude; // eslint-disable-line
          submission.values['smpAttr:284'] = altitudeAccuracy; // eslint-disable-line
          submission.values['smpAttr:723'] = location.area; // eslint-disable-line

          return `${parseFloat(location.latitude).toFixed(7)}, ${parseFloat(
            location.longitude
          ).toFixed(7)}`;
        },
      },
    },
  },

  smp: {
    attrs: {
      location: {
        remote: {
          id: 'entered_sref',
          values(location, submission) {
            const { accuracy, altitude, altitudeAccuracy } = location;

            submission.values['smpAttr:282'] = accuracy; // eslint-disable-line
            submission.values['smpAttr:283'] = altitude; // eslint-disable-line
            submission.values['smpAttr:284'] = altitudeAccuracy; // eslint-disable-line

            if (!location.latitude) {
              return null; // if missing then sub-sample will be removed
            }

            return `${parseFloat(location.latitude).toFixed(7)}, ${parseFloat(
              location.longitude
            ).toFixed(7)}`;
          },
        },
      },
      date: dateAttr,
    },

    create(
      AppSample,
      Occurrence,
      taxon,
      _,
      surveyId = survey.id,
      surveyName = survey.name
    ) {
      const sample = new AppSample({
        metadata: {
          survey_id: surveyId,
          survey: surveyName,
        },
        attrs: {
          location: {},
        },
      });

      if (!sample.metadata.survey_id) {
        // TODO: remove this once it is known why this isn't set
        console.error(
          `Creating subsample had no survey_id so we are setting it to ${survey.id}`
        );
        sample.metadata.survey_id = survey.id; // eslint-disable-line
      }

      const occurrence = survey.smp.occ.create(Occurrence, taxon);
      sample.occurrences.push(occurrence);

      return sample;
    },

    modifySubmission(submission) {
      if (!submission.values.survey_id) {
        // TODO: remove this once it is known why this isn't set
        console.error(
          `Submission subsample had no survey_id so we are setting it to ${survey.id}`
        );
        submission.values.survey_id = survey.id; // eslint-disable-line
      }

      return submission;
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
              info: 'Pick the life stage',
              inputProps: { options: stageValues },
            },
          },
          remote: { id: 293, values: stageValues },
        },
      },

      create(Occurrence, taxon) {
        return new Occurrence({
          attrs: {
            comment: null,
            stage: 'Adult',
            taxon,
            count: 1,
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

  create(AppSample, surveyId = survey.id, surveyName = survey.name) {
    const sample = new AppSample({
      metadata: {
        survey_id: surveyId,
        survey: surveyName,
        pausedTime: 0,
      },
      attrs: {
        input_form: survey.webForm,
        device: isPlatform('android') ? 'android' : 'ios',
        app_version: config.version,

        surveyStartTime: null,
        location: {},
        temperature: '',
        windDirection: '',
        windSpeed: '',
      },
    });

    if (!sample.metadata.survey_id) {
      // TODO: remove this once it is known why this isn't set
      console.error(
        `Creating sample had no survey_id so we are setting it to ${survey.id}`
      );
      sample.metadata.survey_id = survey.id; // eslint-disable-line
    }

    sample.attrs.surveyStartTime = sample.metadata.created_on; // this can't be done in defaults
    sample.toggleGPStracking();
    sample.startVibrateCounter();
    sample.startMetOfficePull();

    return sample;
  },

  modifySubmission(submission) {
    const subSamples = submission.samples;
    submission.samples = []; // eslint-disable-line
    if (!submission.values.survey_id) {
      // TODO: remove this once it is known why this isn't set
      console.error(
        `Submission top sample had no survey_id so we are setting it to ${survey.id}`
      );
      submission.values.survey_id = survey.id; // eslint-disable-line
    }

    const removeSubSamplesLayerIfNoLocation = subSample => {
      const locationIsMissing = !subSample.values.entered_sref;
      if (locationIsMissing) {
        submission.occurrences.push(subSample.occurrences[0]);
        return;
      }
      submission.samples.push(subSample);
    };

    subSamples.forEach(removeSubSamplesLayerIfNoLocation);

    return submission;
  },
};

export default survey;
