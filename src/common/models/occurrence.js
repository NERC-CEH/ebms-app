import Indicia from '@indicia-js/core';
import { observable, observe, toJS } from 'mobx';
import CONFIG from 'config';
import Media from './image';

export default class Occurrence extends Indicia.Occurrence {
  constructor(...args) {
    super(...args);

    this.attrs = observable({
      count: 1,
      comment: null,
      stage: null,
      taxon: {
        scientific_name: null,
        warehouse_id: null,
      },
      ...this.attrs,
    });
    this.metadata = observable(this.metadata);
    this.media = observable(this.media);

    const onAddedSetParent = change => {
      if (change.addedCount) {
        const model = change.added[0];
        model.parent = this;
      }
    };

    observe(this.media, onAddedSetParent);
  }

  static fromJSON(json) {
    return super.fromJSON(json, Media);
  }

  async save() {
    if (!this.parent) {
      return Promise.reject(
        new Error('Trying to save locally without a parent')
      );
    }

    return this.parent.save();
  }

  async destroy(silent) {
    if (!this.parent) {
      return Promise.reject(
        new Error('Trying to destroy locally without a parent')
      );
    }

    this.parent.occurrences.remove(this);
    await Promise.all(this.media.map(media => media.destroy(true)));

    if (silent) {
      return null;
    }

    return this.parent.save();
  }

  toJSON() {
    return toJS(super.toJSON(), { recurseEverything: true });
  }

  keys = () => {
    if (!this.parent) {
      throw new Error('No parent exists to get keys');
    }

    return {
      ...Indicia.Occurrence.keys,
      ...CONFIG.indicia.surveys[this.getSurvey().name].occ.attrs,
    };
  };

  getSurvey() {
    if (!this.parent) {
      throw new Error('No parent exists to get survey');
    }

    return this.parent.getSurvey();
  }
}
