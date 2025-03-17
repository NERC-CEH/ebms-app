/* eslint-disable no-param-reassign */
import i18n from 'i18next';
import { resizeOutline, flowerOutline, arrowBackOutline } from 'ionicons/icons';
import { merge } from 'lodash';
import z from 'zod';
import butterflyIcon from 'common/images/butterfly.svg';
import caterpillarIcon from 'common/images/caterpillar.svg';
import { areaCountSchema, Survey } from 'Survey/common/config';
import desertNettleImg from './common/images/desertNettle.jpg';
import freshImg from './common/images/fresh.png';
import mallowImg from './common/images/mallow.jpg';
import normal from './common/images/normal.png';
import otherImg from './common/images/other.jpg';
import thistleImg from './common/images/thistle.jpg';
import wornImg from './common/images/worn.png';
import coreSurvey from './config';

const translateEggLayingValue = (eggLayingValues: any) => {
  if (!eggLayingValues?.length) return null;

  return eggLayingValues.map((value: any) => i18n.t(value)).join(', ');
};

const wingConditionValues = [
  {
    icon: freshImg,
    value: 'Fresh',
    id: 20687,
  },
  {
    icon: normal,
    value: 'Normal',
    id: 20688,
  },
  {
    icon: wornImg,
    value: 'Worn',
    id: 20689,
  },
];

const behaviourValues = [
  {
    value: 'Migrating',
    id: 20679,
  },
  {
    value: 'Nectaring',
    id: 20680,
  },
  {
    value: 'Mating',
    id: 20681,
  },

  {
    value: 'Egg-laying hostplants',
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
    icon: thistleImg,
    value: 'Thistles',
    id: 20683,
  },
  {
    icon: mallowImg,
    value: 'Mallow',
    id: 20684,
  },
  {
    icon: desertNettleImg,
    value: 'Desert nettle',
    id: 20685,
  },
  {
    icon: otherImg,
    value: 'Other',
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
    value: 'Territorial defence: hill-topping',
    id: 20676,
  },
  {
    value: 'Territorial defence: other',
    id: 20677,
  },
  {
    value: 'Mating',
    id: 20678,
  },
];

const speciesConfig: Survey = {
  id: 645,
  name: 'precise-single-species-area',
  label: '15min Single Species Count',

  smp: {
    create: ({ Sample, Occurrence, taxon, zeroAbundance }) => {
      const subSample = coreSurvey.smp!.create!({
        Sample,
        Occurrence,
        taxon,
        zeroAbundance,
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        surveyId: speciesSurvey.id,
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        surveyName: speciesSurvey.name,
      });

      subSample.occurrences[0].data.zero_abundance = zeroAbundance;
      return subSample;
    },

    occ: {
      attrs: {
        count: {
          remote: {
            id: 780,
            values: (value: any, _: any, model: any) =>
              model.data.zero_abundance ? null : value,
          },
        },

        wing: {
          pageProps: {
            headerProps: { title: 'Wing condition' },
            attrProps: {
              input: 'checkbox',
              inputProps: { options: wingConditionValues },
            },
          },
          remote: {
            id: 977,
            values(wingValues: any, submission: any) {
              // eslint-disable-next-line
              submission.values = {
                ...submission.values,
              };

              const bySameGroup = (wingObject: any) =>
                wingValues.includes(wingObject.value);
              const extractID = (obj: any) => obj.id;

              const wingValueIDs = wingConditionValues
                .filter(bySameGroup)
                .map(extractID);

              // eslint-disable-next-line no-param-reassign
              submission.values['occAttr:977'] = wingValueIDs;
            },
          },
        },

        behaviour: {
          menuProps: { icon: butterflyIcon },
          pageProps: {
            attrProps: {
              input: 'radio',
              set: (value: any, model: any) => {
                if (model.data.behaviour !== value) {
                  model.data.direction = null;
                  model.data.altitude = null;
                  model.data.nectarSource = null;
                  model.data.eggLaying = [];
                  model.data.otherEggLaying = null;
                  model.data.mating = null;
                  model.data.otherThistles = null;
                }
                // eslint-disable-next-line no-param-reassign
                model.data.behaviour = value;
                model.save();
              },
              inputProps: { options: behaviourValues },
            },
          },
          remote: { id: 978, values: behaviourValues },
        },

        direction: {
          menuProps: { icon: arrowBackOutline },
          pageProps: {
            attrProps: {
              input: 'radio',

              inputProps: { options: directionValues },
            },
          },
          remote: { id: 979, values: directionValues },
        },

        altitude: {
          menuProps: {
            label: 'Height',
            icon: resizeOutline,
            parse: (value: any) => `${value} m`,
          },
          pageProps: {
            headerProps: { title: 'Height above ground (meters)' },
            attrProps: {
              input: 'radio',
              inputProps: { options: altitudeValues },
            },
          },
          remote: { id: 980, values: altitudeValues },
        },

        mating: {
          menuProps: { icon: butterflyIcon },
          pageProps: {
            attrProps: {
              input: 'radio',
              inputProps: { options: matingValues },
            },
          },
          remote: { id: 981, values: matingValues },
        },

        nectarSource: {
          menuProps: { icon: flowerOutline, label: 'Nectar' },
          pageProps: {
            headerProps: { title: 'Nectar source' },
            attrProps: {
              input: 'textarea',
              inputProps: {
                placeholder: 'Enter the nectar source here',
              },
            },
          },
          remote: { id: 976 },
        },

        eggLaying: {
          menuProps: {
            icon: caterpillarIcon,
            label: 'Hostplants',
            parse: translateEggLayingValue,
          },
          pageProps: {
            headerProps: { title: 'Hostplants' },
            attrProps: {
              input: 'checkbox',
              inputProps: { options: flowersValues },
              set: (value: any, model: any) => {
                if (model.data.otherEggLaying && !value.includes('Other')) {
                  model.data.otherEggLaying = null;
                }

                if (model.data.otherThistles && !value.includes('Thistles')) {
                  model.data.otherThistles = null;
                }
                // eslint-disable-next-line no-param-reassign
                model.data.eggLaying = value;
                model.save();
              },
            },
          },

          remote: {
            id: 982,
            values(flowerValue: any, submission: any) {
              // eslint-disable-next-line
              submission.values = {
                ...submission.values,
              };

              const bySameGroup = (wingObject: any) =>
                flowerValue.includes(wingObject.value);
              const extractID = (obj: any) => obj.id;

              const flowersIDs = flowersValues
                .filter(bySameGroup)
                .map(extractID);

              // eslint-disable-next-line no-param-reassign
              submission.values['occAttr:982'] = flowersIDs;
            },
          },
        },

        otherEggLaying: {
          menuProps: {
            icon: caterpillarIcon,
            label: 'Other species',
          },
          pageProps: {
            headerProps: { title: 'Other species' },
            attrProps: {
              input: 'textarea',
              inputProps: {
                placeholder: 'Other hostplant',
              },
            },
          },
          remote: { id: 983 },
        },

        otherThistles: {
          menuProps: {
            icon: caterpillarIcon,
            label: 'Thistle species',
          },
          pageProps: {
            headerProps: { title: 'Thistle species' },
            attrProps: {
              input: 'textarea',
              inputProps: {
                placeholder: 'What kind of thistle was it?',
              },
            },
          },
          remote: { id: 984 },
        },
      },
    },
  },

  verify(_, model) {
    if (model.data.surveyStartTime) {
      return z
        .object({
          data: areaCountSchema,
          samples: z
            .array(z.object({}), {
              required_error: 'Please add your target species',
            })
            .min(1, 'Please add your target species'),
        })
        .safeParse(model).error;
    }

    return null;
  },

  create: ({ Sample, hasGPSPermission }) => {
    const sample = coreSurvey.create!({
      Sample,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      surveyId: speciesSurvey.id,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      surveyName: speciesSurvey.name,
      hasGPSPermission,
    });

    return sample;
  },
};

const speciesSurvey: Survey = merge({}, coreSurvey, speciesConfig);

export default speciesSurvey;
