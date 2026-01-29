import { chatboxOutline } from 'ionicons/icons';
import { z } from 'zod';
import appModel from 'models/app';
import { DRAGONFLY_GROUP } from 'models/occurrence';
import userModel from 'models/user';
import {
  Survey,
  deviceAttr,
  deviceVersionAttr,
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

const locationAttr = {
  remote: {
    id: 'location_id',
    values(location: any, submission: any) {
      // eslint-disable-next-line
      submission.values = {
        ...submission.values,
        ...{
          entered_sref_system:
            location.centroidSrefSystem ||
            // Backwards compatible
            location.sref_system,
          entered_sref:
            location.centroidSref ||
            // Backwards compatible
            location.centroid_sref,
        },
      };

      return location.id;
    },
  },
};

const config: Survey = {
  id: 562,
  name: 'transect',
  label: 'eBMS Transect',
  webForm: 'ebms-input-data',
  attrs: {
    date: dateAttr,
    location: locationAttr,
    device: deviceAttr,
    device_version: deviceVersionAttr,
    app_version: appVersionAttr,
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
      location: locationAttr,
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

      create({ Occurrence, taxon }) {
        const isDragonfly = taxon.group === DRAGONFLY_GROUP;

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

    create({ Sample, location }) {
      const sample = new Sample({
        metadata: {
          survey: config.name,
          survey_id: config.id,
        },
        data: {
          surveyId: config.id,
          sampleMethodId: 776,
          location,
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
        location: z.object(
          {
            id: z.string(),
            // TODO: enable once all the old samples are uploaded
            // centroidSref: z.string().required(),
            // srefSystem: z.string().required(),
          },
          { error: 'Please select your transect.' }
        ),
        recorder: z.string({ error: 'Recorder info is missing' }),
        surveyStartTime: z.string({ error: 'Start time is missing' }),
        // surveyEndTime: // automatically set on send
        temperature: z.number({
          error: 'Temperature info is missing',
        }),
        windSpeed: z.string({ error: 'Wind speed info is missing' }),
      })
      .safeParse(attrs).error,

  create({ Sample }) {
    const recorder = `${userModel.data.firstName} ${userModel.data.lastName}`;
    const now = new Date().toISOString();

    const sample = new Sample({
      metadata: {
        survey_id: config.id,
        survey: config.name,
      },
      data: {
        surveyId: config.id,
        date: now,
        training: appModel.data.useTraining,
        location: null,
        sampleMethodId: 22,
        surveyStartTime: now,
        recorder,
      },
    });

    return sample;
  },
};

export default config;
