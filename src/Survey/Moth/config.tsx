import {
  thermometerOutline,
  calendarOutline,
  personOutline,
  cloudyOutline,
  moonOutline,
} from 'ionicons/icons';
import * as Yup from 'yup';
import { date as dateHelp } from '@flumens';
import { IonImg } from '@ionic/react';
import config from 'common/config';
import firstQuarterMoonIcon from 'common/images/first-quarter-moon.svg';
import fullIcon from 'common/images/full-moon.svg';
import lastQuarterIcon from 'common/images/last-quarter-moon.svg';
import newIcon from 'common/images/new-moon.svg';
import wanningCrescentIcon from 'common/images/waning-crescent-moon.svg';
import wanningGibbousIcon from 'common/images/waning-gibbous-moon.svg';
import waxingCrescentIcon from 'common/images/waxing-crescent-moon.svg';
import waxingGibbousIcon from 'common/images/waxing-gibbous-moon.svg';
import windIcon from 'common/images/wind.svg';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import {
  Survey,
  commentAttr,
  windDirectionValues,
  windSpeedValues,
  temperatureValues,
} from 'Survey/common/config';

interface Type {
  [key: string]: string;
}

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

function attachClassifierResults(submission: any, occ: Occurrence) {
  const { taxon } = occ.attrs;
  const classifierVersion = taxon?.version || '';

  const getMediaPath = (media: any) => media.values.queued;
  const mediaPaths = submission.media.map(getMediaPath);

  const getSuggestion = (
    { probability, taxon: taxon_name_given, warehouse_id }: any,
    index: number
  ) => {
    const topSpecies = index === 0;
    const classifierChosen = topSpecies ? 't' : 'f';
    const humanChosen = warehouse_id === taxon?.warehouse_id ? 't' : 'f';

    return {
      values: {
        taxon_name_given,
        probability_given: probability,
        taxa_taxon_list_id: warehouse_id,
        classifier_chosen: classifierChosen,
        human_chosen: humanChosen,
      },
    };
  };

  const classifierSuggestions =
    occ.attrs.taxon?.suggestions?.map(getSuggestion) || [];

  const hasSuggestions = classifierSuggestions.length;
  if (!hasSuggestions) {
    // don't set anything yet because this requires below structure to be valid
    // submission.values.machine_involvement = MachineInvolvement.NONE;
    return submission;
  }

  if (!mediaPaths.length) {
    return submission;
  }

  if (Number.isFinite(taxon?.machineInvolvement)) {
    // eslint-disable-next-line no-param-reassign
    submission.values.machine_involvement = taxon?.machineInvolvement;
  }

  return {
    ...submission,

    classification_event: {
      values: { created_by_id: null },
      classification_results: [
        {
          values: {
            classifier_id: config.classifierID,
            classifier_version: classifierVersion,
          },
          classification_suggestions: classifierSuggestions,
          metaFields: { mediaPaths },
        },
      ],
    },
  };
}

const fixedLocationSchema = Yup.object().shape({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
  name: Yup.string().required(),
});

const validateLocation = (val: any) => {
  try {
    // TODO: Backwards compatibility
    if (val.name) {
      fixedLocationSchema.validateSync(val);
    } else {
      fixedLocationSchema.validateSync(val.attrs.location);
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const verifyLocationSchema = Yup.mixed().test(
  'location',
  'Please add the moth trap.',
  validateLocation
);

const verifyCountSchema = (occurrenceAttr: any) => {
  return occurrenceAttr.count + occurrenceAttr['count-outside'] > 0;
};

const locationAttr = {
  remote: {
    id: 'location_id',
    values(location: any, submission: any) {
      let centroidSref;
      if (location?.latitude) {
        // TODO: Backwards compatibility
        centroidSref = `${location?.latitude} ${location?.longitude}`;
      } else {
        centroidSref = `${location.attrs.location.latitude} ${location.attrs.location.longitude}`;
      }

      // eslint-disable-next-line
      submission.values = {
        ...submission.values,
        ...{
          entered_sref: centroidSref,
          centroid_sref_system: 4326,
        },
      };

      return location.id;
    },
  },
};

const moonPhaseValues = [
  { id: 20827, icon: newIcon, value: 'New', className: 'moon' },
  { id: 20828, icon: waxingCrescentIcon, value: 'Waxing crescent' },
  { id: 20829, icon: firstQuarterMoonIcon, value: 'First quarter' },
  { id: 20830, icon: waxingGibbousIcon, value: 'Waxing gibbous' },
  { id: 20831, icon: fullIcon, value: 'Full' },
  { id: 20832, icon: wanningGibbousIcon, value: 'Waning gibbous' },
  { id: 20833, icon: lastQuarterIcon, value: 'Last quarter' },
  { id: 20834, icon: wanningCrescentIcon, value: 'Waning crescent' },
];

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

const survey: Survey = {
  id: 681,
  name: 'moth',
  label: 'Moth survey (SPRING)',
  webForm: 'enter-moth-trap-records',

  attrs: {
    location: locationAttr,

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
        values: (date: number) => dateTimeFormat.format(new Date(date)),
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
        values: (date: number) => dateTimeFormat.format(new Date(date)),
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
            locale: appModel.attrs.language || undefined,
          }),
        },
      },
      remote: { values: (date: Date) => dateHelp.print(date, false) },
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
      try {
        const occurrenceSchema = Yup.object()
          .shape({
            count: Yup.number().required(),
            'count-outside': Yup.number().required(),
          })
          .test('test', `Count sum must be greater than 0`, verifyCountSchema);

        occurrenceSchema.validateSync(attrs, { abortEarly: false });
      } catch (attrError) {
        return attrError;
      }

      return null;
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
      return attachClassifierResults(submission, occ);
    },
  },

  verify(attrs) {
    try {
      const sampleSchema = Yup.object().shape({
        location: verifyLocationSchema,
      });

      sampleSchema.validateSync(attrs, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  create({ Sample, recorder, surveyId, surveyName }) {
    const sample = new Sample({
      metadata: {
        survey_id: surveyId || survey.id,
        survey: surveyName || survey.name,
      },
      attrs: {
        training: appModel.attrs.useTraining,
        location: null,
        comment: null,
        recorder,
      },
    });

    return sample;
  },
};

export default survey;

type UnknownSpeciesObject = { [key: string]: any };
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

export const getUnkownSpecies = () =>
  UNKNOWN_SPECIES[appModel.attrs.language as any] || UNKNOWN_SPECIES.en;
