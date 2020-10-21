import { Store } from '@apps';

export const genericStore = new Store({
  storeName: 'generic',
  debugging: __DEV__,
});
export const modelStore = new Store({
  storeName: 'models',
  debugging: __DEV__,
});
