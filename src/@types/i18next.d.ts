/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type Resources from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    enableSelector: false;
    defaultNS: 'en';
    resources: Resources;
  }
}
