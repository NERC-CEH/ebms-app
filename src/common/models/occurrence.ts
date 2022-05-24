import { Occurrence, OccurrenceOptions, OccurrenceAttrs } from '@flumens';
import appModel from 'models/app';
import speciesCommonNamesData from 'common/data/commonNames/index.json';
import Media from './media';

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
    const identifyAllImages = (media: Media) => media.identify();

    // [sp1, null, sp3, sp1 ]
    const species = await Promise.all(this.media.map(identifyAllImages));

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
    species.forEach(findHighestProbSpecies);

    const { language } = appModel.attrs;
    const speciesDataBySpecificLanguage = (speciesCommonNamesData as any)[
      language as any
    ];

    if (!highestProbSpecies) return this.attrs.taxon;

    const byId = (spName: any) =>
      spName.preferredId ===
      parseInt(highestProbSpecies.taxa_taxon_list_id, 10);

    const taxon = speciesDataBySpecificLanguage?.find(byId);

    if (taxon) {
      this.attrs.taxon = {
        ...taxon,
        found_in_name: 'common_name',
      };
    } else {
      this.attrs.taxon = {
        warehouse_id: parseInt(highestProbSpecies.taxa_taxon_list_id, 10),
        scientific_name: highestProbSpecies.taxon,
        found_in_name: 'scientific_name',
      };
    }

    this.save();

    return this.attrs.taxon;
  }
}
