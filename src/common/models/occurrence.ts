import { IObservableArray } from 'mobx';
import {
  OccurrenceModel,
  OccurrenceAttrs,
  OccurrenceMetadata,
  validateRemoteModel,
} from '@flumens';
import config from 'common/config';
import speciesGroups from 'common/data/groups';
import bumblebeeIcon from 'common/images/bumblebee.svg';
import butterflyIcon from 'common/images/butterfly.svg';
import dragonflyIcon from 'common/images/dragonfly.svg';
import mothIcon from 'common/images/moth.svg';
import { MachineInvolvement } from 'Survey/Moth/config';
import { Survey } from 'Survey/common/config';
import Media from './media';
import Sample from './sample';

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

export type Metadata = OccurrenceMetadata & {
  // moth survey
  mergedOccurrences?: string[];
};

export type Attrs = OccurrenceAttrs & {
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

export const doesShallowTaxonMatch = (shallowEntry: Taxon, taxon: Taxon) => {
  if (shallowEntry.warehouse_id === taxon.warehouse_id) return true;
  if (shallowEntry.warehouse_id === taxon.preferredId) return true;

  if (shallowEntry.preferredId) {
    if (shallowEntry.preferredId === taxon.preferredId) return true;
    if (shallowEntry.preferredId === taxon.warehouse_id) return true;
  }

  if (taxon.preferredId) {
    if (shallowEntry.preferredId === taxon.preferredId) return true;
    if (shallowEntry.warehouse_id === taxon.preferredId) return true;
  }

  return false;
};

export default class Occurrence extends OccurrenceModel<Attrs, Metadata> {
  declare media: IObservableArray<Media>;

  declare parent?: Sample;

  declare getSurvey: () => Survey;

  validateRemote = validateRemoteModel;

  constructor(options: any) {
    super({ ...options, Media });
  }

  getTaxonName() {
    const { taxon } = this.data;
    if (!taxon) return null;

    if (!taxon.found_in_name) return taxon.scientific_name;

    return taxon[taxon.found_in_name];
  }

  getTaxonCommonAndScientificNames() {
    const { taxon } = this.data;
    if (!taxon) return null;

    if (!taxon.common_name) return taxon.scientific_name;

    return [taxon[taxon.found_in_name], taxon.scientific_name];
  }

  isDragonflyTaxon = () => this.data.taxon.group === DRAGONFLY_GROUP;

  async identify() {
    const identifyAllImages = (media: Media) => media.identify();

    // [sp1, null, sp2, sp3 ]
    const allSuggestions = await Promise.all(this.media.map(identifyAllImages));

    // [sp1, sp2, sp3 ]
    const hasValue = (val: any) => !!val;
    const suggestions = allSuggestions.filter(hasValue);

    const highestProbSpecies: any = this.getTopSuggestion(suggestions);
    if (!highestProbSpecies) return this.data.taxon;

    this.data.taxon = {
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

    return this.data.taxon;
  }

  isPaintedLadySpecies() {
    // scientific name does not have preferredId
    return (
      this?.data?.taxon?.preferredId === PAINTED_LADY_OCCURRENCE ||
      this?.data?.taxon?.warehouse_id === PAINTED_LADY_OCCURRENCE ||
      this?.data?.taxon?.scientific_name === 'Vanessa cardui' // for remote cached
    );
  }

  getPrettyName() {
    const { taxon } = this.data;
    if (!taxon) return '';

    if (taxon?.common_name) return taxon.common_name;

    return taxon.scientific_name;
  }

  getSpeciesGroupIcon = () =>
    (speciesGroupImages as any)[this.data.taxon.group];

  doesTaxonMatch = (taxon: Taxon) => {
    if (this.data.taxon.warehouse_id === taxon.warehouse_id) return true;
    if (this.data.taxon.warehouse_id === taxon.preferredId) return true;

    if (this.data.taxon.preferredId) {
      if (this.data.taxon.preferredId === taxon.preferredId) return true;
      if (this.data.taxon.preferredId === taxon.warehouse_id) return true;
    }

    if (taxon.preferredId) {
      if (this.data.taxon.preferredId === taxon.preferredId) return true;
      if (this.data.taxon.warehouse_id === taxon.preferredId) return true;
    }

    return false;
  };

  getTopSuggestion(suggestions?: any) {
    // eslint-disable-next-line no-param-reassign
    suggestions = suggestions || this.data.taxon?.suggestions;

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

  getClassifierSubmission() {
    const { taxon } = this.data;
    const classifierVersion = taxon?.version || '';

    const getMediaPath = (media: Media) => media.data.queued;
    const mediaPaths = this.media.map(getMediaPath);

    const getSuggestion = (
      { probability, taxon: taxon_name_given, warehouse_id }: any,
      index: number
    ) => {
      const topSpecies = index === 0;
      const classifierChosen = topSpecies ? 't' : 'f';
      const humanChosen = warehouse_id === taxon?.warehouse_id ? 't' : 'f';

      return {
        values: {
          taxon_name_given,
          probability_given: probability,
          taxa_taxon_list_id: warehouse_id,
          classifier_chosen: classifierChosen,
          human_chosen: humanChosen,
        },
      };
    };

    const classifierSuggestions =
      this.data.taxon?.suggestions?.map(getSuggestion) || [];

    const hasSuggestions = classifierSuggestions.length;
    if (!hasSuggestions) {
      // don't set anything yet because this requires below structure to be valid
      // submission.values.machine_involvement = MachineInvolvement.NONE;
      return null;
    }

    if (!mediaPaths.length) return null;

    const values: any = {};
    if (Number.isFinite(taxon?.machineInvolvement)) {
      // eslint-disable-next-line no-param-reassign
      values.machine_involvement = taxon?.machineInvolvement;
    }

    return {
      values,

      classification_event: {
        values: { created_by_id: null },
        classification_results: [
          {
            values: {
              classifier_id: config.classifierID,
              classifier_version: classifierVersion,
            },
            classification_suggestions: classifierSuggestions,
            metaFields: { mediaPaths },
          },
        ],
      },
    };
  }
}
