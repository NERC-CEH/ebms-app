import {
  calendarOutline,
  clipboardOutline,
  cloudyOutline,
  codeOutline,
  documentTextOutline,
  fishOutline,
  flagOutline,
  layersOutline,
  leafOutline,
  maleOutline,
  nutritionOutline,
  peopleOutline,
  refreshOutline,
  resizeOutline,
  ribbonOutline,
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
  YesNoInputConf,
} from '@flumens';
import { IonIcon } from '@ionic/react';
import config from 'common/config';
import mothTrap from 'common/images/moth-inside-icon.svg';
import Sample from 'common/models/sample';
import appModel from 'models/app';
import { Data as LocationData } from 'models/location';
import {
  Survey,
  appVersionAttr,
  commentAttr,
  dateAttr as commonDateAttr,
  inferAttrConfigTypes,
} from 'Survey/common/config';

const FIELD_CODE_REGEX = /^[A-Z]\d{1,2}$/;

const mothTrapIcon = (<IonIcon src={mothTrap} className="size-6" />) as any;

const dateAttr = {
  id: 'date',
  menuProps: { parse: 'date', icon: calendarOutline },
  pageProps: {
    attrProps: {
      input: 'date',
      inputProps: () => ({
        max: () => new Date(),
        label: 'Date',
        icon: calendarOutline,
        autoFocus: false,
        presentation: 'date',
        locale: appModel.data.language || undefined,
      }),
    },
  },
  remote: commonDateAttr.remote,
} as const;

const dateTimeAttr = {
  id: 'date',
  menuProps: {
    label: 'Date and time',
    parse: 'date',
    icon: calendarOutline,
  },
  pageProps: {
    attrProps: {
      input: 'date',
      inputProps: () => ({
        max: () => new Date(),
        label: 'Date',
        icon: calendarOutline,
        autoFocus: false,
        presentation: 'date',
        locale: appModel.data.language || undefined,
      }),
    },
  },
  remote: {
    values: (date: number, submission: any) => {
      Object.assign(submission.values, {
        // TODO: add time
      });
      return dateFormat.format(new Date(date));
    },
  },
} as const;

export const trapsAttr = {
  id: 'smpAttr:9991',
  type: 'numberInput',
  title: 'Traps',
  appearance: 'counter',
  prefix: mothTrapIcon,
  placeholder: '0',
  validation: { min: 0 },
} as const satisfies NumberInputConf;

export const trapsCarrionAttr = {
  id: 'smpAttr:9992',
  type: 'numberInput',
  title: 'Traps (carrion)',
  appearance: 'counter',
  prefix: <IonIcon src={fishOutline} className="size-6" />,
  placeholder: '0',
  validation: { min: 0 },
} as const satisfies NumberInputConf;

export const trapsBananaAttr = {
  id: 'smpAttr:9993',
  type: 'numberInput',
  title: 'Traps (banana)',
  appearance: 'counter',
  prefix: <IonIcon src={leafOutline} className="size-6" />,
  placeholder: '0',
  validation: { min: 0 },
} as const satisfies NumberInputConf;

export const trapsOtherAttr = {
  id: 'smpAttr:9994',
  type: 'numberInput',
  title: 'Traps (other)',
  appearance: 'counter',
  prefix: <IonIcon src={clipboardOutline} className="size-6" />,
  placeholder: '0',
  validation: { min: 0 },
} as const satisfies NumberInputConf;

export const numberOfDaysAttr = {
  id: 'smpAttr:9995',
  type: 'numberInput',
  title: 'No. of days',
  appearance: 'counter',
  prefix: <IonIcon src={calendarOutline} className="size-6" />,
  placeholder: '0',
  validation: { min: 1 },
} as const satisfies NumberInputConf;

export const firstSampleDateAttr = {
  id: 'smpAttr:9996',
  type: 'textInput',
  title: 'First sample date',
  container: 'inline',
  prefix: <IonIcon src={calendarOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const lastSampleDateAttr = {
  id: 'smpAttr:9997',
  type: 'textInput',
  title: 'Last sample date',
  container: 'inline',
  prefix: <IonIcon src={calendarOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const collectorsAttr = {
  id: 'smpAttr:9998',
  type: 'textInput',
  title: 'Collectors',
  container: 'inline',
  prefix: <IonIcon src={peopleOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const eventTypeAttr = {
  id: 'smpAttr:9999',
  type: 'textInput',
  title: 'Event type',
  container: 'inline',
  prefix: <IonIcon src={flagOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const samplingDesignAttr = {
  id: 'smpAttr:99910',
  type: 'textInput',
  title: 'Sampling design',
  container: 'inline',
  prefix: <IonIcon src={documentTextOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const carrionBaitAttr = {
  id: 'smpAttr:99911',
  type: 'textInput',
  title: 'Carrion bait',
  container: 'inline',
  prefix: <IonIcon src={fishOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const fieldCodeStartAttr = {
  id: 'smpAttr:99912',
  type: 'textInput',
  title: 'Field code',
  container: 'inline',
  prefix: <IonIcon src={codeOutline} className="size-6" />,
  validation: { pattern: FIELD_CODE_REGEX.source },
} as const satisfies TextInputConf;

export const stratumAttr = {
  id: 'smpAttr:99913',
  type: 'textInput',
  title: 'Stratum',
  container: 'inline',
  prefix: <IonIcon src={layersOutline} className="size-6" />,
} as const satisfies TextInputConf;

export const baitAttr = {
  id: 'smpAttr:99914',
  type: 'choiceInput',
  title: 'Bait',
  appearance: 'button',
  prefix: <IonIcon src={clipboardOutline} className="size-6" />,
  choices: [
    { title: 'Carrion', dataName: '99903' },
    { title: 'Banana', dataName: '99904' },
    { title: 'Other', dataName: '99905' },
  ],
} as const satisfies ChoiceInputConf;

export const otherBaitAttr = {
  id: 'smpAttr:99915',
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
  id: 'smpAttr:99916',
  type: 'choiceInput',
  title: 'Weather',
  appearance: 'button',
  prefix: <IonIcon src={cloudyOutline} className="size-6" />,
  choices: [
    { title: 'Sunny', dataName: '99906' },
    { title: 'Cloudy', dataName: '99908' },
    { title: 'Rainy', dataName: '99909' },
  ],
} as const satisfies ChoiceInputConf;

export const humidityAttr = {
  id: 'smpAttr:99917',
  type: 'numberInput',
  title: 'Humidity',
  appearance: 'counter',
  prefix: <IonIcon src={waterOutline} className="size-6" />,
  placeholder: '0',
  suffix: '%',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const temperatureAttr = {
  id: 'smpAttr:99918',
  type: 'numberInput',
  title: 'Temperature',
  appearance: 'counter',
  prefix: <IonIcon src={thermometerOutline} className="size-6" />,
  placeholder: '0',
  suffix: '°C',
} as const satisfies NumberInputConf;

export const temperatureInTrapAttr = {
  id: 'smpAttr:99919',
  type: 'numberInput',
  title: 'Temp. in trap',
  appearance: 'counter',
  prefix: <IonIcon src={thermometerOutline} className="size-6" />,
  placeholder: '0',
  suffix: '°C',
} as const satisfies NumberInputConf;

const taxonAttr = {
  id: 'taxon',
  remote: { id: 'taxa_taxon_list_id' },
} as const;

export const sexAttr = {
  id: 'occAttr:99920',
  type: 'choiceInput',
  title: 'Sex',
  appearance: 'button',
  prefix: <IonIcon src={maleOutline} className="size-6" />,
  choices: [
    { title: 'Not recorded', dataName: '' },
    { title: 'Male', dataName: '99913' },
    { title: 'Female', dataName: '99914' },
  ],
} as const satisfies ChoiceInputConf;

export const markedAttr = {
  id: 'occAttr:99921',
  type: 'yesNoInput',
  title: 'Marked',
  prefix: <IonIcon src={ribbonOutline} className="size-6" />,
  choices: [{ dataName: '0' }, { dataName: '1' }],
} as const satisfies YesNoInputConf;

export const recaptureAttr = {
  id: 'occAttr:99922',
  type: 'yesNoInput',
  title: 'Recapture',
  prefix: <IonIcon src={refreshOutline} className="size-6" />,
  choices: [{ dataName: '0' }, { dataName: '1' }],
} as const satisfies YesNoInputConf;

export const feedingAttr = {
  id: 'occAttr:99926',
  type: 'yesNoInput',
  title: 'Feeding',
  prefix: <IonIcon src={nutritionOutline} className="size-6" />,
  choices: [{ dataName: '0' }, { dataName: '1' }],
} as const satisfies YesNoInputConf;

export const fateAttr = {
  id: 'occAttr:99923',
  type: 'choiceInput',
  title: 'Fate',
  appearance: 'button',
  prefix: <IonIcon src={flagOutline} className="size-6" />,
  choices: [
    { title: 'Released', dataName: '99916' },
    { title: 'Collected', dataName: '99917' },
    { title: 'Died', dataName: '99918' },
  ],
} as const satisfies ChoiceInputConf;

export const ageAttr = {
  id: 'occAttr:99924',
  type: 'choiceInput',
  title: 'Age',
  appearance: 'button',
  prefix: <IonIcon src={timeOutline} className="size-6" />,
  choices: [
    { title: 'Not recorded', dataName: '' },
    { title: 'New', dataName: '99919' },
    { title: 'Intermediate', dataName: '99920' },
    { title: 'Old', dataName: '99921' },
  ],
} as const satisfies ChoiceInputConf;

export const fieldCodeAttr = {
  id: 'occAttr:99912',
  type: 'textInput',
} as const satisfies TextInputConf;

export const wingLengthAttr = {
  id: 'occAttr:99925',
  type: 'numberInput',
  title: 'Wing length',
  appearance: 'counter',
  prefix: <IonIcon src={resizeOutline} className="size-6" />,
  placeholder: '0',
  suffix: 'mm',
} as const satisfies NumberInputConf;

const getNextSpeciesCode = (subSample: Sample<Data>) => {
  // go through all occurrences across all sub-samples, flattened and find the last created occurrence with a field code, then increment that code by 1 for the new occurrence
  const allOccurrences = subSample.parent!.samples.flatMap(
    smp => smp.occurrences
  );
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
const SURVEY_FORM = 'ebms-bait-trap'; // TODO:

const attrs = {
  [dateAttr.id]: dateAttr,
  [commentAttr.id]: commentAttr,
  [trapsAttr.id]: { block: trapsAttr },
  [trapsCarrionAttr.id]: { block: trapsCarrionAttr },
  [trapsBananaAttr.id]: { block: trapsBananaAttr },
  [trapsOtherAttr.id]: { block: trapsOtherAttr },
  [numberOfDaysAttr.id]: { block: numberOfDaysAttr },
  [firstSampleDateAttr.id]: { block: firstSampleDateAttr },
  [lastSampleDateAttr.id]: { block: lastSampleDateAttr },
  [collectorsAttr.id]: { block: collectorsAttr },
  [eventTypeAttr.id]: { block: eventTypeAttr },
  [samplingDesignAttr.id]: { block: samplingDesignAttr },
  [carrionBaitAttr.id]: { block: carrionBaitAttr },
  [fieldCodeStartAttr.id]: { block: fieldCodeStartAttr },
} as const;

const subSmpAttrs = {
  [dateAttr.id]: dateTimeAttr,
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
  [markedAttr.id]: { block: markedAttr },
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

      create({ Occurrence, sample, taxon }) {
        return new Occurrence<OccData>({
          data: {
            taxon,
            [fieldCodeAttr.id]: getNextSpeciesCode(sample!),
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
          })
          .safeParse(data).error,
    },

    create({ location }) {
      const sample = new Sample<SubSmpData>({
        metadata: { survey: SURVEY_NAME },
        data: {
          surveyId: SURVEY_ID,
          sampleMethodId: 24553, // bait-trap check
          date: new Date().toISOString(),
          location,
        },
      });

      return sample;
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
    const sample = new Sample<Data>({
      metadata: { survey: SURVEY_NAME },
      data: {
        surveyId: SURVEY_ID,
        date: new Date().toISOString(),
        sampleMethodId: 24552, // bait-trap
        training: appModel.data.useTraining,
        inputForm: SURVEY_FORM,
        [appVersionAttr.id]: config.version,
      },
    });

    return sample;
  },
} as const satisfies Survey;

export type Data = SampleData &
  inferAttrConfigTypes<typeof attrs> & { location?: LocationData };

export type SubSmpData = SampleData &
  inferAttrConfigTypes<typeof subSmpAttrs> & { location?: LocationData };

export type OccData = OccurrenceData & inferAttrConfigTypes<typeof occAttrs>;

export default survey;
