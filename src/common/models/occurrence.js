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

    const identifiedSpecies = await Promise.all(
      this.media.map(identifyAllImages)
    );
    return this._setTaxonWithHighestProbability(identifiedSpecies);
  }

  _setTaxonWithHighestProbability(species) {
    const getTaxonWithHighestProbability = (currentTaxon, previoustaxon) => {
      if (!currentTaxon?.attrs?.species?.length) return previoustaxon;
      if (!previoustaxon?.attrs?.species?.length) return currentTaxon;

      return previoustaxon.attrs.species[0].probability >
        currentTaxon.attrs.species[0].probability
        ? previoustaxon
        : currentTaxon;
    };
    const taxonWithHighestProbability = species.reduce(
      getTaxonWithHighestProbability
    );

    if (!taxonWithHighestProbability?.attrs?.species?.length) return;

    // eslint-disable-next-line camelcase
    const { taxa_taxon_list_id, taxon: scientific_name } =
      taxonWithHighestProbability.attrs.species[0];

    this.attrs.taxon = {
      warehouse_id: Number(taxa_taxon_list_id),
      scientific_name,
      found_in_name: 'scientific_name',
    };

    this.save();
  }
}
