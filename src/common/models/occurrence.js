import { Occurrence } from '@apps';
import Media from './media';

export default class AppOccurrence extends Occurrence {
  static fromJSON(json) {
    return super.fromJSON(json, Media);
  }

  getTaxonName() {
    const { taxon } = this.attrs;
    if (!taxon || !taxon.found_in_name) {
      return null;
    }

    return taxon[taxon.found_in_name];
  }

  // eslint-disable-next-line class-methods-use-this
  validateRemote() {
    return null;
  }
}
