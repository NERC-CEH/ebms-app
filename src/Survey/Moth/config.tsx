import { date as dateHelp } from '@apps';
import { Survey } from 'common/config/surveys';
import { eyeOutline, personOutline, calendarOutline } from 'ionicons/icons';
import { commentAttr } from 'Survey/common/config';

const methodValues = [
  { id: '2196', value: 'MV light' },
  { id: '2197', value: 'Actinic light' },
  { id: '17557', value: 'LED light' },
  { id: '2198', value: 'Light trapping' },
  { id: '2199', value: 'Daytime observation' },
  { id: '2200', value: 'Dusking' },
  { id: '2201', value: 'Attracted to a lighted window' },
  { id: '2202', value: 'Sugaring' },
  { id: '2203', value: 'Wine roping' },
  { id: '2204', value: 'Beating tray' },
  { id: '2205', value: 'Pheromone trap' },
  { id: '2206', value: 'Other method (add comment)' },
  { id: '17967', value: 'Not recorded' },
];

const survey: Survey = {
  id: -1,
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
          },
        },
      },
      remote: { values: (date: Date) => dateHelp.print(date, false) },
    },

    method: {
      menuProps: { icon: eyeOutline },
      pageProps: {
        attrProps: {
          input: 'radio',
          info: 'Please select the medthod type',
          inputProps: { options: methodValues },
        },
      },
      remote: { id: 263, values: methodValues },
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

  create(AppSample, recorder, surveyId = survey.id, surveyName = survey.name) {
    const sample = new AppSample({
      metadata: {
        survey_id: surveyId,
        survey: surveyName,
      },

      attrs: {
        method: null,
        comment: null,
        recorder,
      },
    });

    return sample;
  },
};

export default survey;
