import { Occurrence, OccurrenceOptions, OccurrenceAttrs } from '@flumens';
import appModel from 'models/app';
import { MachineInvolvement } from 'Survey/Moth/config';
import Media from './media';

export type Taxon = {
  version?: string;

  machineInvolvement?: MachineInvolvement;
  suggestions?: any;

  array_id?: number;
  found_in_name?: string;
  group?: number;
  scientific_name?: string;
  species_id?: number;
  warehouse_id: number;
};

type Attrs = OccurrenceAttrs & {
  taxon: any;
  comment?: string;
  stage?: string;
  zero_abundance?: any;
  identifier?: any;
  count?: any;
  'count-outside'?: any;
  machineInvolvement?: MachineInvolvement;
};

export default class AppOccurrence extends Occurrence {
  static fromJSON(json: any) {
    return super.fromJSON(json, Media);
  }

  attrs: Attrs = this.attrs;

  constructor(props: OccurrenceOptions) {
    super(props);

    this.metadata.training = appModel.attrs.useTraining ? 't' : null;
  }

  getTaxonName() {
    const { taxon } = this.attrs;
    if (!taxon) return null;

    if (!taxon.found_in_name) return taxon.scientific_name;

    return taxon[taxon.found_in_name];
  }

  // eslint-disable-next-line class-methods-use-this
  validateRemote() {
    return null;
  }

  isDisabled = () => this.isUploaded();

  async identify() {
    const identifyAllImages = (media: Media) => media.identify();

    // [sp1, null, sp2, sp3 ]
    const allSuggestions = await Promise.all(this.media.map(identifyAllImages));

    // [sp1, sp2, sp3 ]
    const hasValue = (val: any) => !!val;
    const suggestions = allSuggestions.filter(hasValue);

    const highestProbSpecies: any = this.getTopSuggestion(suggestions);
    if (!highestProbSpecies) return this.attrs.taxon;

    this.attrs.taxon = {
      found_in_name: highestProbSpecies.found_in_name,
      common_name: highestProbSpecies.common_name,
      group: highestProbSpecies.group,
      probability: highestProbSpecies.probability,
      scientific_name: highestProbSpecies.scientific_name,
      warehouse_id: highestProbSpecies.warehouse_id,

      machineInvolvement: MachineInvolvement.MACHINE,
      version: '1',
      suggestions,
    };

    this.save();

    return this.attrs.taxon;
  }

  getTopSuggestion(suggestions?: any) {
    // eslint-disable-next-line no-param-reassign
    suggestions = suggestions || this.attrs.taxon?.suggestions;

    let highestProbSpecies: any;

    const findHighestProbSpecies = (sp: any) => {
      if (!highestProbSpecies) {
        highestProbSpecies = sp;
        return;
      }

      if (highestProbSpecies.probability < sp?.probability) {
        highestProbSpecies = sp;
      }
    };
    suggestions?.forEach(findHighestProbSpecies);

    return highestProbSpecies;
  }
}
