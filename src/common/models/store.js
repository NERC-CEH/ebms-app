import { Store } from '@flumens';
import { isPlatform } from '@ionic/react';

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

export const groupsStore = new Store({
  storeName: 'groups',
  debugging: isDemo,
});

if (isDemo) {
  Object.assign(window, {
    genericStore,
    modelStore,
    locationsStore,
    groupsStore,
  });
}
