import { bulbOutline, chatboxOutline, locationOutline } from 'ionicons/icons';
import { z } from 'zod';
import { TextInputConf } from '@flumens';
import { IonIcon } from '@ionic/react';
import mothTrap from 'common/images/moth-inside-icon.svg';
import numberIcon from 'common/images/number.svg';

const mothTrapIcon = (<IonIcon src={mothTrap} className="size-6" />) as any;
const mothTrapNumberIcon = (
  <IonIcon src={numberIcon} className="size-6" />
) as any;
const mothTrapBulbIcon = (
  <IonIcon src={bulbOutline} className="size-6" />
) as any;
const chatboxOutlineIcon = (
  <IonIcon src={chatboxOutline} className="size-6" />
) as any;
const locationOutlineIcon = (
  <IonIcon src={locationOutline} className="size-6" />
) as any;

export const trapNameAttr = {
  id: 'name',
  type: 'textInput',
  title: 'Name',
  container: 'inline',
  prefix: locationOutlineIcon,
} as const satisfies TextInputConf;

export const mothTrapTypeAttr = {
  id: 'locAttr:330',
  type: 'choiceInput',
  title: 'Type',
  appearance: 'button',
  prefix: mothTrapIcon,
  choices: [
    { title: 'LED funnel trap', dataName: '19306' },
    { title: 'Other funnel trap', dataName: '19307' },
    { title: 'Trap with 2 sheets', dataName: '19308' },
    { title: 'Other trap', dataName: '19309' },
  ],
} as const;

export const mothTrapOtherTypeAttr = {
  id: 'locAttr:288',
  type: 'textInput',
  title: 'Other type',
  prefix: mothTrapIcon,
  visibility: [{ target: mothTrapTypeAttr.id, op: 'eq', value: '19309' }],
} as const;

export const mothTrapLampDescriptionAttr = {
  id: 'description',
  type: 'textInput',
  title: 'Description',
  prefix: chatboxOutlineIcon,
} as const;

export const mothTrapLampQuantityAttr = {
  id: 'quantity',
  type: 'numberInput',
  title: 'Quantity',
  prefix: mothTrapNumberIcon,
  appearance: 'counter',
  validation: { min: 1 },
} as const;

export const mothTrapLampsAttr = { id: 'locAttr:306' } as const;

export const mothTrapUserAttr = { id: 'locAttr:234' } as const;

export const mothTrapLampTypeNameAttr = { id: 'type' } as const;

export const mothTrapLampTypeAttr = {
  id: 'type_term',
  type: 'choiceInput',
  title: 'Type',
  appearance: 'button',
  prefix: mothTrapBulbIcon,
  choices: [
    { dataName: '19111', title: 'LED → Ledstrip → 395-405 SMD 2835' },
    { dataName: '19112', title: 'LED → Ledstrip → 395-405 SMD 5050' },
    { dataName: '19113', title: 'LED → PowerLED → Please describe' },
    { dataName: '19114', title: 'LED → LepiLed → Mini' },
    { dataName: '19115', title: 'LED → LepiLed → Standard' },
    { dataName: '19116', title: 'LED → LepiLed → Maxi' },
    { dataName: '19117', title: 'LED → LepiLed → Maxi switch' },
    { dataName: '19118', title: 'LED → Other → Please describe' },
    { dataName: '19127', title: 'TL → Actinic → 6W' },
    { dataName: '19128', title: 'TL → Actinic → 8W' },
    { dataName: '19129', title: 'TL → Blacklight → 18W' },
    { dataName: '19130', title: 'TL → Other → Please describe' },
    { dataName: '19131', title: 'E27 → Mercury vapour - ML → 160W' },
    // { dataName: '19132', title: 'E27 → Mercury vapour - ML → 250W' }, // don't need this anymore
    { dataName: '19133', title: 'E27 → Mercury vapour - ML → 500W' },
    { dataName: '19134', title: 'E27 → Mercury vapour - HPL → 125W' },
    { dataName: '19135', title: 'E27 → Mercury vapour - HPL → 400W' },
    { dataName: '19136', title: 'E27 → Mercury vapour - Blacklight → 160W' },
    { dataName: '19137', title: 'E27 → Mercury vapour - Blacklight → 400W' },
    { dataName: '19138', title: 'E27 → Sylvana UV-A → 20W' },
    { dataName: '19140', title: 'E27 → Other → Please describe' },
    { dataName: '22302', title: 'E40 → Mercury vapour - ML → 500W' },
    { dataName: '22303', title: 'E40 → Mercury vapour - HPL → 250W' },
    { dataName: '22304', title: 'E40 → Mercury vapour - HPL → 400W' },
    { dataName: '20068', title: 'Other → Other → Please describe' },
  ],
} as const;

export type Lamp = {
  [mothTrapLampTypeNameAttr.id]: string;
  [mothTrapLampTypeAttr.id]: string;
  [mothTrapLampQuantityAttr.id]: number;
  [mothTrapLampDescriptionAttr.id]: string;
};

const lampSchema = z.object({
  description: z.string().optional(),
  quantity: z.number().min(1),
  type: z
    .string({ error: 'Lamp type is a required field.' })
    .min(1, 'Lamp type is a required field.'),
});

export const schema = z.object({
  name: z
    .string({ error: 'Location name is missing' })
    .min(1, 'Please add the moth trap location and name.'),
  centroidSref: z.string({ error: 'Location is missing' }),
  [mothTrapTypeAttr.id]: z.string({
    error: 'Trap type is a required field.',
  }),
  [mothTrapLampsAttr.id]: z
    .array(lampSchema, { error: 'No lamps added' })
    .min(1, 'No lamps added'),
});
