import {
  chatboxOutline,
  cloudyOutline,
  thermometerOutline,
} from 'ionicons/icons';
import { z } from 'zod';
import {
  RemoteConfig,
  MenuAttrItemFromModelMenuProps,
  PageProps,
  timeFormat,
  dateFormat,
} from '@flumens';
import groups from 'common/data/groups';
import caterpillarIcon from 'common/images/caterpillar.svg';
import windIcon from 'common/images/wind.svg';
import Occurrence, { Taxon } from 'common/models/occurrence';
import appModel, { DEFAULT_SPECIES_GROUP } from 'models/app';
import Media from 'models/media';
import Sample from 'models/sample';

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

export const temperatureValues = [
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
  menuProps: { icon: thermometerOutline, label: 'Temperature' },
  pageProps: {
    headerProps: { title: 'Temperature' },
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

        appModel.data.useDayFlyingMothsOnly =
          hasMothGroup && hasDayFlyingMothGroup;

        // eslint-disable-next-line no-param-reassign
        model.metadata.useDayFlyingMothsOnly =
          hasMothGroup && hasDayFlyingMothGroup;

        // eslint-disable-next-line no-param-reassign
        model.metadata.speciesGroups = newValues;
        model.save();

        appModel.data.speciesGroups = model.metadata.speciesGroups;
        appModel.save();

        if (!appModel.data.speciesGroups.length) {
          // eslint-disable-next-line no-param-reassign
          model.metadata.speciesGroups = DEFAULT_SPECIES_GROUP;
          model.save();
        }
      },

      get: (model: Sample) => {
        const speciesGroups = [...model.metadata.speciesGroups!];
        if (model.metadata.useDayFlyingMothsOnly) {
          speciesGroups.push(DAY_FLYING_MOTHS);
        }

        return speciesGroups;
      },

      inputProps: (model: Sample) => {
        const groupOption = ([value, { label, prefix }]: any) => {
          const disabled = model.metadata.saved;

          return { prefix, value, label, disabled };
        };

        const options: any = Object.entries(groups).map(groupOption);

        if (model.metadata.speciesGroups?.includes('moths')) {
          options.splice(2, 0, {
            value: DAY_FLYING_MOTHS,
            label: 'Use only day-flying moths',
            className: 'w-[85%] ml-auto',
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

export const windDirectionValues = [
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
  menuProps: { label: 'Wind Direction', icon: windIcon },
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

export const windSpeedValues = [
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
  menuProps: { label: 'Wind Speed', icon: windIcon },
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

export const taxonAttr = {
  remote: {
    id: 'taxa_taxon_list_id',
    values: (taxon: Taxon) => taxon.warehouse_id,
  },
};

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
    values: (date: number) => timeFormat.format(new Date(date)),
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
    values: (date: number) => timeFormat.format(new Date(date)),
  },
};

export const dateAttr = {
  remote: { values: (date: number) => dateFormat.format(new Date(date)) },
};

export const areaCountSchema = z.object({
  location: z
    .object(
      {
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
        shape: z.object({}).nullable().optional(),
        area: z
          .number({ required_error: 'Please add survey area information.' })
          .min(1, 'Please add survey area information.')
          .max(20000000, 'Please select a smaller area.'),
      },
      { required_error: 'Location is missing.' }
    )
    .refine(
      (val: any) =>
        Number.isFinite(val.latitude) &&
        Number.isFinite(val.longitude) &&
        val.shape,
      'Location is missing.'
    ),

  surveyStartTime: z
    .string({ required_error: 'Date is missing' })
    .min(1, 'Date is missing'),
});

const stageValues = [
  { value: null, isDefault: true, label: 'Not Recorded' },
  { value: 'Adult', id: 3929 },
  { value: 'Egg', id: 3932 },
  { value: 'Larva', id: 3931 },
  { value: 'Larval web', id: 14079 },
  { value: 'Pupa', id: 3930 },
];

const dragonflyStageValues = [
  { value: 'Adult', id: 5703 },
  { value: 'Copulating or tandem pairs', id: 5704 },
  { value: 'Ovipositing', id: 5705 },
  { value: 'Larvae', id: 5706 },
  { value: 'Exuviae', id: 5707 },
  { value: 'Emergent', id: 5708 },
];

export const dragonflyStageAttr = {
  menuProps: { icon: caterpillarIcon },
  pageProps: {
    headerProps: { title: 'Stage' },
    attrProps: {
      input: 'radio',
      info: 'Pick the life stage',
      inputProps: { options: dragonflyStageValues },
    },
  },
  remote: { id: 988, values: dragonflyStageValues },
};

export const stageAttr = {
  menuProps: { icon: caterpillarIcon },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Pick the life stage',
      set: (value: any, model: Occurrence) => {
        if (model.data.stage !== value && model.parent!.isPaintedLadySurvey()) {
          // eslint-disable-next-line no-param-reassign
          model.data.eggLaying = null;
          // eslint-disable-next-line no-param-reassign
          model.data.otherThistles = null;
          // eslint-disable-next-line no-param-reassign
          model.data.otherEggLaying = null;
          // eslint-disable-next-line no-param-reassign
          model.data.wing = [];
          // eslint-disable-next-line no-param-reassign
          model.data.behaviour = null;
          // eslint-disable-next-line no-param-reassign
          model.data.direction = null;
          // eslint-disable-next-line no-param-reassign
          model.data.nectarSource = null;
          // eslint-disable-next-line no-param-reassign
          model.data.eggLaying = [];
          // eslint-disable-next-line no-param-reassign
          model.data.otherEggLaying = null;
          // eslint-disable-next-line no-param-reassign
          model.data.mating = null;
        }

        // eslint-disable-next-line no-param-reassign
        model.data.stage = value;
        model.save();
      },
      onChange: () => window.history.back(),
      inputProps: { options: stageValues },
    },
  },
  remote: { id: 293, values: stageValues },
};

export const cloudAttr = {
  menuProps: { icon: cloudyOutline, label: 'Cloud' },
  pageProps: {
    headerProps: { title: 'Cloud' },
    attrProps: {
      input: 'slider',
      info: 'Please specify the % of cloud cover.',
      inputProps: { max: 100, min: 0 },
    },
  },
  remote: { id: 1457 },
};

type MenuProps = MenuAttrItemFromModelMenuProps;

export type AttrConfig = {
  menuProps?: MenuProps;
  pageProps?: Omit<PageProps, 'attr' | 'model'>;
  remote?: RemoteConfig;
};

interface Attrs {
  [key: string]: AttrConfig;
}

type OccurrenceCreateOptions = {
  Occurrence: typeof Occurrence;
  taxon: Taxon;
  identifier?: string;
  photo?: Media;
};

type OccurrenceConfig = {
  render?: any[] | ((model: Occurrence) => any[]);
  attrs: Attrs;
  create?: (options: OccurrenceCreateOptions) => Occurrence;
  verify?: (attrs: any) => any;
  modifySubmission?: (submission: any, model: any) => any;
  /**
   * Set to true if multi-species surveys shouldn't auto-increment it to 1 when adding to lists.
   */
  skipAutoIncrement?: boolean;
};

type SampleCreateOptions = {
  Sample: typeof Sample;
  Occurrence?: typeof Occurrence;
  taxon?: Taxon;
  surveySample?: Sample;
  surveyId?: number;
  surveyName?: string;
  skipGPS?: boolean;
  hasGPSPermission?: boolean;
  recorder?: string;
  location?: any;
  zeroAbundance?: any;
};

export type SampleConfig = {
  render?: any[] | ((model: Sample) => any[]);
  attrs?: Attrs;
  create?: (options: SampleCreateOptions) => Sample;
  verify?: (attrs: any, model: any) => any;
  modifySubmission?: (submission: any, model: any) => any;
  smp?: SampleConfig;
  occ?: OccurrenceConfig;
};

export interface Survey extends SampleConfig {
  /**
   * Remote warehouse survey ID.
   */
  id: number;
  /**
   * In-App survey code name.
   */
  name: string;
  /**
   * Pretty survey name to show in the UI.
   */
  label?: string;
  deprecated?: boolean;
  /**
   * Remote website survey edit page path.
   */
  webForm?: string;

  /** ? */
  metadata?: {
    speciesGroups: any;
  };
}
