import { chatboxOutline } from 'ionicons/icons';
import { z } from 'zod';
import config from 'common/config';
import Sample from 'common/models/sample';
import appModel from 'models/app';
import Occurrence, { DRAGONFLY_GROUP } from 'models/occurrence';
import userModel from 'models/user';
import {
  Survey,
  appVersionAttr,
  windSpeedAttr,
  temperatureAttr,
  windDirectionAttr,
  taxonAttr,
  surveyStartTimeAttr,
  surveyEndTimeAttr,
  commentAttr,
  dateAttr,
  stageAttr,
  dragonflyStageAttr,
  cloudAttr,
} from 'Survey/common/config';

const reliabilityValues = [
  { value: 'Suitable conditions', id: 16590 },
  { value: 'Unsuitable conditions', id: 16591 },
  { value: 'Unable to survey', id: 16592 },
];

const survey: Survey = {
  id: 562,
  name: 'transect',
  label: 'eBMS Transect',
  webForm: 'ebms-input-data',
  attrs: {
    date: dateAttr,
    surveyStartTime: surveyStartTimeAttr,
    surveyEndTime: surveyEndTimeAttr,
    cloud: cloudAttr,
    temperature: temperatureAttr,
    windDirection: windDirectionAttr,
    windSpeed: windSpeedAttr,
    comment: commentAttr,

    recorder: {
      pageProps: {
        attrProps: {
          input: 'text',
          info: 'Please specify the person responsible for identifying the species.',
        },
      },
      remote: { id: 1384 },
    },
  },

  smp: {
    attrs: {
      date: dateAttr,
      comment: {
        menuProps: { icon: chatboxOutline, skipValueTranslation: true },
        pageProps: {
          attrProps: {
            input: 'textarea',
            info: 'Please add any extra info about this section.',
          },
        },
      },
      reliability: {
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please specify the reliability of the section count.',
            inputProps: { options: reliabilityValues },
          },
        },
        remote: { id: 1393, values: reliabilityValues },
      },
    },

    occ: {
      attrs: {
        count: {
          remote: {
            id: 780,
          },
        },
        comment: commentAttr,
        stage: stageAttr,
        dragonflyStage: dragonflyStageAttr,
        taxon: taxonAttr,
      },

      create({ taxon }) {
        const isDragonfly = taxon.taxonGroupId === DRAGONFLY_GROUP;

        return new Occurrence({
          data: {
            count: 1,
            stage: !isDragonfly ? 'Adult' : undefined,
            dragonflyStage: isDragonfly ? 'Adult' : undefined,
            comment: null,
            taxon,
          },
        });
      },

      verify: attrs =>
        z
          .object({
            count: z.number({ error: 'Count cannot be empty' }),
          })
          .safeParse(attrs).error,
    },

    create({ location }) {
      const sample = new Sample({
        metadata: { survey: survey.name },
        data: {
          surveyId: survey.id,
          sampleMethodId: 776,
          enteredSref: location?.data.centroidSref,
          enteredSrefSystem: location?.data.centroidSrefSystem,
          locationId: location!.id,
          comment: null,
          reliability: 'Suitable conditions',
        },
      });

      return sample;
    },

    verify: attrs =>
      z
        .object({
          reliability: z.string({
            error: 'Reliability cannot be empty.',
          }),
        })
        .safeParse(attrs).error,
  },

  verify: attrs =>
    z
      .object({
        locationId: z.string({ error: 'Please select your transect.' }),
        recorder: z.string({ error: 'Recorder info is missing' }),
        surveyStartTime: z.string({ error: 'Start time is missing' }),
        // surveyEndTime: // automatically set on send
        temperature: z.number({
          error: 'Temperature info is missing',
        }),
        windSpeed: z.string({ error: 'Wind speed info is missing' }),
      })
      .safeParse(attrs).error,

  create() {
    const recorder = `${userModel.data.firstName} ${userModel.data.lastName}`;
    const now = new Date().toISOString();

    const sample = new Sample({
      metadata: { survey: survey.name },
      data: {
        surveyId: survey.id,
        date: now,
        training: appModel.data.useTraining,
        sampleMethodId: 22,
        surveyStartTime: now,
        recorder,
        [appVersionAttr.id]: config.version,
      },
    });

    return sample;
  },
};

export default survey;
