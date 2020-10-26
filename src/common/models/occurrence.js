import { Occurrence } from '@apps';
import Media from './media';

export default class AppOccurrence extends Occurrence {
  keys = () => {
    return { ...Occurrence.keys, ...this.getSurvey().attrs };
  };

  static fromJSON(json) {
    return super.fromJSON(json, Media);
  }

  getSurvey() {
    const survey = this.parent.getSurvey();
    return survey.occ;
  }

  isDisabled() {
    if (!this.parent) {
      throw new Error('No occurrence parent to return disabled status.');
    }

    return this.parent.isDisabled();
  }

  getSubmission() {
    if (this.getSurvey().name === 'area') {
      if (!this.attrs.count) {
        return [];
      }
    }

    return super.getSubmission();
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
