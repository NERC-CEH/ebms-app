import * as Yup from 'yup';
import { date as dateHelp } from '@apps';
import { Survey } from 'common/config/surveys';
import { personOutline, calendarOutline } from 'ionicons/icons';
import { commentAttr } from 'Survey/common/config';

const survey: Survey = {
  id: 616,
  name: 'moth',
  label: 'Moth survey',

  attrs: {
    date: {
      menuProps: { parse: 'date', icon: calendarOutline },
      pageProps: {
        attrProps: {
          input: 'date',
          inputProps: {
            max: () => new Date(),
            label: 'Date',
            icon: calendarOutline,
            autoFocus: false,
            skipTranslation: true,
          },
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
          values: (taxon: any) => taxon.warehouseId,
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

    create(Occurrence, taxon, identifier) {
      return new Occurrence({
        attrs: {
          count: 1,
          'count-outside': 1,
          taxon,
          identifier,
          comment: null,
        },
      });
    },

    verify(attrs) {
      try {
        const occurrenceScheme = Yup.object().shape({
          taxon: Yup.object().nullable().required('Species is missing.'),
        });

        occurrenceScheme.validateSync(attrs, { abortEarly: false });
      } catch (attrError) {
        return attrError;
      }

      return null;
    },
  },

  create(AppSample, recorder, surveyId = survey.id, surveyName = survey.name) {
    const sample = new AppSample({
      metadata: {
        survey_id: surveyId,
        survey: surveyName,
      },

      attrs: {
        comment: null,
        recorder,
      },
    });

    return sample;
  },
};

export default survey;
