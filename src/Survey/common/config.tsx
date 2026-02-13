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
  BlockT,
  inferBlockType,
} from '@flumens';
import groups from 'common/data/groups';
import caterpillarIcon from 'common/images/caterpillar.svg';
import windIcon from 'common/images/wind.svg';
import Occurrence, { Taxon } from 'common/models/occurrence';
import Media from 'models/media';
import Sample from 'models/sample';

export const appVersionAttr = { id: 'smpAttr:1139' } as const;

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
} as const satisfies AttrConfig;

export const speciesGroupsAttr = {
  remote: {
    id: 1735,
    values(speciesGroups: number[]) {
      return Object.values(groups)
        .filter(({ id }) => speciesGroups.includes(id))
        .map(({ attributeId }) => attributeId);
    },
  },
} as const satisfies AttrConfig;

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
} as const satisfies AttrConfig;

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
} as const satisfies AttrConfig;

export const commentAttr = {
  id: 'comment',
  menuProps: { icon: chatboxOutline, skipValueTranslation: true },
  pageProps: {
    attrProps: {
      input: 'textarea',
      info: 'Please add any extra info about this record.',
    },
  },
} as const;

export const taxonAttr = {
  remote: {
    id: 'taxa_taxon_list_id',
    values: (taxon: Taxon) => taxon.warehouseId,
  },
} as const;

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
} as const;

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
} as const;

export const dateAttr = {
  id: 'date',
  remote: { values: (date: number) => dateFormat.format(new Date(date)) },
} as const;

export const areaCountSchema = z.object({
  location: z
    .object(
      {
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
        shape: z.object({}).nullable().optional(),
        area: z
          .number({ error: 'Please add survey area information.' })
          .min(1, 'Please add survey area information.')
          .max(20000000, 'Please select a smaller area.'),
      },
      { error: 'Location is missing.' }
    )
    .refine(
      (val: any) =>
        Number.isFinite(val.latitude) &&
        Number.isFinite(val.longitude) &&
        val.shape,
      'Location is missing.'
    ),

  surveyStartTime: z
    .string({ error: 'Date is missing' })
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
} as const;

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
} as const;

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
} as const;

type MenuProps = MenuAttrItemFromModelMenuProps;

export type BlockOrFn = BlockT | ((record?: any) => BlockT);

export type AttrConfig = {
  menuProps?: MenuProps;
  pageProps?: Omit<PageProps, 'attr' | 'model'>;
  block?: BlockOrFn;
  remote?: RemoteConfig;
};

type Attrs = Record<string, AttrConfig>;

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

export type Survey = {
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
} & SampleConfig;

/**
 * utility type that transforms a record of block configurations
 * into a record of their corresponding value types
 *
 * @example
 * type Config = {
 *   'smpAttr:123': { block: NumberInputConf };
 *   'smpAttr:456': { block: TextInputConf };
 *   'other': { something: string }; // returns unknown
 * };
 * type Result = inferAttrConfigTypes<Config>;
 * // Result = { 'smpAttr:123': number; 'smpAttr:456': string; 'other': unknown }
 */
export type inferAttrConfigTypes<T extends Record<string, unknown>> = {
  -readonly [K in keyof T]: T[K] extends { block: infer B extends BlockT }
    ? inferBlockType<B>
    : unknown;
};
