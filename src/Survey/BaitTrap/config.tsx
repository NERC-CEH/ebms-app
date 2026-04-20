import {
  calendarOutline,
  clipboardOutline,
  cloudyOutline,
  codeOutline,
  documentTextOutline,
  fishOutline,
  flagOutline,
  informationCircleOutline,
  layersOutline,
  leafOutline,
  maleOutline,
  nutritionOutline,
  peopleOutline,
  refreshOutline,
  resizeOutline,
  thermometerOutline,
  timeOutline,
  waterOutline,
} from 'ionicons/icons';
import { z } from 'zod';
import {
  ChoiceInputConf,
  dateFormat,
  NumberInputConf,
  OccurrenceData,
  SampleData,
  TextInputConf,
  timeFormat,
  YesNoInputConf,
} from '@flumens';
import { IonIcon } from '@ionic/react';
import config from 'common/config';
import mothTrap from 'common/images/moth-inside-icon.svg';
import Occurrence, { Taxon } from 'common/models/occurrence';
import Sample from 'common/models/sample';
import appModel from 'models/app';
import { Data as LocationData } from 'models/location';
import {
  Survey,
  appVersionAttr,
  commentAttr,
  dateAttr,
  inferAttrConfigTypes,
} from 'Survey/common/config';

const FIELD_CODE_REGEX = /^[A-Z]\d{1,2}$/;

const mothTrapIcon = (<IonIcon src={mothTrap} className="size-6" />) as any;

export const timeAttr = {
  id: 'smpAttr:2035',
  remote: { values: (date: number) => timeFormat.format(new Date(date)) },
} as const;

export const trapLocationsAttr = {
  id: 'smpAttr:2036',
  type: 'numberInput',
  title: 'Trap locations',
  appearance: 'counter',
  prefix: mothTrapIcon,
  placeholder: '0',
  validation: { min: 0 },
} as const satisfies NumberInputConf;

export const trapsAttr = {
  id: 'smpAttr:2037',
  type: 'numberInput',
  title: 'Total no. of traps',
  appearance: 'counter',
  prefix: mothTrapIcon,
  placeholder: '0',
  validation: { min: 0 },
} as const satisfies NumberInputConf;

export const trapsCarrionAttr = {
  id: 'smpAttr:2038',
  type: 'numberInput',
  title: 'Traps (carrion)',
  appearance: 'counter',
  prefix: <IonIcon src={fishOutline} className="size-6" />,
  placeholder: '0',
  validation: { min: 0 },
} as const satisfies NumberInputConf;

export const trapsFruitAttr = {
  id: 'smpAttr:2039',
  type: 'numberInput',
  title: 'Traps (fruit)',
  appearance: 'counter',
  prefix: <IonIcon src={leafOutline} className="size-6" />,
  placeholder: '0',
  validation: { min: 0 },
} as const satisfies NumberInputConf;

export const trapsOtherAttr = {
  id: 'smpAttr:2040',
  type: 'numberInput',
  title: 'Traps (other)',
  appearance: 'counter',
  prefix: <IonIcon src={clipboardOutline} className="size-6" />,
  placeholder: '0',
  validation: { min: 0 },
} as const satisfies NumberInputConf;

export const numberOfDaysAttr = {
  id: 'smpAttr:2041',
  type: 'numberInput',
  title: 'No. of days',
  appearance: 'counter',
  prefix: <IonIcon src={calendarOutline} className="size-6" />,
  placeholder: '0',
  validation: { min: 1 },
} as const satisfies NumberInputConf;

export const firstSampleDateAttr = {
  id: 'smpAttr:2042',
  type: 'textInput',
  title: 'First sample date',
  container: 'inline',
  prefix: <IonIcon src={calendarOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const lastSampleDateAttr = {
  id: 'smpAttr:2043',
  type: 'textInput',
  title: 'Last sample date',
  container: 'inline',
  prefix: <IonIcon src={calendarOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const collectorsAttr = {
  id: 'smpAttr:2044',
  type: 'textInput',
  title: 'Collectors',
  container: 'inline',
  prefix: <IonIcon src={peopleOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const eventTypeAttr = {
  id: 'smpAttr:2045',
  type: 'textInput',
  title: 'Event type',
  container: 'inline',
  prefix: <IonIcon src={flagOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const samplingDesignAttr = {
  id: 'smpAttr:2046',
  type: 'textInput',
  title: 'Sampling design',
  container: 'inline',
  prefix: <IonIcon src={documentTextOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const carrionBaitAttr = {
  id: 'smpAttr:2047',
  type: 'textInput',
  title: 'Carrion bait',
  container: 'inline',
  prefix: <IonIcon src={fishOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const fieldCodeStartAttr = {
  id: 'smpAttr:2048',
  type: 'textInput',
  title: 'Field code',
  container: 'inline',
  prefix: <IonIcon src={codeOutline} className="size-6" />,
  validation: { pattern: FIELD_CODE_REGEX.source },
} as const satisfies TextInputConf;

export const stratumAttr = {
  id: 'smpAttr:2049',
  type: 'choiceInput',
  title: 'Stratum',
  appearance: 'button',
  prefix: <IonIcon src={layersOutline} className="size-6" />,
  choices: [
    { title: 'Understorey', dataName: '24581' },
    { title: 'Canopy', dataName: '24582' },
    { title: 'Midstory', dataName: '24583' },
    { title: 'Other', dataName: '24584' },
  ],
} as const satisfies ChoiceInputConf;

export const baitAttr = {
  id: 'smpAttr:2050',
  type: 'choiceInput',
  title: 'Bait',
  appearance: 'button',
  prefix: <IonIcon src={clipboardOutline} className="size-6" />,
  choices: [
    { title: 'Carrion', dataName: '24585' },
    { title: 'Banana', dataName: '24586' },
    { title: 'Other', dataName: '24587' },
  ],
} as const satisfies ChoiceInputConf;

export const otherBaitAttr = {
  id: 'smpAttr:2051',
  type: 'textInput',
  title: 'Other bait',
  container: 'inline',
  prefix: <IonIcon src={clipboardOutline} className="size-6" />,
  visibility: [{ target: baitAttr.id, op: 'eq', value: '99905' }],
} as const satisfies TextInputConf;

export const surveyCommentAttr = {
  id: 'comment',
  type: 'textInput',
  title: 'Comments',
  appearance: 'multiline',
  container: 'inline',
} as const satisfies TextInputConf;

export const trapCommentAttr = {
  id: 'comment',
  type: 'textInput',
  title: 'Comments',
  appearance: 'multiline',
  container: 'inline',
} as const satisfies TextInputConf;

export const weatherAttr = {
  id: 'smpAttr:2052',
  type: 'choiceInput',
  title: 'Weather',
  appearance: 'button',
  prefix: <IonIcon src={cloudyOutline} className="size-6" />,
  choices: [
    { title: 'Sunny', dataName: '24588' },
    { title: 'Cloudy', dataName: '24589' },
    { title: 'Rainy', dataName: '24590' },
  ],
} as const satisfies ChoiceInputConf;

export const humidityAttr = {
  id: 'smpAttr:2053',
  type: 'numberInput',
  title: 'Humidity',
  appearance: 'counter',
  prefix: <IonIcon src={waterOutline} className="size-6" />,
  placeholder: '0',
  suffix: '%',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const temperatureAttr = {
  id: 'smpAttr:2054',
  type: 'numberInput',
  title: 'Temperature',
  appearance: 'counter',
  prefix: <IonIcon src={thermometerOutline} className="size-6" />,
  placeholder: '0',
  suffix: '°C',
} as const satisfies NumberInputConf;

export const temperatureInTrapAttr = {
  id: 'smpAttr:2055',
  type: 'numberInput',
  title: 'Temp. in trap',
  appearance: 'counter',
  prefix: <IonIcon src={thermometerOutline} className="size-6" />,
  placeholder: '0',
  suffix: '°C',
} as const satisfies NumberInputConf;

const taxonAttr = {
  id: 'taxon',
  remote: {
    id: 'taxa_taxon_list_id',
    values: (taxon: Taxon) => taxon.warehouseId,
  },
} as const;

export const sexAttr = {
  id: 'occAttr:1239',
  type: 'choiceInput',
  title: 'Sex',
  appearance: 'button',
  prefix: <IonIcon src={maleOutline} className="size-6" />,
  choices: [
    { title: 'Not recorded', dataName: '' },
    { title: 'Male', dataName: '24592' },
    { title: 'Female', dataName: '24593' },
  ],
} as const satisfies ChoiceInputConf;

export const RECAPTURED = 't';
export const recaptureAttr = {
  id: 'occAttr:1240',
  type: 'yesNoInput',
  title: 'Recaptured',
  prefix: <IonIcon src={refreshOutline} className="size-6" />,
  choices: [{ dataName: '' }, { dataName: RECAPTURED }],
} as const satisfies YesNoInputConf;

export const feedingAttr = {
  id: 'occAttr:1241',
  type: 'yesNoInput',
  title: 'Feeding',
  prefix: <IonIcon src={nutritionOutline} className="size-6" />,
  choices: [{ dataName: '' }, { dataName: 't' }],
} as const satisfies YesNoInputConf;

const RELEASED = '24594';

export const fateAttr = {
  id: 'occAttr:1242',
  type: 'choiceInput',
  title: 'Fate',
  appearance: 'button',
  prefix: <IonIcon src={flagOutline} className="size-6" />,
  choices: [
    { title: 'Released', dataName: RELEASED },
    { title: 'Collected', dataName: '24595' },
    { title: 'Died', dataName: '24596' },
  ],
} as const satisfies ChoiceInputConf;

export const ageAttr = {
  id: 'occAttr:1243',
  type: 'choiceInput',
  title: 'Age',
  appearance: 'button',
  prefix: <IonIcon src={timeOutline} className="size-6" />,
  choices: [
    { title: 'Not recorded', dataName: '' },
    { title: 'New', dataName: '24598' },
    { title: 'Intermediate', dataName: '24599' },
    { title: 'Old', dataName: '24600' },
  ],
} as const satisfies ChoiceInputConf;

export const fieldCodeAttr = {
  id: 'occAttr:1244',
  type: 'textInput',
  title: 'Code',
  container: 'inline',
  prefix: <IonIcon src={informationCircleOutline} className="size-6" />,
  validation: { pattern: FIELD_CODE_REGEX.source },
} as const satisfies TextInputConf;

export const wingLengthAttr = {
  id: 'occAttr:1245',
  type: 'numberInput',
  title: 'Wing length',
  appearance: 'counter',
  prefix: <IonIcon src={resizeOutline} className="size-6" />,
  placeholder: '0',
  suffix: 'mm',
} as const satisfies NumberInputConf;

const getNextSpeciesCode = (subSample: Sample<Data>) => {
  const recaptured = (occ: Occurrence) =>
    occ.data[recaptureAttr.id as keyof typeof occ.data] !== RECAPTURED;

  // go through all occurrences across all sub-samples, flattened and find the last created occurrence with a field code, then increment that code by 1 for the new occurrence
  // exclude recaptures so their codes don't skew the next code sequence
  const allOccurrences = subSample
    .parent!.samples.flatMap(smp => smp.occurrences)
    .filter(recaptured);
  const lastOccurrence: any = allOccurrences
    .sort((a, b) => a.createdAt - b.createdAt)
    .at(-1);
  const lastFieldCode = lastOccurrence?.data[fieldCodeAttr.id];
  if (!lastFieldCode || !FIELD_CODE_REGEX.test(lastFieldCode))
    return subSample.parent!.data[fieldCodeStartAttr.id] || 'A1';

  // extract the single letter and number, increment the number by 1, and if it exceeds 99, increment the letter
  const match = lastFieldCode.match(/^([A-Z])(\d{1,2})$/);
  if (!match) return '';

  const [, letter, numberStr] = match;
  const number = parseInt(numberStr, 10);
  let nextNumber = number + 1;
  let nextLetter = letter;

  if (nextNumber > 99) {
    nextNumber = 1;

    // increment the letter (e.g. A -> Z and back to A)
    nextLetter =
      letter === 'Z' ? 'A' : String.fromCharCode(letter.charCodeAt(0) + 1);
  }

  return `${nextLetter}${nextNumber}`;
};

const SURVEY_ID = 1032;
const SURVEY_NAME = 'bait-trap';
const SURVEY_FORM = 'enter-bait-trap-records';

const attrs = {
  [dateAttr.id]: dateAttr,
  [commentAttr.id]: commentAttr,
  [trapLocationsAttr.id]: { block: trapLocationsAttr },
  [trapsAttr.id]: { block: trapsAttr },
  [trapsCarrionAttr.id]: { block: trapsCarrionAttr },
  [trapsFruitAttr.id]: { block: trapsFruitAttr },
  [trapsOtherAttr.id]: { block: trapsOtherAttr },
  [numberOfDaysAttr.id]: { block: numberOfDaysAttr },
  [firstSampleDateAttr.id]: {
    block: firstSampleDateAttr,
    remote: { values: (date: number) => dateFormat.format(new Date(date)) },
  },
  [lastSampleDateAttr.id]: {
    block: lastSampleDateAttr,
    remote: { values: (date: number) => dateFormat.format(new Date(date)) },
  },
  [collectorsAttr.id]: { block: collectorsAttr },
  [eventTypeAttr.id]: { block: eventTypeAttr },
  [samplingDesignAttr.id]: { block: samplingDesignAttr },
  [carrionBaitAttr.id]: { block: carrionBaitAttr },
  [fieldCodeStartAttr.id]: { block: fieldCodeStartAttr },
} as const;

const subSmpAttrs = {
  [dateAttr.id]: dateAttr,
  [timeAttr.id]: timeAttr as any,
  [stratumAttr.id]: { block: stratumAttr },
  [baitAttr.id]: { block: baitAttr },
  [otherBaitAttr.id]: { block: otherBaitAttr },
  [trapCommentAttr.id]: { block: trapCommentAttr },
  [weatherAttr.id]: { block: weatherAttr },
  [humidityAttr.id]: { block: humidityAttr },
  [temperatureAttr.id]: { block: temperatureAttr },
  [temperatureInTrapAttr.id]: { block: temperatureInTrapAttr },
} as const;

const occAttrs = {
  [taxonAttr.id]: taxonAttr,
  [sexAttr.id]: { block: sexAttr },
  [recaptureAttr.id]: { block: recaptureAttr },
  [feedingAttr.id]: { block: feedingAttr },
  [fateAttr.id]: { block: fateAttr },
  [ageAttr.id]: { block: ageAttr },
  [wingLengthAttr.id]: { block: wingLengthAttr },
  [commentAttr.id]: commentAttr,
  [fieldCodeAttr.id]: { block: fieldCodeAttr },
} as const;

const survey = {
  id: SURVEY_ID,
  name: SURVEY_NAME,
  label: 'Bait-Trap Survey',
  webForm: SURVEY_FORM,

  attrs,

  smp: {
    attrs: subSmpAttrs,

    occ: {
      attrs: occAttrs,

      create({ sample, taxon }) {
        return new Occurrence<OccData>({
          data: {
            taxon,
            [fieldCodeAttr.id]: getNextSpeciesCode(sample as Sample<Data>),
            [fateAttr.id]: RELEASED,
          },
        });
      },

      verify: data =>
        z
          .object({
            taxon: z.object(
              { warehouseId: z.number() },
              { error: 'Species is missing' }
            ),
            [fieldCodeAttr.id]: z.string().regex(FIELD_CODE_REGEX, {
              error: 'Field code is invalid (e.g. A1)',
            }),
          })
          .safeParse(data).error,
    },

    create({ location }) {
      const now = new Date().toISOString();

      const sample = new Sample<SubSmpData>({
        metadata: { survey: SURVEY_NAME },
        data: {
          surveyId: SURVEY_ID,
          sampleMethodId: 24553, // bait-trap check
          date: now,
          [timeAttr.id]: now,
          location,
        },
      });

      return sample as unknown as Sample;
    },

    verify: data =>
      z
        .object({
          locationId: z.string({ error: 'Please select your site.' }),
          date: z.string({ error: 'Date is missing' }),
        })
        .safeParse(data).error,
  },

  verify: data =>
    z
      .object({
        locationId: z.string({ error: 'Please select your site.' }),
        date: z.string({ error: 'Date is missing' }),
        [fieldCodeStartAttr.id]: z
          .string()
          .regex(FIELD_CODE_REGEX, { error: 'Field code is invalid (e.g. A1)' })
          .or(z.literal(''))
          .optional(),
      })
      .safeParse(data).error,

  create() {
    const now = new Date().toISOString();

    const sample = new Sample<Data>({
      metadata: { survey: SURVEY_NAME },
      data: {
        surveyId: SURVEY_ID,
        date: now,
        [firstSampleDateAttr.id]: now,
        [lastSampleDateAttr.id]: now,
        sampleMethodId: 24552, // bait-trap
        training: appModel.data.useTraining,
        inputForm: SURVEY_FORM,
        [appVersionAttr.id]: config.version,
        [eventTypeAttr.id]: 'Bimonthly monitoring',
        [samplingDesignAttr.id]: 'Paired understorey and canopy traps',
        [carrionBaitAttr.id]: 'Fish',
      },
    });

    return sample as unknown as Sample;
  },
} as const satisfies Survey;

export type Data = SampleData &
  inferAttrConfigTypes<typeof attrs> & { location?: LocationData };

export type SubSmpData = SampleData &
  inferAttrConfigTypes<typeof subSmpAttrs> & { location?: LocationData };

export type OccData = OccurrenceData & inferAttrConfigTypes<typeof occAttrs>;

export default survey;
