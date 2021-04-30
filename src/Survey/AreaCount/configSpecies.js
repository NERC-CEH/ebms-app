import { merge } from 'lodash';
import survey from './config';

const speciesSurvey = merge({}, survey, {
  id: 645,
  name: 'precise-single-species-area',
  label: '15min Single Species Count',

  smp: {
    create: (...args) =>
      survey.smp.create(...args, speciesSurvey.id, speciesSurvey.name),
  },

  create: (...args) =>
    survey.create(...args, speciesSurvey.id, speciesSurvey.name),
});

export default speciesSurvey;
