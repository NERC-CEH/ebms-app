import i18n from 'i18next';
import { resizeOutline, flowerOutline, arrowBackOutline } from 'ionicons/icons';
import { merge } from 'lodash';
import z from 'zod';
import { NumberInputConf } from 'common/flumens';
import butterflyIcon from 'common/images/butterfly.svg';
import caterpillarIcon from 'common/images/caterpillar.svg';
import Occurrence from 'models/occurrence';
import { areaCountSchema, Survey, type Submission } from 'Survey/common/config';
import getSurveyValueKey from 'Survey/common/translationKeys';
import desertNettleImg from './common/images/desertNettle.jpg';
import freshImg from './common/images/fresh.png';
import mallowImg from './common/images/mallow.jpg';
import normal from './common/images/normal.png';
import otherImg from './common/images/other.jpg';
import thistleImg from './common/images/thistle.jpg';
import wornImg from './common/images/worn.png';
import coreSurvey, { abundanceAttr as abundanceAttrOrig } from './config';

export type PaintedLadyAttrs = {
  wing?: string[];
  behaviour?: string;
  direction?: number | string;
  altitude?: string;
  eggLaying?: string[];
  otherEggLaying?: string;
  otherThistles?: string;
  nectarSource?: string;
  mating?: string;
};

const translateEggLayingValue = (eggLayingValues?: string[]) =>
  eggLayingValues
    ?.map(value => i18n.t(getSurveyValueKey(value) as never, value))
    .join(', ') || null;

const wingConditionValues = [
  {
    icon: freshImg,
    label: 'area.fresh',
    value: 'Fresh',
    id: 20687,
  },
  {
    icon: normal,
    label: 'area.normal',
    value: 'Normal',
    id: 20688,
  },
  {
    icon: wornImg,
    label: 'area.worn',
    value: 'Worn',
    id: 20689,
  },
];

const behaviourValues = [
  {
    label: 'area.migrating',
    value: 'Migrating',
    id: 20679,
  },
  {
    label: 'area.nectaring',
    value: 'Nectaring',
    id: 20680,
  },
  {
    label: 'area.mating',
    value: 'Mating',
    id: 20681,
  },

  {
    label: 'area.eggLayingHostplants',
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
    label: 'area.thistles',
    value: 'Thistles',
    id: 20683,
  },
  {
    icon: mallowImg,
    label: 'area.mallow',
    value: 'Mallow',
    id: 20684,
  },
  {
    icon: desertNettleImg,
    label: 'area.desertNettle',
    value: 'Desert nettle',
    id: 20685,
  },
  {
    icon: otherImg,
    label: 'common.other',
    value: 'Other',
    id: 20686,
  },
];

const directionValues = [
  { label: 'common.s', value: 'S', id: 20663 },
  { label: 'common.sw', value: 'SW', id: 20664 },
  { label: 'common.w', value: 'W', id: 20665 },
  { label: 'common.nw', value: 'NW', id: 20666 },
  { label: 'common.n', value: 'N', id: 20667 },
  { label: 'common.ne', value: 'NE', id: 20668 },
  { label: 'common.e', value: 'E', id: 20669 },
  { label: 'common.se', value: 'SE', id: 20670 },
];

const matingValues = [
  {
    label: 'area.territorialDefenceHill',
    value: 'Territorial defence: hill-topping',
    id: 20676,
  },
  {
    label: 'area.territorialDefenceOther',
    value: 'Territorial defence: other',
    id: 20677,
  },
  {
    label: 'area.mating',
    value: 'Mating',
    id: 20678,
  },
];

export const abundanceAttr = {
  ...abundanceAttrOrig,
  validation: { min: 0 },
  onChange: (val, _, { record }) => {
    if (val === null) return;

    record[abundanceAttr.id] = val;
    record.zeroAbundance = val === 0;
  },
} as const satisfies NumberInputConf;

const speciesConfig: Survey = {
  id: 645,
  name: 'precise-single-species-area',
  label: 'common.minSingleSpecies',

  smp: {
    create: ({ taxon, zeroAbundance, parent }) => {
      const subSample = coreSurvey.smp!.create!({
        taxon,
        zeroAbundance,
        parent,
        surveyId: speciesSurvey.id, // eslint-disable-line @typescript-eslint/no-use-before-define
        surveyName: speciesSurvey.name, // eslint-disable-line @typescript-eslint/no-use-before-define
      });

      subSample.occurrences[0].data.zeroAbundance = zeroAbundance;
      if (zeroAbundance) subSample.occurrences[0].data[abundanceAttr.id] = 0;

      return subSample;
    },

    occ: {
      attrs: {
        wing: {
          pageProps: {
            headerProps: { title: 'area.wingCondition' },
            attrProps: {
              input: 'checkbox',
              inputProps: { options: wingConditionValues },
            },
          },
          remote: {
            id: 977,
            values(wingValues: string[], submission: Submission) {
              const wingValueIDs = wingConditionValues
                .filter(({ value }) => wingValues.includes(value))
                .map(({ id }) => id);

              submission.values['occAttr:977'] = wingValueIDs;
            },
          },
        },

        behaviour: {
          menuProps: { icon: butterflyIcon, label: 'area.behaviour' },
          pageProps: {
            headerProps: { title: 'area.behaviour' },
            attrProps: {
              input: 'radio',
              set: (value: string | null, model: Occurrence) => {
                if (model.data.behaviour !== value) {
                  const resetValues = {
                    direction: undefined,
                    altitude: undefined,
                    nectarSource: undefined,
                    eggLaying: [],
                    otherEggLaying: undefined,
                    mating: undefined,
                    otherThistles: undefined,
                  };

                  Object.assign(model.data, resetValues);
                  Object.keys(resetValues).forEach(attr =>
                    model.parent!.parent!.locks.unset(
                      model.data.taxon.taxonGroupId,
                      'occ',
                      attr
                    )
                  );
                }

                model.data.behaviour = value ?? undefined;
                model.save();
              },
              inputProps: { options: behaviourValues },
            },
          },
          remote: { id: 978, values: behaviourValues },
        },

        direction: {
          menuProps: { icon: arrowBackOutline, label: 'area.direction' },
          pageProps: {
            headerProps: { title: 'area.direction' },
            attrProps: {
              input: 'radio',

              inputProps: { options: directionValues },
            },
          },
          remote: { id: 979, values: directionValues },
        },

        altitude: {
          menuProps: {
            label: 'area.height',
            icon: resizeOutline,
            parse: (value: string) => `${value} m`,
          },
          pageProps: {
            headerProps: { title: 'area.heightAboveGround' },
            attrProps: {
              input: 'radio',
              inputProps: { options: altitudeValues },
            },
          },
          remote: { id: 980, values: altitudeValues },
        },

        mating: {
          menuProps: { icon: butterflyIcon, label: 'area.mating' },
          pageProps: {
            headerProps: { title: 'area.mating' },
            attrProps: {
              input: 'radio',
              inputProps: { options: matingValues },
            },
          },
          remote: { id: 981, values: matingValues },
        },

        nectarSource: {
          menuProps: { icon: flowerOutline, label: 'area.nectar' },
          pageProps: {
            headerProps: { title: 'area.nectarSource' },
            attrProps: {
              input: 'textarea',
              inputProps: {
                placeholder: 'area.enterNectarSource',
              },
            },
          },
          remote: { id: 976 },
        },

        eggLaying: {
          menuProps: {
            icon: caterpillarIcon,
            label: 'area.hostplants',
            parse: translateEggLayingValue,
          },
          pageProps: {
            headerProps: { title: 'area.hostplants' },
            attrProps: {
              input: 'checkbox',
              inputProps: { options: flowersValues },
              set: (value: string[], model: Occurrence) => {
                if (model.data.otherEggLaying && !value.includes('Other')) {
                  delete model.data.otherEggLaying;
                }

                if (model.data.otherThistles && !value.includes('Thistles')) {
                  delete model.data.otherThistles;
                }

                model.data.eggLaying = value;
                model.save();
              },
            },
          },

          remote: {
            id: 982,
            values(flowerValue: string[], submission: Submission) {
              const flowersIDs = flowersValues
                .filter(({ value }) => flowerValue.includes(value))
                .map(({ id }) => id);

              submission.values['occAttr:982'] = flowersIDs;
            },
          },
        },

        otherEggLaying: {
          menuProps: {
            icon: caterpillarIcon,
            label: 'area.otherSpecies',
          },
          pageProps: {
            headerProps: { title: 'area.otherSpecies' },
            attrProps: {
              input: 'textarea',
              inputProps: {
                placeholder: 'area.otherHostplant',
              },
            },
          },
          remote: { id: 983 },
        },

        otherThistles: {
          menuProps: {
            icon: caterpillarIcon,
            label: 'common.thistleSpecies',
          },
          pageProps: {
            headerProps: { title: 'common.thistleSpecies' },
            attrProps: {
              input: 'textarea',
              inputProps: {
                placeholder: 'area.whatKindThistle',
              },
            },
          },
          remote: { id: 984 },
        },
      },
    },
  },

  verify(_, model) {
    if (!model.data.surveyStartTime) return undefined;
    return z
      .object({
        data: areaCountSchema,
        samples: z
          .array(z.object({}), {
            error: 'area.pleaseAddTarget',
          })
          .min(1, 'area.pleaseAddTarget'),
      })
      .safeParse(model).error;
  },

  create: ({ hasGPSPermission }) => {
    const sample = coreSurvey.create!({
      surveyId: speciesSurvey.id, // eslint-disable-line @typescript-eslint/no-use-before-define
      surveyName: speciesSurvey.name, // eslint-disable-line @typescript-eslint/no-use-before-define
      hasGPSPermission,
    });

    return sample;
  },
};

const speciesSurvey: Survey = merge({}, coreSurvey, speciesConfig);

export default speciesSurvey;
