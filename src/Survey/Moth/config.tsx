import { when } from 'mobx';
import {
  thermometerOutline,
  calendarOutline,
  personOutline,
  cloudyOutline,
  moonOutline,
} from 'ionicons/icons';
import SunCalc from 'suncalc';
import { z } from 'zod';
import { device, isValidLocation, timeFormat } from '@flumens';
import { IonIcon, IonImg } from '@ionic/react';
import firstQuarterMoonIcon from 'common/images/first-quarter-moon.svg';
import fullIcon from 'common/images/full-moon.svg';
import lastQuarterIcon from 'common/images/last-quarter-moon.svg';
import newIcon from 'common/images/new-moon.svg';
import wanningCrescentIcon from 'common/images/waning-crescent-moon.svg';
import wanningGibbousIcon from 'common/images/waning-gibbous-moon.svg';
import waxingCrescentIcon from 'common/images/waxing-crescent-moon.svg';
import waxingGibbousIcon from 'common/images/waxing-gibbous-moon.svg';
import windIcon from 'common/images/wind.svg';
import { assignIfMissing } from 'common/models/utils';
import { fetchHistoricalWeather } from 'common/services/openWeather';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import AppSample, { MothTrapLocation } from 'models/sample';
import {
  Survey,
  commentAttr,
  windDirectionValues,
  windSpeedValues,
  temperatureValues,
  dateAttr,
} from 'Survey/common/config';

type Type = Record<string, string>;

export const moonIcons: Type = {
  New: newIcon,
  'Waxing crescent': waxingCrescentIcon,
  'First quarter': firstQuarterMoonIcon,
  'Waxing gibbous': waxingGibbousIcon,
  Full: fullIcon,
  'Waning gibbous': wanningGibbousIcon,
  'Last quarter': lastQuarterIcon,
  'Waning crescent': wanningCrescentIcon,
};

export enum MachineInvolvement {
  /**
   * No involvement.
   */
  NONE = 0,
  /**
   * Human determined, machine suggestions were ignored.
   */
  HUMAN = 1,
  /**
   * Human chose a machine suggestion given a very low probability.
   */
  HUMAN_ACCEPTED_LESS_PREFERRED_LOW = 2,
  /**
   * Human chose a machine suggestion that was less-preferred.
   */
  HUMAN_ACCEPTED_LESS_PREFERRED = 3,
  /**
   * Human chose a machine suggestion that was the preferred choice.
   */
  HUMAN_ACCEPTED_PREFERRED = 4,
  /**
   * Machine determined with no human involvement.
   */
  MACHINE = 5,
}

const moonPhaseValues = [
  {
    id: 20827,
    prefix: <IonIcon src={newIcon} className="size-6" />,
    value: 'New',
  },
  {
    id: 20828,
    prefix: <IonIcon src={waxingCrescentIcon} className="size-6" />,
    value: 'Waxing crescent',
  },
  {
    id: 20829,
    prefix: <IonIcon src={firstQuarterMoonIcon} className="size-6" />,
    value: 'First quarter',
  },
  {
    id: 20830,
    prefix: <IonIcon src={waxingGibbousIcon} className="size-6" />,
    value: 'Waxing gibbous',
  },
  {
    id: 20831,
    prefix: <IonIcon src={fullIcon} className="size-6" />,
    value: 'Full',
  },
  {
    id: 20832,
    prefix: <IonIcon src={wanningGibbousIcon} className="size-6" />,
    value: 'Waning gibbous',
  },
  {
    id: 20833,
    prefix: <IonIcon src={lastQuarterIcon} className="size-6" />,
    value: 'Last quarter',
  },
  {
    id: 20834,
    prefix: <IonIcon src={wanningCrescentIcon} className="size-6" />,
    value: 'Waning crescent',
  },
];

const getSetDefaultTime = (sample: AppSample) => () => {
  const { surveyStartTime } = sample.data;
  if (surveyStartTime) return;

  const { location } = (sample.data.location as MothTrapLocation)?.data || {};
  if (!isValidLocation(location)) return;

  // end time
  const date = new Date(sample.data.date);
  const { sunrise } = SunCalc.getTimes(
    date,
    location.latitude,
    location.longitude
  );
  // eslint-disable-next-line no-param-reassign
  sample.data.surveyEndTime = new Date(sunrise).toISOString(); // UTC time

  // start time
  const oneDayBefore = new Date(date.setDate(date.getDate() - 1));
  const { sunset } = SunCalc.getTimes(
    oneDayBefore,
    location.latitude,
    location.longitude
  );
  // eslint-disable-next-line no-param-reassign
  sample.data.surveyStartTime = new Date(sunset).toISOString(); // UTC time
  sample.save();
};

const getSetEndWeather = (sample: AppSample) => async () => {
  if (!device.isOnline) return;

  const weatherValues = await fetchHistoricalWeather(
    (sample.data.location as MothTrapLocation).data.location,
    sample.data.surveyEndTime!
  );

  assignIfMissing(sample, 'temperatureEnd', weatherValues.temperature);
  assignIfMissing(sample, 'directionEnd', weatherValues.windDirection);
  assignIfMissing(sample, 'windEnd', weatherValues.windSpeed);
  assignIfMissing(sample, 'cloudEnd', weatherValues.cloud);
};
const getHasEndTimeAndLocation = (sample: AppSample) => () =>
  !!sample.data.surveyEndTime &&
  !!(sample.data.location as MothTrapLocation)?.id;

const getSetStartWeather = (sample: AppSample) => async () => {
  if (!device.isOnline) return;

  const weatherValues = await fetchHistoricalWeather(
    (sample.data.location as MothTrapLocation).data.location,
    sample.data.surveyStartTime!
  );

  assignIfMissing(sample, 'temperature', weatherValues.temperature);
  assignIfMissing(sample, 'direction', weatherValues.windDirection);
  assignIfMissing(sample, 'wind', weatherValues.windSpeed);
  assignIfMissing(sample, 'cloud', weatherValues.cloud);
};

const getHasStartTimeAndLocation = (sample: AppSample) => () =>
  !!sample.data.surveyStartTime &&
  !!(sample.data.location as MothTrapLocation)?.id;

const getMoonPhase = (date: Date, isSouthernHemisphere: boolean) => {
  const LUNAR_MONTH = 29.530588853;
  const getLunarAge = () => {
    const normalize = (value: number) => {
      // eslint-disable-next-line no-param-reassign
      value -= Math.floor(value);
      // eslint-disable-next-line no-param-reassign
      if (value < 0) value += 1;
      return value;
    };
    const getJulianDate = () => {
      const time = date.getTime();
      const tzoffset = date.getTimezoneOffset();

      return time / 86400000 - tzoffset / 1440 + 2440587.5;
    };

    const percent = normalize((getJulianDate() - 2451550.1) / LUNAR_MONTH);
    const age = percent * LUNAR_MONTH;
    return age;
  };

  const age = getLunarAge();

  if (!isSouthernHemisphere) {
    if (age < 1.84566) return 'New';
    if (age < 5.53699) return 'Waxing crescent';
    if (age < 9.22831) return 'First quarter';
    if (age < 12.91963) return 'Waxing gibbous';
    if (age < 16.61096) return 'Full';
    if (age < 20.30228) return 'Waning gibbous';
    if (age < 23.99361) return 'Last quarter';
    if (age < 27.68493) return 'Waning crescent';
  } else {
    if (age < 1.84566) return 'New';
    if (age < 5.53699) return 'Waning crescent';
    if (age < 9.22831) return 'Last quarter';
    if (age < 12.91963) return 'Waning gibbous';
    if (age < 16.61096) return 'Full';
    if (age < 20.30228) return 'Waxing gibbous';
    if (age < 23.99361) return 'First quarter';
    if (age < 27.68493) return 'Waxing crescent';
  }

  return 'New';
};

const getSetStartMoonPhase = (sample: AppSample) => () => {
  const isSouthernHemisphere =
    (sample.data.location as MothTrapLocation)?.data?.location?.latitude < 0;
  const moonPhase = getMoonPhase(
    new Date(sample.data.surveyStartTime!),
    isSouthernHemisphere
  );

  assignIfMissing(sample, 'moon', moonPhase);
};

const getSetStartMoonEndPhase = (sample: AppSample) => () => {
  const isSouthernHemisphere =
    (sample.data.location as MothTrapLocation)?.data?.location?.latitude < 0;
  const moonPhase = getMoonPhase(
    new Date(sample.data.surveyEndTime!),
    isSouthernHemisphere
  );
  assignIfMissing(sample, 'moonEnd', moonPhase);
};

const survey: Survey = {
  id: 681,
  name: 'moth',
  label: 'Moth survey (SPRING)',
  webForm: 'enter-moth-trap-records',

  attrs: {
    location: {
      remote: {
        id: 'location_id',
        values(location: any, submission: any) {
          const centroidSref = `${location.data.location.latitude} ${location.data.location.longitude}`;

          // eslint-disable-next-line
          submission.values = {
            ...submission.values,
            entered_sref: centroidSref,
          };

          return location.id;
        },
      },
    },

    surveyStartTime: {
      menuProps: { label: 'Start Time' },
      pageProps: {
        headerProps: { title: 'Start Time' },
        attrProps: {
          input: 'time',
          info: 'Defaulted to sunset time',
          inputProps: {
            format: { options: { hour: '2-digit', minute: '2-digit' } },
            presentation: 'time',
          },
        },
      },
      remote: {
        id: 1385,
        values: (date: number) => timeFormat.format(new Date(date)),
      },
    },

    surveyEndTime: {
      menuProps: { label: 'End Time' },
      pageProps: {
        headerProps: { title: 'End Time' },
        attrProps: {
          input: 'time',
          info: 'Defaulted to sunrise time',
          inputProps: {
            format: { options: { hour: '2-digit', minute: '2-digit' } },
            presentation: 'time',
          },
        },
      },
      remote: {
        id: 1386,
        values: (date: number) => timeFormat.format(new Date(date)),
      },
    },

    // start weather
    direction: {
      menuProps: { label: 'Wind Direction', icon: windIcon },
      pageProps: {
        headerProps: { title: 'Wind Direction' },
        attrProps: {
          input: 'radio',
          info: 'Please specify the wind direction.',
          inputProps: { options: windDirectionValues },
        },
      },
      remote: { id: 1763, values: windDirectionValues },
    },

    wind: {
      menuProps: { label: 'Wind Speed', icon: windIcon },
      pageProps: {
        headerProps: { title: 'Wind Speed' },
        attrProps: {
          input: 'radio',
          info: 'Please specify the wind speed.',
          inputProps: { options: windSpeedValues },
        },
      },
      remote: { id: 1767, values: windSpeedValues },
    },

    cloud: {
      menuProps: { icon: cloudyOutline, label: 'Cloud' },
      pageProps: {
        headerProps: { title: 'Cloud' },
        attrProps: {
          input: 'slider',
          info: 'Please specify the % of cloud cover.',
          inputProps: { max: 100, min: 0 },
        },
      },
      remote: { id: 1765 },
    },

    moon: {
      menuProps: {
        icon: moonOutline,
        label: 'Moon phase',
        parse: (moonPhase: string) => <IonImg src={moonIcons[moonPhase]} />,
      },
      pageProps: {
        headerProps: { title: 'Moon phase' },
        attrProps: {
          input: 'radio',
          inputProps: { options: moonPhaseValues },
        },
      },
      remote: { id: 1760, values: moonPhaseValues },
    },

    temperature: {
      menuProps: { icon: thermometerOutline, label: 'Temperature' },
      pageProps: {
        headerProps: { title: 'Temperature' },
        attrProps: {
          input: 'radio',
          info: 'Please specify the temperature C°.',
          inputProps: { options: temperatureValues },
        },
      },
      remote: { id: 1761, values: temperatureValues },
    },

    // end weather
    directionEnd: {
      menuProps: { label: 'Wind Direction', icon: windIcon },
      pageProps: {
        headerProps: { title: 'Wind Direction' },
        attrProps: {
          input: 'radio',
          info: 'Please specify the wind direction.',
          inputProps: { options: windDirectionValues },
        },
      },
      remote: { id: 1764, values: windDirectionValues },
    },

    windEnd: {
      menuProps: { label: 'Wind Speed', icon: windIcon },
      pageProps: {
        headerProps: { title: 'Wind Speed' },
        attrProps: {
          input: 'radio',
          info: 'Please specify the wind speed.',
          inputProps: { options: windSpeedValues },
        },
      },
      remote: { id: 1768, values: windSpeedValues },
    },

    moonEnd: {
      menuProps: {
        icon: moonOutline,
        label: 'Moon phase',
        parse: (moonPhase: string) => <IonImg src={moonIcons[moonPhase]} />,
      },
      pageProps: {
        headerProps: { title: 'Moon phase' },
        attrProps: {
          input: 'radio',
          inputProps: { options: moonPhaseValues },
        },
      },
      remote: { id: 1769, values: moonPhaseValues },
    },

    temperatureEnd: {
      menuProps: { icon: thermometerOutline, label: 'Temperature' },
      pageProps: {
        headerProps: { title: 'Temperature' },
        attrProps: {
          input: 'radio',
          info: 'Please specify the temperature C°.',
          inputProps: { options: temperatureValues },
        },
      },
      remote: { id: 1762, values: temperatureValues },
    },

    cloudEnd: {
      menuProps: { icon: cloudyOutline, label: 'Cloud' },
      pageProps: {
        headerProps: { title: 'Cloud' },
        attrProps: {
          input: 'slider',
          info: 'Please specify the % of cloud cover.',
          inputProps: { max: 100, min: 0 },
        },
      },
      remote: { id: 1766 },
    },

    date: {
      menuProps: { parse: 'date', icon: calendarOutline },
      pageProps: {
        attrProps: {
          input: 'date',
          inputProps: () => ({
            max: () => new Date(),
            label: 'Date',
            icon: calendarOutline,
            autoFocus: false,
            presentation: 'date',
            locale: appModel.data.language || undefined,
          }),
        },
      },
      remote: dateAttr.remote,
    },

    comment: commentAttr,

    recorder: {
      menuProps: { icon: personOutline },
      pageProps: {
        attrProps: {
          input: 'input',
          inputProps: {
            placeholder: 'Recorder name',
          },
          info: "Enter the recorder's name, if different.",
        },
      },
      remote: { id: 127 },
    },
  },

  occ: {
    attrs: {
      taxon: {
        remote: {
          id: 'taxa_taxon_list_id',
          values: (taxon: any) => taxon.warehouse_id,
        },
      },

      comment: commentAttr,
      identifier: {
        menuProps: { icon: personOutline },
        pageProps: {
          attrProps: {
            input: 'input',
            inputProps: {
              placeholder: 'Recorder name',
            },
            info: "Enter the recorder's name, if different.",
          },
        },
        remote: { id: 18 },
      },

      count: {
        remote: { id: 133 },
      },

      'count-outside': {
        remote: { id: 898 },
      },
    },

    verify(attrs) {
      const occurrenceSchema = z
        .object({
          count: z.number(),
          'count-outside': z.number(),
        })
        .refine(
          (val: any) => val.count + val['count-outside'] > 0,
          'Count sum must be greater than 0'
        );

      return occurrenceSchema.safeParse(attrs).error;
    },

    create({ Occurrence: AppOccurrence, taxon, identifier, photo }) {
      const occ = new AppOccurrence({
        attrs: {
          count: 1,
          'count-outside': 0,
          taxon,
          identifier,
          comment: null,
        },
      });

      if (photo) occ.media.push(photo);

      return occ;
    },

    modifySubmission(submission: any, occ: Occurrence) {
      const classifierSubmission = occ.getClassifierSubmission();
      if (!classifierSubmission) return submission;

      return {
        ...submission,
        ...classifierSubmission,
        values: { ...submission.values, ...classifierSubmission.values },
      };
    },
  },

  verify: attrs =>
    z
      .object({
        location: z.object(
          {
            id: z.string({ error: 'Location is missing.' }),
            data: z.object({
              location: z
                .object({
                  latitude: z.number().nullable().optional(),
                  longitude: z.number().nullable().optional(),
                })
                .refine(
                  (val: any) =>
                    Number.isFinite(val.latitude) &&
                    Number.isFinite(val.longitude),
                  'Location is missing.'
                ),
            }),
          },
          { error: 'Location is missing.' }
        ),
      })
      .safeParse(attrs).error,

  create({ Sample, recorder, surveyId, surveyName }) {
    const sample = new Sample({
      metadata: {
        survey_id: surveyId || survey.id,
        survey: surveyName || survey.name,
      },
      data: {
        surveyId: surveyId || survey.id,
        date: new Date().toISOString(),
        enteredSrefSystem: 4326,
        training: appModel.data.useTraining,
        inputForm: survey.webForm,
        location: null,
        comment: null,
        recorder,
      },
    });

    when(() => !!sample.data.location, getSetDefaultTime(sample));

    when(getHasStartTimeAndLocation(sample), getSetStartWeather(sample));
    when(getHasEndTimeAndLocation(sample), getSetEndWeather(sample));

    when(getHasStartTimeAndLocation(sample), getSetStartMoonPhase(sample));
    when(getHasEndTimeAndLocation(sample), getSetStartMoonEndPhase(sample));

    return sample;
  },
};

export default survey;

type UnknownSpeciesObject = Record<string, any>;
const UNKNOWN_SPECIES: UnknownSpeciesObject = {
  en: {
    warehouse_id: 538737,
    taxon_group: 260,
    common_name: 'Unknown',
    preferredId: 538737,
    found_in_name: 'common_name',
  },
  'nl-NL': {
    warehouse_id: 541352,
    common_name: 'Onbekend',
    taxon_group: 260,
    preferredId: 538737,
    found_in_name: 'common_name',
  },
};

export const getUnknownSpecies = () =>
  UNKNOWN_SPECIES[appModel.data.language as any] || UNKNOWN_SPECIES.en;
