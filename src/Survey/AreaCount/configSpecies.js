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
        mating: Yup.array()
          .min(1, 'Please add the mating option.')
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
        eggLaying: Yup.string()
          .nullable()
          .required('Please add the egg-laying hostplants option.'),
      })
      .validateSync(model.attrs, { abortEarly: false });
  }
};

const wingConditionValues = [
  {
    value: 'fresh',
    id: -1,
  },
  {
    value: 'normal',
    id: -1,
  },
  {
    value: 'worn',
    id: -1,
  },
];

const behaviourValues = [
  {
    value: 'migrating',
    id: -1,
  },
  {
    value: 'nectaring',
    id: -1,
  },
  {
    value: 'mating',
    id: -1,
  },
  {
    value: 'egg-laying hostplants',
    id: -1,
  },
];

const altitudeValues = [
  {
    value: '0-0.5',
    id: -1,
  },
  {
    value: '0.5-1',
    id: -1,
  },
  {
    value: '1-2',
    id: -1,
  },
  {
    value: '2-5',
    id: -1,
  },
  {
    value: '5+',
    id: -1,
  },
];

const flowersValues = [
  {
    value: 'thistles',
    id: -1,
  },
  {
    value: 'mallow',
    id: -1,
  },
  {
    value: 'desert nettle',
    id: -1,
  },
  {
    value: 'other',
    id: -1,
  },
];

const directionValues = [
  { value: 'S', id: 2461 },
  { value: 'SW', id: 2462 },
  { value: 'W', id: 2463 },
  { value: 'NW', id: 2464 },
  { value: 'N', id: 2465 },
  { value: 'NE', id: 2466 },
  { value: 'E', id: 2467 },
  { value: 'SE', id: 2468 },
];

const matingValues = [
  {
    value: 'territorial defence: hill-topping',
    id: -1,
  },
  {
    value: 'territorial defence: guarding a nectar source',
    id: -1,
  },
  {
    value: 'mating',
    id: -1,
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
      // remote: { id: -1, values: behaviourValues },
    },

    direction: {
      menuProps: { icon: arrowBackOutline },
      pageProps: {
        attrProps: {
          input: 'radio',

          inputProps: { options: directionValues },
        },
      },
      // remote: { id: -1, values: directionValues },
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
      // remote: { id: -1, values: altitudeValues },
    },

    mating: {
      menuProps: { icon: butterflyIcon },
      pageProps: {
        attrProps: {
          input: 'radio',
          info: 'What kind of mating was it?',

          // inputProps: model => {
          //   const options = [
          //     {
          //       value: 'territorial defence',
          //       label: 'Territorial defence',
          //       id: -1,
          //     },
          //     { value: 'mating', label: 'Mating', id: -1 },
          //   ];

          //   if (model.attrs.mating?.includes('territorial defence')) {
          //     options.splice(
          //       1,
          //       0,
          //       {
          //         value: 'hill topping',
          //         label: 'Hill topping',
          //         id: -1,
          //         className: 'checkbox-subEntry',
          //       },
          //       {
          //         value: 'guarding a nectar source',
          //         label: 'Guarding a nectar source',
          //         id: -1,
          //         className: 'checkbox-subEntry',
          //       },
          //       {
          //         value: 'f orest margin',
          //         label: 'Forest margin',
          //         id: -1,
          //         className: 'checkbox-subEntry',
          //       }
          //     );
          //   }

          //   return { options };
          // },
          inputProps: { options: matingValues },
        },

        // remote: { id: -1 },
      },
    },

    nectarSource: {
      menuProps: { icon: flowerOutline, label: 'Nectar source' },
      pageProps: {
        headerProps: { title: 'Nectar' },
        attrProps: {
          input: 'textarea',
          info: 'Please specify the nectar source.',
        },
      },
      // remote: { id: -1 },
    },

    eggLaying: {
      menuProps: {
        icon: caterpillarIcon,
        label: 'Egg-laying hostplants',
        parse: value => `${value} `,
      },
      pageProps: {
        headerProps: { title: 'Egg-laying hostplants ' },
        attrProps: {
          input: 'radio',
          inputProps: { options: flowersValues },
        },
      },
      // remote: { id: -1, values: flowersValues },
    },

    otherEggLaying: {
      pageProps: {
        attrProps: {
          input: 'textarea',
          inputProps: {
            placeholder: 'What was the flower?',
          },
        },
      },
      // remote: { id: -1 },
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
