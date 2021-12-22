import { Occurrence } from '@apps';
import appModel from 'appModel';
import Media from './media';

export default class AppOccurrence extends Occurrence {
  static fromJSON(json) {
    return super.fromJSON(json, Media);
  }

  constructor(...args) {
    super(...args);
    this.metadata.training = appModel.attrs.useTraining ? 't' : null;
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

  isDisabled = () => this.isUploaded();

  async identify() {
    const identifyAllImages = media => media.identify();

    // [sp1, null, sp3, sp1 ]
    const species = await Promise.all(this.media.map(identifyAllImages));

    let highestProbSpecies = null;
    const findHighestProbSpecies = sp => {
      if (!highestProbSpecies) {
        highestProbSpecies = sp;
        return;
      }

      if (highestProbSpecies.probability < sp?.probability) {
        highestProbSpecies = sp;
      }
    };
    species.forEach(findHighestProbSpecies);

    if (!highestProbSpecies) return this.attrs.taxon;

    this.attrs.taxon = {
      warehouse_id: parseInt(highestProbSpecies.taxa_taxon_list_id, 10),
      scientific_name: highestProbSpecies.taxon,
      found_in_name: 'scientific_name',
    };

    this.save();

    return this.attrs.taxon;
  }
}
