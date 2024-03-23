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

export const projectsStore = new Store({
  storeName: 'projects',
  debugging: isDemo,
});

if (isDemo) {
  Object.assign(window, {
    genericStore,
    modelStore,
    locationsStore,
    projectsStore,
  });
}
