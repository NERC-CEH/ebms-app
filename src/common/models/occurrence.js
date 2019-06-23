import Indicia from 'indicia';
import { observable } from 'mobx';
import CONFIG from 'config';
import ImageModel from './image';

export default Indicia.Occurrence.extend({
  Media: ImageModel,

  initialize() {
    this.attributes = observable(this.attributes);
    this.metadata = observable(this.metadata);
    this.media.models = observable(this.media.models);
  },

  defaults() {
    return {
      count: 1,
      comment: null,
      taxon: {
        scientific_name: null,
        warehouse_id: null,
      },
    };
  },

  keys: CONFIG.indicia.attrs.occ, // warehouse attribute keys

  /**
   * Disable sort for mobx to keep the same refs.
   * @param mediaObj
   */
  addMedia(mediaObj) {
    if (!mediaObj) return;
    mediaObj.setParent(this);
    this.media.add(mediaObj, { sort: false });
  },
});
