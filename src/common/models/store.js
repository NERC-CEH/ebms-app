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

modelStore.findAll = async () => {
  console.log('Fixing old pics');

  const db = window.sqlitePlugin.openDatabase({
    name: 'indicia',
    location: 'default',
  });

  const execute = query =>
    new Promise((resolve, reject) => {
      db.transaction(t => {
        t.executeSql(
          query,
          [],
          (_, results) => {
            const rows = [];
            console.log('rowsAffected', results.rowsAffected);
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }
            resolve(rows);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });

  await execute(
    `DELETE FROM models as m WHERE json_extract(m.value, '$.metadata.syncedOn') IS NOT NULL`
  );

  console.log('Fixing old pics finish');

  return Store.prototype.findAll.apply(modelStore);
};

export const locationsStore = new Store({
  storeName: 'locations',
  debugging: isDemo,
});

if (isDemo) {
  Object.assign(window, { genericStore, modelStore, locationsStore });
}
