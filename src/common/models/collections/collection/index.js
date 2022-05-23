/* eslint-disable @getify/proper-arrows/name */
import { observable } from 'mobx';

/**
 * Generate UUID.
 */
/* eslint-disable no-bitwise */
export function getNewUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}
/* eslint-enable no-bitwise */

const API = {
  async reset() {
    while (this.length) {
      const model = this.pop();
      if (!model) return;
      await model.destroy(); // eslint-disable-line
    }
  },

  async _fromStore() {
    if (!this._store || !this.Model) return false;

    const modelsJSON = await this._store.findAll();

    const getModel = modelJSON => new this.Model(modelJSON);
    const models = modelsJSON.map(getModel);
    this.push(...models);

    return true;
  },
};

function Collection({ models = [], id = '', cid = '', store, Model }) {
  const self = observable([...models]);
  Object.assign(self, API, { _store: store, Model });

  self.id = id;
  self.cid = cid || id || getNewUUID();

  // get from store - local cache
  self.ready = self._fromStore();

  // Experimental - checking on both updatedOn and syncedOn runs through collection every time model is changed
  // self.metadata = observable(clone(metadata));
  // const setUpdatedTimestamp = () => {
  //   const lastUpdatedOn = Math.max(
  //     ...self.map(item => {
  //       // const isSyncDue =
  //       // !this.metadata.syncedOn ||
  //       // this.metadata.syncedOn < this.metadata.updatedOn;
  //       return item.metadata.updatedOn;
  //     })
  //   );

  //   console.log('🦺 Updated collection ', self.id, lastUpdatedOn);
  //   self.metadata.updatedOn = Date.now();
  // };
  // self.ready && self.ready.then(() => autorun(setUpdatedTimestamp));

  return self;
}

export default Collection;
