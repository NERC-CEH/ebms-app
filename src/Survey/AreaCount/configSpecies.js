import * as Yup from 'yup';
import { areaCountSchema } from 'Survey/common/config';
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

    occ: {
      attrs: {
        count: {
          remote: {
            id: 780,
            values: (value, _, model) => {
              const hasZeroAbundance = model.attrs.zero_abundance;

              return hasZeroAbundance ? null : value;
            },
          },
        },
      },
    },
  },

  verify(_, model) {
    try {
      Yup.object()
        .shape({
          attrs: areaCountSchema,
          samples: Yup.array()
            .min(1, 'Please add your target species')
            .required('Please add your target species'),
        })
        .validateSync(model, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  create: (AppSample, _, _surveyID, __surveyName, hasGPSPermission) =>
    survey.create(
      AppSample,
      _,
      speciesSurvey.id,
      speciesSurvey.name,
      hasGPSPermission
    ),
});

export default speciesSurvey;
