import { Occurrence, OccurrenceOptions, OccurrenceAttrs } from '@flumens';
import appModel from 'models/app';
import { MachineInvolvement } from 'Survey/Moth/config';
import Media from './media';

export type Taxon = {
  // species: OptionalExcept<
  //   Species,
  //   'commonNames' | 'scientificNameWithoutAuthor'
  // >;
  // suggestions?: ResultWithWarehouseID[];

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

    let highestProbSpecies: any = null;
    const findHighestProbSpecies = (sp: any) => {
      if (!highestProbSpecies) {
        highestProbSpecies = sp;
        return;
      }

      if (highestProbSpecies.probability < sp?.probability) {
        highestProbSpecies = sp;
      }
    };
    suggestions.forEach(findHighestProbSpecies);

    if (!highestProbSpecies) return this.attrs.taxon;

    this.attrs.taxon = {
      ...highestProbSpecies,
      machineInvolvement: MachineInvolvement.MACHINE,
      version: '1',
      suggestions,
    };

    this.save();

    return this.attrs.taxon;
  }
}
