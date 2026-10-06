import { when } from 'mobx';
import { chatboxOutline } from 'ionicons/icons';
import { z } from 'zod';
import config from 'common/config';
import { dateFormatISO, device, timeFormat } from 'common/flumens';
import locations from 'common/models/collections/locations';
import Sample from 'common/models/sample';
import { assignIfMissing } from 'common/models/utils';
import { fetchHistoricalWeather } from 'common/services/openWeather';
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
  commentAttrOld,
  dateAttr,
  stageAttr,
  dragonflyStageAttr,
  cloudAttr,
} from 'Survey/common/config';

const reliabilityValues = [
  {
    label: 'transect.suitableConditions',
    value: 'Suitable conditions',
    id: 16590,
  },
  {
    label: 'transect.unsuitableConditions',
    value: 'Unsuitable conditions',
    id: 16591,
  },
  { label: 'transect.unableSurvey', value: 'Unable to survey', id: 16592 },
];

const getHasStartTimeAndLocation = (sample: Sample) => () =>
  !!sample.data.surveyStartTime && !!sample.data.locationId;

const getSetStartWeather = (sample: Sample) => async () => {
  if (!device.isOnline) return;

  const trap = locations.idMap.get(sample.data.locationId || '');

  const datePart = sample.data.date; // YYYY-MM-DD
  const timePart = sample.data.surveyStartTime; // HH:mm
  const time = `${datePart}T${timePart}`; // no timezone suffix (Z or +02:00), so JS interprets it as local time

  const weatherValues = await fetchHistoricalWeather(trap!.data.location, time);

  assignIfMissing(sample, 'temperature', weatherValues.temperature);
  assignIfMissing(sample, 'windDirection', weatherValues.windDirection);
  assignIfMissing(sample, 'windSpeed', weatherValues.windSpeed);
  assignIfMissing(sample, 'cloud', weatherValues.cloud);
};

const survey: Survey = {
  id: 562,
  name: 'transect',
  label: 'common.ebmsTransect',
  webForm: 'ebms-input-data',
  attrs: {
    date: dateAttr,
    surveyStartTime: surveyStartTimeAttr,
    surveyEndTime: surveyEndTimeAttr,
    cloud: cloudAttr,
    temperature: temperatureAttr,
    windDirection: windDirectionAttr,
    windSpeed: windSpeedAttr,
    comment: commentAttrOld,

    recorder: {
      pageProps: {
        attrProps: {
          input: 'text',
          info: 'transect.pleaseSpecifyPerson',
        },
      },
      remote: { id: 1384 },
    },
  },

  smp: {
    attrs: {
      date: dateAttr,
      comment: {
        menuProps: {
          icon: chatboxOutline,
          label: 'common.comment',
          skipValueTranslation: true,
        },
        pageProps: {
          headerProps: { title: 'common.comment' },
          attrProps: {
            input: 'textarea',
            info: 'transect.addSectionInfo',
          },
        },
      },
      reliability: {
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'transect.countReliability',
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
        comment: commentAttrOld,
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
            taxon,
          },
        });
      },

      verify: attrs =>
        z
          .object({
            count: z.number({ error: 'transect.countEmpty' }),
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
          enteredSrefSystem: location?.data
            .centroidSrefSystem as Sample['data']['enteredSrefSystem'],
          locationId: location!.id,
          reliability: 'Suitable conditions',
        },
      });

      return sample;
    },

    verify: attrs =>
      z
        .object({
          reliability: z.string({
            error: 'transect.reliabilityRequired',
          }),
        })
        .safeParse(attrs).error,
  },

  verify: attrs =>
    z
      .object({
        locationId: z.string({ error: 'transect.pleaseSelectYourTransect' }),
        recorder: z.string({ error: 'transect.recorderInfoMissing' }),
        surveyStartTime: z.string({ error: 'transect.startTimeMissing' }),
        // surveyEndTime: // automatically set on send
        temperature: z.number({
          error: 'transect.temperatureRequired',
        }),
        windSpeed: z.string({ error: 'transect.windSpeedInfo' }),
      })
      .safeParse(attrs).error,

  create() {
    const recorder = `${userModel.data.firstName} ${userModel.data.lastName}`;
    const now = new Date();

    const sample = new Sample({
      metadata: { survey: survey.name },
      data: {
        surveyId: survey.id,
        date: dateFormatISO.format(now),
        training: userModel.data.training === true,
        sampleMethodId: 22,
        surveyStartTime: timeFormat.format(now),
        recorder,
        [appVersionAttr.id]: config.version,
      },
    });

    when(getHasStartTimeAndLocation(sample), getSetStartWeather(sample));

    return sample;
  },
};

export default survey;
