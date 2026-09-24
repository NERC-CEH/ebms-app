import {
  chatboxOutline,
  cloudyOutline,
  thermometerOutline,
} from 'ionicons/icons';
import { z, type ZodError } from 'zod';
import {
  RemoteConfig,
  MenuAttrItemFromModelMenuProps,
  PageProps,
  timeFormat,
  BlockT,
  inferBlockType,
  TextInputConf,
  dateFormatISO,
  type SampleSubmission as Submission,
} from '@flumens';
import { IonIcon } from '@ionic/react';
import groups from 'common/data/groups';
import caterpillarIcon from 'common/images/caterpillar.svg';
import windIcon from 'common/images/wind.svg';
import Location from 'common/models/location';
import Occurrence, { Taxon } from 'common/models/occurrence';
import Media from 'models/media';
import Sample from 'models/sample';

export const appVersionAttr = { id: 'smpAttr:1139' } as const;

export const temperatureValues = [
  {
    value: '',
    label: 'survey.notRecordedNo',
    isDefault: true,
    id: 20167,
  },
  { value: '-10', id: 24882 },
  { value: '-9', id: 24883 },
  { value: '-8', id: 24884 },
  { value: '-7', id: 24885 },
  { value: '-6', id: 24886 },
  { value: '-5', id: 24887 },
  { value: '-4', id: 24888 },
  { value: '-3', id: 24889 },
  { value: '-2', id: 24891 },
  { value: '-1', id: 24890 },
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
  menuProps: { icon: thermometerOutline, label: 'common.temperature' },
  pageProps: {
    headerProps: { title: 'common.temperature' },
    attrProps: {
      input: 'radio',
      info: 'common.temperatureRequired',
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
  { value: '', label: 'survey.notRecordedNo', id: 2460, isDefault: true },
  { label: 'common.s', value: 'S', id: 2461 },
  { label: 'common.sw', value: 'SW', id: 2462 },
  { label: 'common.w', value: 'W', id: 2463 },
  { label: 'common.nw', value: 'NW', id: 2464 },
  { label: 'common.n', value: 'N', id: 2465 },
  { label: 'common.ne', value: 'NE', id: 2466 },
  { label: 'common.e', value: 'E', id: 2467 },
  { label: 'common.se', value: 'SE', id: 2468 },
  { label: 'survey.noDirection', value: 'No direction', id: 2469 },
];

export const windDirectionAttr = {
  menuProps: { label: 'common.windDirection', icon: windIcon },
  pageProps: {
    headerProps: { title: 'common.windDirection' },
    attrProps: {
      input: 'radio',
      info: 'common.pleaseSpecifyWind',
      inputProps: { options: windDirectionValues },
    },
  },
  remote: { id: 1389, values: windDirectionValues },
} as const satisfies AttrConfig;

export const windSpeedValues = [
  { value: '', label: 'survey.notRecordedNo', id: 2459, isDefault: true },
  {
    label: 'common.smokeRisesVertically',
    value: 'Smoke rises vertically',
    id: 2606,
  },
  { label: 'common.slightSmokeDrift', value: 'Slight smoke drift', id: 2453 },
  {
    label: 'common.windFeltFace',
    value: 'Wind felt on face, leaves rustle',
    id: 2454,
  },
  {
    label: 'common.leavesTwigsSlight',
    value: 'Leaves and twigs in slight motion',
    id: 2455,
  },
  {
    label: 'common.dustRaisedSmall',
    value: 'Dust raised and small branches move',
    id: 2456,
  },
  {
    label: 'common.smallTreesLeaf',
    value: 'Small trees in leaf begin to sway',
    id: 2457,
  },
  {
    label: 'common.largeBranchesMove',
    value: 'Large branches move and trees sway',
    id: 2458,
  },
];

export const windSpeedAttr = {
  menuProps: { label: 'common.windSpeed', icon: windIcon },
  pageProps: {
    headerProps: { title: 'common.windSpeed' },
    attrProps: {
      input: 'radio',
      info: 'common.pleaseSpecifyWindSpeed',
      inputProps: { options: windSpeedValues },
    },
  },
  remote: { id: 1390, values: windSpeedValues },
} as const satisfies AttrConfig;

/** @deprecated */
export const commentAttrOld = {
  id: 'comment',
  menuProps: {
    icon: chatboxOutline,
    label: 'common.comment',
    skipValueTranslation: true,
  },
  pageProps: {
    headerProps: { title: 'common.comment' },
    attrProps: {
      input: 'textarea',
      info: 'survey.pleaseAddAny',
    },
  },
} as const;

export const commentAttr = {
  id: 'comment',
  title: 'common.comment',
  type: 'textInput',
  appearance: 'multiline',
} as const satisfies TextInputConf;

export const taxonAttr = {
  remote: {
    id: 'taxa_taxon_list_id',
    values: (taxon: Taxon) => taxon.warehouseId,
  },
} as const;

/** @deprecated */
export const backwardsTimeFormat = (date: number | string) => {
  // return if matches time format already (for backwards compatibility, can be removed in the future when all values are in correct format)
  const timeFormatRegex = /^\d{2}:\d{2}$/;
  if (timeFormatRegex.test(String(date))) return date;
  return timeFormat.format(new Date(date));
};

/** @deprecated */
export const backwardsDateFormat = (date: number | string) =>
  dateFormatISO.format(new Date(date)); // for backwards compatibility, remove later

export const surveyStartTimeAttr = {
  menuProps: { label: 'common.startTime' },
  pageProps: {
    headerProps: { title: 'common.startTime' },
    attrProps: {
      input: 'time',
      inputProps: {
        presentation: 'time',
      },
    },
  },
  remote: { id: 1385, values: backwardsTimeFormat },
} as const;

export const surveyEndTimeAttr = {
  menuProps: { label: 'common.endTime' },
  pageProps: {
    headerProps: { title: 'common.endTime' },
    attrProps: {
      input: 'time',
      inputProps: {
        presentation: 'time',
      },
    },
  },
  remote: { id: 1386, values: backwardsTimeFormat },
} as const;

export const dateAttr = {
  id: 'date',
  remote: { values: backwardsDateFormat },
} as const;

export const guidAttr = {
  id: 'smpAttr:2021',
  type: 'textInput',
  // eslint-disable-next-line local/valid-trans-key
  title: 'GUID',
  container: 'inline',
  prefix: <IonIcon icon={chatboxOutline} className="size-6" />,
  className: '[&>div>div>input]:text-right',
} as const satisfies TextInputConf;

export const areaSizeAttr = { id: 'smpAttr:723' } as const;

export const areaCountSchema = z.object({
  location: z
    .object(
      {
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
        shape: z.object({}).nullable().optional(),
      },
      { error: 'common.locationMissing' }
    )
    .refine(
      val =>
        Number.isFinite(val.latitude) &&
        Number.isFinite(val.longitude) &&
        val.shape,
      'common.locationMissing'
    ),

  [areaSizeAttr.id]: z
    .number({ error: 'survey.pleaseAddSurvey' })
    .min(1, 'survey.pleaseAddSurvey')
    .max(20000000, 'survey.pleaseSelectSmaller'),

  surveyStartTime: z
    .string({ error: 'common.dateMissing' })
    .min(1, 'common.dateMissing'),
});

const stageValues = [
  { value: null, isDefault: true, label: 'survey.notRecorded' },
  { label: 'common.adult', value: 'Adult', id: 3929 },
  { label: 'survey.egg', value: 'Egg', id: 3932 },
  { label: 'survey.larva', value: 'Larva', id: 3931 },
  { label: 'survey.larvalWeb', value: 'Larval web', id: 14079 },
  { label: 'survey.pupa', value: 'Pupa', id: 3930 },
];

const dragonflyStageValues = [
  { label: 'common.adult', value: 'Adult', id: 5703 },
  {
    label: 'survey.copulatingTandemPairs',
    value: 'Copulating or tandem pairs',
    id: 5704,
  },
  { label: 'survey.ovipositing', value: 'Ovipositing', id: 5705 },
  { label: 'survey.larvae', value: 'Larvae', id: 5706 },
  { label: 'survey.exuviae', value: 'Exuviae', id: 5707 },
  { label: 'survey.emergent', value: 'Emergent', id: 5708 },
];

export const dragonflyStageAttr = {
  menuProps: { icon: caterpillarIcon },
  pageProps: {
    headerProps: { title: 'common.stage' },
    attrProps: {
      input: 'radio',
      info: 'survey.pickLifeStage',
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
      info: 'survey.pickLifeStage',
      set: (value: string | null, model: Occurrence) => {
        if (model.data.stage !== value && model.parent!.isPaintedLadySurvey()) {
          Object.assign(model.data, {
            otherThistles: undefined,
            wing: [],
            behaviour: undefined,
            direction: undefined,
            nectarSource: undefined,
            eggLaying: [],
            otherEggLaying: undefined,
            mating: undefined,
          });
        }
        model.data.stage = value ?? undefined;
        model.save();
      },
      onChange: () => window.history.back(),
      inputProps: { options: stageValues },
    },
  },
  remote: { id: 293, values: stageValues },
} as const;

export const cloudAttr = {
  menuProps: { icon: cloudyOutline, label: 'common.cloud' },
  pageProps: {
    headerProps: { title: 'common.cloud' },
    attrProps: {
      input: 'slider',
      info: 'common.pleaseSpecifyCloud',
      inputProps: { max: 100, min: 0 },
    },
  },
  remote: { id: 1457 },
} as const;

type MenuProps = MenuAttrItemFromModelMenuProps;

export type BlockOrFn = BlockT | ((record?: Sample | Occurrence) => BlockT);

export type AttrConfig = {
  menuProps?: MenuProps;
  pageProps?: Omit<PageProps, 'attr' | 'model'>;
  block?: BlockOrFn;
  remote?: RemoteConfig;
};

type Attrs = Record<string, AttrConfig>;

type OccurrenceCreateOptions = {
  taxon: Taxon;
  sample?: Sample<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  identifier?: string;
  photo?: Media;
};

export type { Submission };

type OccurrenceConfig = {
  render?: BlockT[] | ((model: Occurrence) => BlockT[]);
  attrs: Attrs;
  create?: (options: OccurrenceCreateOptions) => Occurrence;
  verify?: (attrs: Record<string, unknown>) => ZodError | undefined;
  modifySubmission?: (submission: Submission, model: Occurrence) => Submission;
  /**
   * Set to true if multi-species surveys shouldn't auto-increment it to 1 when adding to lists.
   */
  skipAutoIncrement?: boolean;
};

type SampleCreateOptions = {
  taxon?: Taxon;
  parent?: Sample;
  surveyId?: number;
  surveyName?: string;
  skipGPS?: boolean;
  hasGPSPermission?: boolean;
  recorder?: string;
  location?: Location;
  zeroAbundance?: boolean;
};

export type SampleConfig = {
  render?: BlockT[] | ((model: Sample) => BlockT[]);
  attrs?: Attrs;
  create?: (options: SampleCreateOptions) => Sample;
  verify?: (
    attrs: Record<string, unknown>,
    model: Sample
  ) => ZodError | undefined;
  modifySubmission?: (submission: Submission, model: Sample) => Submission;
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
