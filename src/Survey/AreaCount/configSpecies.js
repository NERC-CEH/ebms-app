/* eslint-disable no-param-reassign */
import * as Yup from 'yup';
import { areaCountSchema } from 'Survey/common/config';
import { resizeOutline, flowerOutline, arrowBackOutline } from 'ionicons/icons';
import butterflyIcon from 'common/images/butterfly.svg';
import caterpillarIcon from 'common/images/caterpillar.svg';

import { merge } from 'lodash';
import survey from './config';

const verifyAttrs = model => {
  Yup.object()
    .shape({
      wing: Yup.array().min(1, 'Please add the wing option.').required(),
      behaviour: Yup.string()
        .nullable()
        .required('Please add the behaviour option.'),
    })
    .validateSync(model.attrs, { abortEarly: false });

  if (model.attrs.behaviour === 'nectaring') {
    Yup.object()
      .shape({
        nectarSource: Yup.string()
          .nullable()
          .required('Please add the nectar option.'),
      })
      .validateSync(model.attrs, { abortEarly: false });
  }

  if (model.attrs.behaviour === 'mating') {
    Yup.object()
      .shape({
        mating: Yup.string()
          .nullable()
          .required('Please add the mating option.'),
      })
      .validateSync(model.attrs, { abortEarly: false });
  }

  if (model.attrs.behaviour === 'migrating') {
    Yup.object()
      .shape({
        direction: Yup.string()
          .nullable()
          .required('Please add the direction option.'),

        altitude: Yup.string()
          .nullable()
          .required('Please add the altitude option.'),
      })
      .validateSync(model.attrs, { abortEarly: false });
  }

  if (model.attrs.behaviour === 'egg-laying hostplants') {
    Yup.object()
      .shape({
        eggLaying: Yup.array()
          .min(1, 'Please add the egg-laying hostplants option.')
          .required('Please add the egg-laying hostplants option.'),
      })
      .validateSync(model.attrs, { abortEarly: false });
  }
};

const wingConditionValues = [
  {
    value: 'fresh',
    id: 20687,
  },
  {
    value: 'normal',
    id: 20688,
  },
  {
    value: 'worn',
    id: 20689,
  },
];

const behaviourValues = [
  {
    value: 'migrating',
    id: 20679,
  },
  {
    value: 'nectaring',
    id: 20680,
  },
  {
    value: 'mating',
    id: 20681,
  },
  {
    value: 'egg-laying hostplants',
    id: 20682,
  },
];

const altitudeValues = [
  {
    value: '0 - 0.5',
    id: 20671,
  },
  {
    value: '0.5 - 1',
    id: 20672,
  },
  {
    value: '1 - 2',
    id: 20673,
  },
  {
    value: '2 - 5',
    id: 20674,
  },
  {
    value: '5+',
    id: 20675,
  },
];

const flowersValues = [
  {
    value: 'thistles',
    id: 20683,
  },
  {
    value: 'mallow',
    id: 20684,
  },
  {
    value: 'desert nettle',
    id: 20685,
  },
  {
    value: 'other',
    id: 20686,
  },
];

const directionValues = [
  { value: 'S', id: 20663 },
  { value: 'SW', id: 20664 },
  { value: 'W', id: 20665 },
  { value: 'NW', id: 20666 },
  { value: 'N', id: 20667 },
  { value: 'NE', id: 20668 },
  { value: 'E', id: 20669 },
  { value: 'SE', id: 20670 },
];

const matingValues = [
  {
    value: 'territorial defence: hill-topping',
    id: 20676,
  },
  {
    value: 'territorial defence: other',
    id: 20677,
  },
  {
    value: 'mating',
    id: 20678,
  },
];

const speciesSurvey = merge({}, survey, {
  id: 645,
  name: 'precise-single-species-area',
  label: '15min Single Species Count',

  attrs: {
    wing: {
      menuProps: {
        label: 'Wing',
        icon: butterflyIcon,
      },
      pageProps: {
        attrProps: {
          info: 'What is the wing condition?',
          input: 'checkbox',
          inputProps: { options: wingConditionValues },
        },
      },

      remote: { id: 1744, values: behaviourValues },
    },

    behaviour: {
      menuProps: { icon: butterflyIcon },
      pageProps: {
        attrProps: {
          input: 'radio',
          info: 'What was the behaviour?',
          set: (value, model) => {
            if (model.attrs.behaviour !== value) {
              model.attrs.direction = null;
              model.attrs.altitude = null;
              model.attrs.egg = null;
              model.attrs.nectarSource = null;
              model.attrs.eggLaying = null;
              model.attrs.otherEggLaying = null;
            }
            // eslint-disable-next-line no-param-reassign
            model.attrs.behaviour = value;
            model.save();
          },
          inputProps: { options: behaviourValues },
        },
      },
      remote: { id: 1742, values: behaviourValues },
    },

    direction: {
      menuProps: { icon: arrowBackOutline },
      pageProps: {
        attrProps: {
          input: 'radio',

          inputProps: { options: directionValues },
        },
      },
      remote: { id: 1739, values: directionValues },
    },

    altitude: {
      menuProps: { icon: resizeOutline, parse: value => `${value} m` },
      pageProps: {
        attrProps: {
          input: 'radio',
          info: 'What was the butterfly flying altitude? (meters)',
          inputProps: { options: altitudeValues },
        },
      },
      remote: { id: 1740, values: altitudeValues },
    },

    mating: {
      menuProps: { icon: butterflyIcon },
      pageProps: {
        attrProps: {
          input: 'radio',
          info: 'What kind of mating was it?',
          inputProps: { options: matingValues },
        },

        remote: { id: 1741, values: matingValues },
      },
    },

    nectarSource: {
      menuProps: { icon: flowerOutline, label: 'Nectar source' },
      pageProps: {
        headerProps: { title: 'Nectar' },
        attrProps: {
          input: 'textarea',
          inputProps: {
            placeholder: 'Enter the nectar source here',
          },
        },
      },
      remote: { id: 1745 },
    },

    eggLaying: {
      menuProps: {
        icon: caterpillarIcon,
        label: 'Hostplants',
      },
      pageProps: {
        headerProps: { title: 'Hostplants' },
        attrProps: {
          input: 'checkbox',
          inputProps: { options: flowersValues },
        },
      },
      remote: { id: 1743, values: flowersValues },
    },

    otherEggLaying: {
      pageProps: {
        attrProps: {
          input: 'textarea',
          inputProps: {
            placeholder: 'Other hostplant',
          },
        },
      },
      remote: { id: 1746 },
    },
  },

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
      if (model.attrs.surveyStartTime) {
        Yup.object()
          .shape({
            attrs: areaCountSchema,
            samples: Yup.array()
              .min(1, 'Please add your target species')
              .required('Please add your target species'),
          })
          .validateSync(model, { abortEarly: false });
      }

      if (model.isPaintedLadySurvey()) {
        verifyAttrs(model);
      }
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  create: (AppSample, _, _surveyID, __surveyName, hasGPSPermission) => {
    const sample = survey.create(
      AppSample,
      _,
      speciesSurvey.id,
      speciesSurvey.name,
      hasGPSPermission
    );

    return sample;
  },
});

export default speciesSurvey;
