import { isPlatform } from '@ionic/react';
import { Store } from '@flumens';

const isDemo = !isPlatform('hybrid');

export const genericStore = new Store({
  storeName: 'generic',
  debugging: isDemo,
});
export const modelStore = new Store({
  storeName: 'models',
  debugging: isDemo,
});
export const locationsStore = new Store({
  storeName: 'locations',
  debugging: isDemo,
});

if (isDemo) {
  Object.assign(window, { genericStore, modelStore, locationsStore });
}
