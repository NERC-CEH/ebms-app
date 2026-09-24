import { when } from 'mobx';
import {
  dateFormatISO,
  device,
  getGeomWKT,
  isValidLocation,
  timeFormat,
  type Location,
} from '@flumens';
import config from 'common/config';
import appModel from 'common/models/app';
import { assignIfMissing } from 'common/models/utils';
import { fetchWeather } from 'common/services/openWeather';
import Occurrence, { DRAGONFLY_GROUP } from 'models/occurrence';
import Sample from 'models/sample';
import {
  Survey,
  appVersionAttr,
  windSpeedAttr,
  temperatureAttr,
  windDirectionAttr,
  taxonAttr,
  surveyStartTimeAttr,
  surveyEndTimeAttr,
  commentAttrOld,
  dateAttr,
  areaCountSchema,
  stageAttr,
  cloudAttr,
  dragonflyStageAttr,
  speciesGroupsAttr,
  commentAttr,
  type Submission,
} from 'Survey/common/config';

export { areaSizeAttr } from 'Survey/common/config';

type SubmissionLocation = Location & {
  shape: NonNullable<Location['shape']>;
};

const getSetWeather = (sample: Sample) => async () => {
  if (!device.isOnline) return;

  const weatherValues = await fetchWeather(sample.data.location!);

  assignIfMissing(sample, 'temperature', weatherValues.temperature);
  assignIfMissing(sample, 'windDirection', weatherValues.windDirection);
  assignIfMissing(sample, 'windSpeed', weatherValues.windSpeed);
  assignIfMissing(sample, 'cloud', weatherValues.cloud);
};

const survey: Survey = {
  id: 565,
  name: 'precise-area',
  label: 'common.minCount',
  webForm: 'mydata/samples/edit',

  attrs: {
    date: dateAttr,
    surveyStartTime: surveyStartTimeAttr,
    surveyEndTime: surveyEndTimeAttr,
    comment: commentAttrOld,
    temperature: temperatureAttr,
    cloud: cloudAttr,
    windDirection: windDirectionAttr,
    windSpeed: windSpeedAttr,
    recorders: {
      remote: { id: 688 },
    },
    speciesGroups: speciesGroupsAttr,

    location: {
      remote: {
        id: 'entered_sref',
        values(location: SubmissionLocation, submission: Submission) {
          const { accuracy, altitude, altitudeAccuracy } = location;
          submission.values = {
            ...submission.values,
            geom: getGeomWKT(location.shape),
          };

          submission.values['smpAttr:282'] = accuracy;
          submission.values['smpAttr:283'] = altitude;
          submission.values['smpAttr:284'] = altitudeAccuracy;

          return `${location.latitude.toFixed(7)}, ${location.longitude.toFixed(
            7
          )}`;
        },
      },
    },

    // backwards compatibility with old values, these can be removed in the future
    locationArea: { remote: { id: 723, isBackwardsCompatible: true } },
    group: {
      remote: {
        id: 'group_id',
        values: (val: { id?: string }) => val.id,
      },
    },
    site: {
      remote: {
        id: 'location_id',
        values: (site: { id?: string }) => site.id,
      },
    },
  },

  smp: {
    attrs: {
      location: {
        remote: {
          id: 'entered_sref',
          values(location: SubmissionLocation, submission: Submission) {
            const { accuracy, altitude, altitudeAccuracy } = location;

            submission.values['smpAttr:282'] = accuracy;
            submission.values['smpAttr:283'] = altitude;
            submission.values['smpAttr:284'] = altitudeAccuracy;

            if (!location.latitude) {
              return null; // if missing then sub-sample will be removed
            }

            return `${location.latitude.toFixed(
              7
            )}, ${location.longitude.toFixed(7)}`;
          },
        },
      },
      date: dateAttr,
    },

    create({ taxon, parent, surveyId, surveyName }) {
      const sample = new Sample({
        metadata: {
          surveyId: surveyId || survey.id,
          survey: surveyName || survey.name,
        },
        data: {
          surveyId: surveyId || survey.id,
          location: {},
        },
      });

      if (!taxon)
        throw new Error('Subsample create without Occurrence or taxon');

      const occurrence = survey.smp!.occ!.create!({ taxon });
      sample.occurrences.push(occurrence);

      if (parent) {
        const locks = parent.locks.getAll(taxon.taxonGroupId);
        Object.assign(sample.data, locks.smp);
        Object.assign(occurrence.data, locks.occ);
      }

      return sample;
    },

    modifySubmission(submission, model) {
      const parent = model.parent as Sample<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (parent.data?.group?.id) {
        submission.values.group_id = parent.data.group.id;
      }

      if (Number.isFinite(parent.data?.privacyPrecision)) {
        submission.values.privacy_precision = parent.data!.privacyPrecision;
      }

      return submission;
    },

    occ: {
      attrs: {
        taxon: taxonAttr,
        comment: { block: commentAttr },

        count: { remote: { id: 780 } },

        stage: stageAttr,
        dragonflyStage: dragonflyStageAttr,

        timeOfSighting: {
          remote: {
            id: 912,
          },
        },
      },

      create({ taxon }) {
        const isDragonfly = taxon.taxonGroupId === DRAGONFLY_GROUP;

        return new Occurrence({
          data: {
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

  verify: attrs => areaCountSchema.safeParse(attrs).error,

  create({ surveyId, surveyName, hasGPSPermission }) {
    const sample = new Sample({
      metadata: {
        surveyId: surveyId || survey.id,
        survey: surveyName || survey.name,
        pausedTime: 0,
      },
      data: {
        surveyId: surveyId || survey.id,
        date: dateFormatISO.format(new Date()),
        enteredSrefSystem: 4326,
        training: appModel.data.useTraining,
        groupId: appModel.data.defaultGroupId,
        inputForm: survey.webForm,
        [appVersionAttr.id]: config.version,
        speciesGroups: appModel.data.speciesGroups,
        location: {},
        temperature: '',
        windDirection: '',
        windSpeed: '',
        recorders: 1,
      },
    });

    if (!sample.isSingleSpeciesSurvey()) {
      const createdOnString = new Date(sample.createdAt).toISOString();
      sample.data.surveyStartTime = createdOnString; // this can't be done in defaults for single species survey
      sample.vibrate.start();

      // copy previous species groups and moth settings
      sample.data.speciesGroups = appModel.data.speciesGroups;
      sample.metadata.useDayFlyingMothsOnly =
        appModel.data.useDayFlyingMothsOnly;
    }

    // check if the timer is finished every second and if so then set the end time
    const timerInterval = setInterval(() => {
      if (
        !sample.isTimerFinished() ||
        !sample.data.surveyStartTime ||
        sample.data.surveyEndTime
      )
        return;

      clearInterval(timerInterval);

      sample.data.surveyEndTime = timeFormat.format(new Date());
      sample.save();
    }, 1000);

    if (hasGPSPermission) sample.gps.toggle();

    when(() => isValidLocation(sample.data.location), getSetWeather(sample));

    return sample;
  },
};

export default survey;
