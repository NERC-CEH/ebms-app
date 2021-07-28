import { merge } from 'lodash';
import survey from './config';

const speciesSurvey = merge({}, survey, {
  id: 645,
  name: 'precise-single-species-area',
  label: '15min Single Species Count',

  smp: {
    create: (appSample, appOccurrence, taxon, zeroAbundance) => {
      const subSample = survey.smp.create(
        appSample,
        appOccurrence,
        taxon,
        zeroAbundance,
        speciesSurvey.id,
        speciesSurvey.name
      );

      subSample.occurrences[0].attrs.zero_abundance = zeroAbundance;
      return subSample;
    },
  },

  create: (...args) =>
    survey.create(...args, speciesSurvey.id, speciesSurvey.name),
});

export default speciesSurvey;
