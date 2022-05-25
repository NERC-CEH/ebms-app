import * as Yup from 'yup';
import { date as dateHelp } from '@flumens';
import { Survey } from 'common/config/surveys';
import appModel from 'models/app';
import { personOutline, calendarOutline } from 'ionicons/icons';
import { commentAttr } from 'Survey/common/config';

const fixedLocationSchema = Yup.object().shape({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
  name: Yup.string().required(),
});

const validateLocation = (val: any) => {
  try {
    fixedLocationSchema.validateSync(val.attrs.location);
    return true;
  } catch (e) {
    return false;
  }
};

export const verifyLocationSchema = Yup.mixed().test(
  'location',
  'Please add the moth trap',
  validateLocation
);

const locationAttr = {
  remote: {
    id: 'location_id',
    values(location: any, submission: any) {
      // eslint-disable-next-line
      submission.values = {
        ...submission.values,
        ...{
          entered_sref: location.centroid_sref,
        },
      };

      return location.id;
    },
  },
};

const survey: Survey = {
  id: 681,
  name: 'moth',
  label: 'Moth survey (SPRING)',

  attrs: {
    location: locationAttr,
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

    create(Occurrence, taxon, identifier, photo) {
      const occ = new Occurrence({
        attrs: {
          count: 1,
          'count-outside': 0,
          taxon,
          identifier,
          comment: null,
        },
      });

      if (photo) {
        occ.media.push(photo);
      }

      return occ;
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

  create(AppSample, recorder, surveyId = survey.id, surveyName = survey.name) {
    const sample = new AppSample({
      metadata: {
        survey_id: surveyId,
        survey: surveyName,
      },

      attrs: {
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
