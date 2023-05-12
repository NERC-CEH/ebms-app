import * as Yup from 'yup';
import { date as dateHelp } from '@flumens';
import { chatboxOutline } from 'ionicons/icons';
import caterpillarIcon from 'common/images/caterpillar.svg';
import groups from 'common/helpers/groups';
import Occurrence, { Taxon } from 'common/models/occurrence';
import Sample from 'models/sample';
import appModel, { DEFAULT_SPECIES_GROUP } from 'models/app';

export const deviceAttr = {
  remote: {
    id: 922,
    values: {
      iOS: 2398, // TODO: remove once all old samples uploaded
      ios: 2398,
      Android: 2399, // TODO: remove once all old samples uploaded
      android: 2399,
    },
  },
};

export const deviceVersionAttr = {
  remote: { id: 759 } /* TODO: remove once all old samples uploaded */,
};

export const appVersionAttr = { remote: { id: 1139 } };

const temperatureValues = [
  {
    value: '',
    label: 'Not recorded/no data',
    isDefault: true,
    id: 20167,
  },
  { value: '-0', id: 20124 },
  { value: 0, id: 20166 },
  { value: 1, id: 20125 },
  { value: 2, id: 20126 },
  { value: 3, id: 20127 },
  { value: 4, id: 20128 },
  { value: 5, id: 20129 },
  { value: 6, id: 20130 },
  { value: 7, id: 20131 },
  { value: 8, id: 20132 },
  { value: 9, id: 20133 },
  { value: 10, id: 20134 },
  { value: 11, id: 20135 },
  { value: 12, id: 20136 },
  { value: 13, id: 20137 },
  { value: 14, id: 20138 },
  { value: 15, id: 20139 },
  { value: 16, id: 20140 },
  { value: 17, id: 20141 },
  { value: 18, id: 20142 },
  { value: 19, id: 20143 },
  { value: 20, id: 20144 },
  { value: 21, id: 20145 },
  { value: 22, id: 20146 },
  { value: 23, id: 20147 },
  { value: 24, id: 20148 },
  { value: 25, id: 20149 },
  { value: 26, id: 20150 },
  { value: 27, id: 20151 },
  { value: 28, id: 20152 },
  { value: 29, id: 20153 },
  { value: 30, id: 20154 },
  { value: 31, id: 20155 },
  { value: 32, id: 20156 },
  { value: 33, id: 20157 },
  { value: 34, id: 20158 },
  { value: 35, id: 20159 },
  { value: 36, id: 20160 },
  { value: 37, id: 20161 },
  { value: 38, id: 20162 },
  { value: 39, id: 20163 },
  { value: 40, id: 20165 },
  { value: '40+', id: 20164 },
];

export const temperatureAttr = {
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please specify the temperature C°.',
      inputProps: { options: temperatureValues },
    },
  },
  remote: { id: 1660, values: temperatureValues },
};

const DAY_FLYING_MOTHS = 'day-flying-moths';
const MOTHS = 'moths';

const speciesGroupsValues = [
  { value: 'moths', id: 20647 },
  { value: 'butterflies', id: 20648 },
  { value: 'dragonflies', id: 20649 },
  { value: 'bumblebees', id: 20650 },
];

export const speciesGroupsAttr = {
  pageProps: {
    attrProps: {
      input: 'checkbox',
      set: (newValues: string[], model: Sample) => {
        const hasMothGroup = newValues.includes(MOTHS);
        const hasDayFlyingMothGroup = newValues.includes(DAY_FLYING_MOTHS);

        // eslint-disable-next-line no-param-reassign
        newValues = newValues.filter(
          (group: string) => group !== DAY_FLYING_MOTHS
        );

        appModel.attrs.useDayFlyingMothsOnly =
          hasMothGroup && hasDayFlyingMothGroup;

        // eslint-disable-next-line no-param-reassign
        model.metadata.useDayFlyingMothsOnly =
          hasMothGroup && hasDayFlyingMothGroup;

        // eslint-disable-next-line no-param-reassign
        model.metadata.speciesGroups = newValues;
        model.save();

        appModel.attrs.speciesGroups = model.metadata.speciesGroups;
        appModel.save();

        if (!appModel.attrs.speciesGroups.length) {
          // eslint-disable-next-line no-param-reassign
          model.metadata.speciesGroups = DEFAULT_SPECIES_GROUP;
          model.save();
        }
      },

      get: (model: Sample) => {
        const speciesGroups = [...model.metadata.speciesGroups];
        if (model.metadata.useDayFlyingMothsOnly) {
          speciesGroups.push(DAY_FLYING_MOTHS);
        }

        return speciesGroups;
      },

      inputProps: (model: Sample) => {
        const groupOption = ([value, { label, icon }]: any) => {
          const disabled = model.metadata.saved;

          return {
            icon,
            value,
            label,
            disabled,
          };
        };

        const options: any = Object.entries(groups).map(groupOption);

        if (model.metadata.speciesGroups?.includes('moths')) {
          options.splice(2, 0, {
            value: DAY_FLYING_MOTHS,
            label: 'Use only day-flying moths',
            className: 'checkbox-subEntry',
            disabled: model.metadata.saved,
          });
        }

        return { options };
      },
    },
  },

  remote: {
    id: 1735,
    values(speciesGroups: any, submission: any) {
      // eslint-disable-next-line
      submission.values = {
        ...submission.values,
      };

      const bySameGroup = (spGroupObject: any) =>
        speciesGroups.includes(spGroupObject.value);
      const extractID = (obj: any) => obj.id;

      const speciesGroupsID = speciesGroupsValues
        .filter(bySameGroup)
        .map(extractID);

      // eslint-disable-next-line no-param-reassign
      submission.values['smpAttr:1735'] = speciesGroupsID;
    },
  },
};

const windDirectionValues = [
  { value: '', label: 'Not recorded/no data', id: 2460, isDefault: true },
  { value: 'S', id: 2461 },
  { value: 'SW', id: 2462 },
  { value: 'W', id: 2463 },
  { value: 'NW', id: 2464 },
  { value: 'N', id: 2465 },
  { value: 'NE', id: 2466 },
  { value: 'E', id: 2467 },
  { value: 'SE', id: 2468 },
  { value: 'No direction', id: 2469 },
];

export const windDirectionAttr = {
  menuProps: { label: 'Wind Direction' },
  pageProps: {
    headerProps: { title: 'Wind Direction' },
    attrProps: {
      input: 'radio',
      info: 'Please specify the wind direction.',
      inputProps: { options: windDirectionValues },
    },
  },
  remote: { id: 1389, values: windDirectionValues },
};

const windSpeedValues = [
  { value: '', label: 'Not recorded/no data', id: 2459, isDefault: true },
  { value: 'Smoke rises vertically', id: 2606 },
  { value: 'Slight smoke drift', id: 2453 },
  { value: 'Wind felt on face, leaves rustle', id: 2454 },
  { value: 'Leaves and twigs in slight motion', id: 2455 },
  { value: 'Dust raised and small branches move', id: 2456 },
  { value: 'Small trees in leaf begin to sway', id: 2457 },
  { value: 'Large branches move and trees sway', id: 2458 },
];

export const windSpeedAttr = {
  menuProps: { label: 'Wind Speed' },
  pageProps: {
    headerProps: { title: 'Wind Speed' },
    attrProps: {
      input: 'radio',
      info: 'Please specify the wind speed.',
      inputProps: { options: windSpeedValues },
    },
  },
  remote: { id: 1390, values: windSpeedValues },
};

export const commentAttr = {
  menuProps: { icon: chatboxOutline, skipValueTranslation: true },
  pageProps: {
    attrProps: {
      input: 'textarea',
      info: 'Please add any extra info about this record.',
    },
  },
};

export const cloudAttr = {
  pageProps: {
    attrProps: {
      input: 'slider',
      info: 'Please specify the % of cloud cover.',
      set: (value: any, model: any) => {
        // eslint-disable-next-line no-param-reassign
        model.attrs.sun = 100 - value;
        // eslint-disable-next-line no-param-reassign
        model.attrs.cloud = value;
        model.save();
      },
      inputProps: { max: 100, min: 0 },
    },
  },
  remote: { id: 1457 },
};

export const sunAttr = {
  remote: { id: 1387 },
};

export const taxonAttr = {
  remote: {
    id: 'taxa_taxon_list_id',
    values: (taxon: Taxon) => taxon.warehouse_id,
  },
};

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

export const surveyStartTimeAttr = {
  menuProps: { label: 'Start Time' },
  pageProps: {
    headerProps: { title: 'Start Time' },
    attrProps: {
      input: 'time',
      inputProps: {
        presentation: 'time',
      },
    },
  },
  remote: {
    id: 1385,
    values: (date: number) => dateTimeFormat.format(new Date(date)),
  },
};

export const surveyEndTimeAttr = {
  menuProps: { label: 'End Time' },
  pageProps: {
    headerProps: { title: 'End Time' },
    attrProps: {
      input: 'time',
      inputProps: {
        presentation: 'time',
      },
    },
  },
  remote: {
    id: 1386,
    values: (date: number) => dateTimeFormat.format(new Date(date)),
  },
};

export const dateAttr = {
  isValid: (val: any) => val && val.toString() !== 'Invalid Date', // TODO: needed?
  pageProps: {
    attrProps: {
      input: 'date',
      inputProps: { max: () => new Date() },
    },
  },
  remote: { values: (date: number) => dateHelp.print(date, false) },
};

const locationSchema = Yup.object().shape({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
  area: Yup.number()
    .min(1, 'Please add survey area information.')
    .max(20000000, 'Please select a smaller area.')
    .required(),
  shape: Yup.object().required(),
  source: Yup.string().required('Please add survey area information.'),
});

const validateLocation = (val: any) => {
  if (!val) {
    return false;
  }

  locationSchema.validateSync(val);
  return true;
};

export const areaCountSchema = Yup.object().shape({
  location: Yup.mixed().test(
    'area',
    'Please add survey area information.',
    validateLocation
  ),

  surveyStartTime: Yup.date().required('Date is missing'),
  location_type: Yup.string()
    .matches(/latlon/)
    .required('Location type is missing'),
});

const stageValues = [
  { value: null, isDefault: true, label: 'Not Recorded' },
  { value: 'Adult', id: 3929 },
  { value: 'Egg', id: 3932 },
  { value: 'Larva', id: 3931 },
  { value: 'Larval web', id: 14079 },
  { value: 'Pupa', id: 3930 },
];

export const stageAttr = {
  menuProps: { icon: caterpillarIcon },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Pick the life stage',
      set: (value: any, model: Occurrence) => {
        if (model.attrs.stage !== value && model.parent.isPaintedLadySurvey()) {
          // eslint-disable-next-line no-param-reassign
          model.attrs.eggLaying = null;
          // eslint-disable-next-line no-param-reassign
          model.attrs.otherThistles = null;
          // eslint-disable-next-line no-param-reassign
          model.attrs.otherEggLaying = null;
          // eslint-disable-next-line no-param-reassign
          model.attrs.wing = [];
          // eslint-disable-next-line no-param-reassign
          model.attrs.behaviour = null;
          // eslint-disable-next-line no-param-reassign
          model.attrs.direction = null;
          // eslint-disable-next-line no-param-reassign
          model.attrs.nectarSource = null;
          // eslint-disable-next-line no-param-reassign
          model.attrs.eggLaying = [];
          // eslint-disable-next-line no-param-reassign
          model.attrs.otherEggLaying = null;
          // eslint-disable-next-line no-param-reassign
          model.attrs.mating = null;
        }

        // eslint-disable-next-line no-param-reassign
        model.attrs.stage = value;
        model.save();
      },
      onChange: () => window.history.back(),
      inputProps: { options: stageValues },
    },
  },
  remote: { id: 293, values: stageValues },
};
