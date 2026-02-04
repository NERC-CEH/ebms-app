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
import { Suggestion } from 'common/services/waarneming';
import { PaintedLadyAttrs } from 'Survey/AreaCount/configSpecies';
import { MachineInvolvement } from 'Survey/Moth/config';
import { Survey } from 'Survey/common/config';
import Media from './media';
import Sample from './sample';

export const DRAGONFLY_GROUP = speciesGroups.dragonflies.id;

export const speciesGroupIcons = {
  104: butterflyIcon,
  114: mothIcon,
  107: dragonflyIcon,
  110: bumblebeeIcon,
};

const PAINTED_LADY_OCCURRENCE = 432422;

type ClassifierAttributes = {
  probability?: number;
  version?: string;
  suggestions?: Suggestion[];
  machineInvolvement?: MachineInvolvement;
};

export type Taxon = {
  warehouseId: number;
  scientificName: string;
  preferredId?: any;
  foundInName?: 'commonName' | 'scientificName';
  taxonGroupId?: number;
  commonName?: string;
  id?: number;
} & ClassifierAttributes;

export type Metadata = OccurrenceMetadata & {
  // moth survey
  mergedOccurrences?: string[];
};

export type Attrs = Omit<OccurrenceAttrs, 'taxon'> & {
  taxon: Taxon;
  comment?: string;
  stage?: string;
  dragonflyStage?: string;
  identifier?: any;
  count?: any;
  'count-outside'?: any;
} & PaintedLadyAttrs;

export const doesShallowTaxonMatch = (shallowEntry: Taxon, taxon: Taxon) => {
  if (shallowEntry.warehouseId === taxon.warehouseId) return true;
  if (shallowEntry.warehouseId === taxon.preferredId) return true;

  if (shallowEntry.preferredId) {
    if (shallowEntry.preferredId === taxon.preferredId) return true;
    if (shallowEntry.preferredId === taxon.warehouseId) return true;
  }

  if (taxon.preferredId) {
    if (shallowEntry.preferredId === taxon.preferredId) return true;
    if (shallowEntry.warehouseId === taxon.preferredId) return true;
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

    // backwards compatibility for old taxon structure. TODO: remove later once all uploaded.
    const oldTaxon = this.data.taxon as any;
    if (oldTaxon.warehouse_id) {
      Object.assign(this.data.taxon, {
        warehouseId: oldTaxon.warehouse_id,
        scientificName: oldTaxon.scientific_name,
        commonName: oldTaxon.common_name,
        foundInName: oldTaxon.found_in_name,
        taxonGroupId: oldTaxon.group,
        warehouse_id: null, // eslint-disable-line @typescript-eslint/naming-convention
      });
    }

    // backwards compatibility for old attrs. TODO: remove later once all uploaded.
    if ((this.data as any).zero_abundance) {
      Object.assign(this.data, {
        zeroAbundance: (this.data as any).zero_abundance,
        zero_abundance: null, // eslint-disable-line @typescript-eslint/naming-convention
      });
    }
  }

  getTaxonName() {
    const { taxon } = this.data;
    if (!taxon) return null;

    if (!taxon.foundInName) return taxon.scientificName;

    return taxon[taxon.foundInName];
  }

  isDragonflyTaxon = () =>
    this.data.taxon.taxonGroupId === DRAGONFLY_GROUP ||
    this.data.taxon.taxonGroupId === speciesGroups.dragonflies.listId; // backwards compatibility, remove later

  async identify() {
    const identifyAllImages = (media: Media) => media.identify();

    // [sp1, null, sp2, sp3 ]
    const allSuggestions = await Promise.all(this.media.map(identifyAllImages));

    // [sp1, sp2, sp3 ]
    const suggestions = allSuggestions.filter(val => !!val);

    const highestProbSpecies = this.getTopSuggestion(suggestions);
    if (!highestProbSpecies) return this.data.taxon;

    this.data.taxon = {
      foundInName: highestProbSpecies.foundInName,
      commonName: highestProbSpecies.commonName,
      taxonGroupId: highestProbSpecies.group,
      probability: highestProbSpecies.probability,
      scientificName: highestProbSpecies.scientificName,
      warehouseId: highestProbSpecies.warehouseId,

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
      this?.data?.taxon?.warehouseId === PAINTED_LADY_OCCURRENCE ||
      this?.data?.taxon?.scientificName === 'Vanessa cardui' // for remote cached
    );
  }

  getPrettyName() {
    const { taxon } = this.data;
    if (!taxon) return '';

    if (taxon?.commonName) return taxon.commonName;

    return taxon.scientificName;
  }

  getSpeciesGroupIcon2 = () =>
    (speciesGroupIcons as any)[this.data.taxon.taxonGroupId!];

  doesTaxonMatch = (taxon: Taxon) => {
    if (this.data.taxon.warehouseId === taxon.warehouseId) return true;
    if (this.data.taxon.warehouseId === taxon.preferredId) return true;

    if (this.data.taxon.preferredId) {
      if (this.data.taxon.preferredId === taxon.preferredId) return true;
      if (this.data.taxon.preferredId === taxon.warehouseId) return true;
    }

    if (taxon.preferredId) {
      if (this.data.taxon.preferredId === taxon.preferredId) return true;
      if (this.data.taxon.warehouseId === taxon.preferredId) return true;
    }

    return false;
  };

  getTopSuggestion(suggestions?: Suggestion[]) {
    // eslint-disable-next-line no-param-reassign
    suggestions = suggestions || this.data.taxon?.suggestions;

    let highestProbSpecies: Suggestion | undefined;

    const findHighestProbSpecies = (sp: Suggestion) => {
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
      { probability, taxon: taxon_name_given, warehouseId }: Suggestion,
      index: number
    ) => {
      const topSpecies = index === 0;
      const classifierChosen = topSpecies ? 't' : 'f';
      const humanChosen = warehouseId === taxon?.warehouseId ? 't' : 'f';

      /* eslint-disable @typescript-eslint/naming-convention */
      return {
        values: {
          taxon_name_given,
          probability_given: probability,
          taxa_taxon_list_id: warehouseId,
          classifier_chosen: classifierChosen,
          human_chosen: humanChosen,
        },
      };
      /* eslint-enable @typescript-eslint/naming-convention */
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
      values.machine_involvement = taxon?.machineInvolvement;
    }

    return {
      values,

      /* eslint-disable @typescript-eslint/naming-convention */
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
      /* eslint-enable @typescript-eslint/naming-convention */
    };
  }
}
