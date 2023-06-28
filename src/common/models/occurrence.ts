import {
  Occurrence as OccurrenceOriginal,
  OccurrenceAttrs,
  validateRemoteModel,
} from '@flumens';
import { MachineInvolvement } from 'Survey/Moth/config';
import { Survey } from 'Survey/common/config';
import butterflyIcon from 'common/images/butterfly.svg';
import speciesGroups from 'common/helpers/groups';
import mothIcon from 'common/images/moth.svg';
import { IObservableArray } from 'mobx';
import bumblebeeIcon from 'common/images/bumblebee.svg';
import dragonflyIcon from 'common/images/dragonfly.svg';
import Sample from './sample';
import Media from './media';

export const DRAGONFLY_GROUP = speciesGroups.dragonflies.id;

const speciesGroupImages = {
  251: butterflyIcon,
  260: mothIcon,
  265: dragonflyIcon,
  261: bumblebeeIcon,
};

export const speciesListGroupImages = {
  104: butterflyIcon,
  114: mothIcon,
  107: dragonflyIcon,
  110: bumblebeeIcon,
};

const PAINTED_LADY_OCCURRENCE = 432422;

export interface SpeciesGroup {
  id: number;
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SpeciesGroups {
  butterflies: SpeciesGroup;
  moths: SpeciesGroup;
  bumblebees: SpeciesGroup;
  dragonflies: SpeciesGroup;
}

export type Taxon = {
  version?: string;

  machineInvolvement?: MachineInvolvement;
  suggestions?: any;
  preferredId?: any;
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
  dragonflyStage?: string;
  zero_abundance?: any;
  identifier?: any;
  count?: any;
  'count-outside'?: any;
  machineInvolvement?: MachineInvolvement;

  // PaintedLady survey
  wing?: any;
  behaviour?: any;
  direction?: any;
  eggLaying?: any;
  otherEggLaying?: any;
  otherThistles?: any;
  nectarSource?: any;
  mating?: any;
};

export default class Occurrence extends OccurrenceOriginal<Attrs> {
  static fromJSON(json: any) {
    return super.fromJSON(json, Media);
  }

  declare media: IObservableArray<Media>;

  declare parent?: Sample;

  declare getSurvey: () => Survey;

  validateRemote = validateRemoteModel;

  getTaxonName() {
    const { taxon } = this.attrs;
    if (!taxon) return null;

    if (!taxon.found_in_name) return taxon.scientific_name;

    return taxon[taxon.found_in_name];
  }

  getTaxonCommonAndScientificNames() {
    const { taxon } = this.attrs;
    if (!taxon) return null;

    if (!taxon.common_name) return taxon.scientific_name;

    return [taxon[taxon.found_in_name], taxon.scientific_name];
  }

  isDisabled = () => this.isUploaded();

  isDragonflyTaxon = () => this.attrs.taxon.group === DRAGONFLY_GROUP;

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

  isPaintedLadySpecies() {
    // scientific name does not have preferredId
    return (
      this?.attrs?.taxon?.preferredId === PAINTED_LADY_OCCURRENCE ||
      this?.attrs?.taxon?.warehouse_id === PAINTED_LADY_OCCURRENCE
    );
  }

  getPrettyName() {
    const { taxon } = this.attrs;
    if (!taxon) return '';

    if (taxon?.common_name) return taxon.common_name;

    return taxon.scientific_name;
  }

  getSpeciesGroupIcon = () =>
    (speciesGroupImages as any)[this.attrs.taxon.group];

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
