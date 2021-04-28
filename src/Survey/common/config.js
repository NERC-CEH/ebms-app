import { date as dateHelp } from '@apps';
import { chatboxOutline } from 'ionicons/icons';

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
    id: 16556,
    isDefault: true,
  },
  { value: 10, id: 16530 },
  { value: 11, id: 16531 },
  { value: 12, id: 16532 },
  { value: 13, id: 16533 },
  { value: 14, id: 16534 },
  { value: 15, id: 16535 },
  { value: 16, id: 16536 },
  { value: 17, id: 16537 },
  { value: 18, id: 16538 },
  { value: 19, id: 16539 },
  { value: 20, id: 16540 },
  { value: 21, id: 16541 },
  { value: 22, id: 16542 },
  { value: 23, id: 16543 },
  { value: 24, id: 16544 },
  { value: 25, id: 16545 },
  { value: 26, id: 16546 },
  { value: 27, id: 16547 },
  { value: 28, id: 16548 },
  { value: 29, id: 16549 },
  { value: 30, id: 16550 },
  { value: 31, id: 16551 },
  { value: 32, id: 16552 },
  { value: 33, id: 16553 },
  { value: 34, id: 16554 },
  { value: 35, id: 16555 },
];

export const temperatureAttr = {
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please specify the temperature C°.',
      inputProps: { options: temperatureValues },
    },
  },
  remote: { id: 1388, values: temperatureValues },
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
      inputProps: { max: 100, min: 0 },
    },
  },
  remote: { id: 1457 },
};

export const taxonAttr = {
  remote: {
    id: 'taxa_taxon_list_id',
    values: taxon => taxon.warehouse_id,
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
      inputProps: { format: 'HH:mm' },
    },
  },
  remote: {
    id: 1385,
    values: date => dateTimeFormat.format(new Date(date)),
  },
};

export const surveyEndTimeAttr = {
  menuProps: { label: 'End Time' },
  pageProps: {
    headerProps: { title: 'End Time' },
    attrProps: {
      input: 'time',
      inputProps: { format: 'HH:mm' },
    },
  },
  remote: {
    id: 1386,
    values: date => dateTimeFormat.format(new Date(date)),
  },
};

export const dateAttr = {
  isValid: val => val && val.toString() !== 'Invalid Date', // TODO: needed?
  pageProps: {
    attrProps: {
      input: 'date',
      inputProps: { max: () => new Date() },
    },
  },
  remote: { values: date => dateHelp.print(date, false) },
};
