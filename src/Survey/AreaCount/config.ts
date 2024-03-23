import { toJS, when } from 'mobx';
import wkt from 'wellknown';
import { device, isValidLocation } from '@flumens';
import { isPlatform } from '@ionic/react';
import SphericalMercator from '@mapbox/sphericalmercator';
import config from 'common/config';
import appModel from 'common/models/app';
import { assignIfMissing } from 'common/models/utils';
import { fetchWeather } from 'common/services/openWeather';
import { DRAGONFLY_GROUP } from 'models/occurrence';
import AppSample from 'models/sample';
import {
  Survey,
  deviceAttr,
  deviceVersionAttr,
  appVersionAttr,
  windSpeedAttr,
  temperatureAttr,
  windDirectionAttr,
  sunAttr,
  taxonAttr,
  surveyStartTimeAttr,
  surveyEndTimeAttr,
  commentAttr,
  dateAttr,
  areaCountSchema,
  stageAttr,
  cloudAttr,
  dragonflyStageAttr,
  speciesGroupsAttr,
} from 'Survey/common/config';

const locationAttrs = {
  locationArea: { remote: { id: 723 } },
  locationAccuracy: { remote: { id: 282 } },
  locationAltitude: { remote: { id: 283 } },
  locationAltitudeAccuracy: { remote: { id: 284 } },
};

const merc = new SphericalMercator();

function transformToMeters(coordinates: any) {
  const transform = ([lat, lng]: any) => merc.forward([lat, lng]);
  return coordinates.map(transform);
}

function getGeomString(shape: any) {
  const geoJSON = toJS(shape);
  if (geoJSON.type === 'Polygon') {
    geoJSON.coordinates[0] = transformToMeters(geoJSON.coordinates[0]);
  } else {
    geoJSON.coordinates = transformToMeters(geoJSON.coordinates);
  }

  return wkt.stringify(geoJSON);
}

const getSetWeather = (sample: AppSample) => async () => {
  if (!device.isOnline) return;

  const weatherValues = await fetchWeather(sample.attrs.location);

  assignIfMissing(sample, 'temperature', weatherValues.temperature);
  assignIfMissing(sample, 'windDirection', weatherValues.windDirection);
  assignIfMissing(sample, 'windSpeed', weatherValues.windSpeed);
  assignIfMissing(sample, 'cloud', weatherValues.cloud);
};

const survey: Survey = {
  id: 565,
  name: 'precise-area',
  label: '15min Count',
  webForm: 'mydata/samples/edit',

  attrs: {
    device: deviceAttr,
    device_version: deviceVersionAttr,
    app_version: appVersionAttr,
    date: dateAttr,
    surveyStartTime: surveyStartTimeAttr,
    surveyEndTime: surveyEndTimeAttr,
    comment: commentAttr,
    temperature: temperatureAttr,
    cloud: cloudAttr,
    sun: sunAttr, // TODO: backwards compatible, remove in the future
    windDirection: windDirectionAttr,
    windSpeed: windSpeedAttr,
    recorders: {
      remote: { id: 688 },
    },
    speciesGroups: speciesGroupsAttr,

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
    ...locationAttrs,

    project: {
      remote: {
        id: 'group_id',
        values: (val: any) => val.id,
      },
    },
  },

  metadata: {
    speciesGroups: speciesGroupsAttr,
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
      ...locationAttrs,
      date: dateAttr,
    },

    create({ Sample, Occurrence, taxon, surveyId, surveyName }) {
      const sample = new Sample({
        metadata: {
          survey_id: surveyId || survey.id,
          survey: surveyName || survey.name,
        },
        attrs: {
          location: {},
        },
      });

      if (!Occurrence || !taxon)
        throw new Error('Subsample create without Occurrence or taxon');

      const occurrence = survey.smp!.occ!.create!({ Occurrence, taxon });
      sample.occurrences.push(occurrence);

      return sample;
    },

    modifySubmission(submission, model) {
      if (model.parent.attrs.project?.id) {
        // eslint-disable-next-line
        submission.values.group_id = model.parent.attrs.project.id;
      }

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

        stage: stageAttr,
        dragonflyStage: dragonflyStageAttr,

        timeOfSighting: {
          remote: {
            id: 912,
          },
        },
      },

      create({ Occurrence, taxon }) {
        const isDragonfly = taxon.group === DRAGONFLY_GROUP;

        return new Occurrence({
          attrs: {
            comment: null,
            stage: !isDragonfly ? 'Adult' : undefined,
            dragonflyStage: isDragonfly ? 'Adult' : undefined,
            taxon,
            count: 1,
            timeOfSighting: new Date().toISOString(),
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

  create({ Sample, surveyId, surveyName, hasGPSPermission }) {
    const sample = new Sample({
      metadata: {
        survey_id: surveyId || survey.id,
        survey: surveyName || survey.name,
        pausedTime: 0,
        speciesGroups: [],
      },
      attrs: {
        training: appModel.attrs.useTraining,
        project: appModel.attrs.defaultProject,
        input_form: survey.webForm,
        device: isPlatform('android') ? 'android' : 'ios',
        app_version: config.version,
        speciesGroups: [],
        surveyStartTime: null,
        location: {},
        temperature: '',
        windDirection: '',
        windSpeed: '',
        recorders: 1,
      },
    });

    if (!sample.isPreciseSingleSpeciesSurvey()) {
      const createdOnString = new Date(sample.metadata.createdOn).toISOString();
      sample.attrs.surveyStartTime = createdOnString; // this can't be done in defaults
      sample.startVibrateCounter();
    }

    if (hasGPSPermission) sample.toggleGPStracking();

    when(() => isValidLocation(sample.attrs.location), getSetWeather(sample));

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

    const removeSubSamplesLayerIfNoLocation = (subSample: any) => {
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
