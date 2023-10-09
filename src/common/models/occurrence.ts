import { IObservableArray } from 'mobx';
import {
  Occurrence as OccurrenceOriginal,
  OccurrenceAttrs,
  validateRemoteModel,
  ElasticOccurrence,
  ElasticOccurrenceMedia,
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
import Sample, { surveyConfigsByCode } from './sample';
import { parseRemoteAttrs } from './sample/remoteExt';

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

export default class Occurrence extends OccurrenceOriginal<Attrs> {
  /**
   * Transform ES document into local structure.
   */
  static parseRemoteJSON({
    id,
    event,
    metadata,
    occurrence,
    taxon,
  }: ElasticOccurrence) {
    const date = new Date(metadata.created_on).toISOString();
    const updatedOn = new Date(metadata.updated_on).toISOString();

    const survey = surveyConfigsByCode[metadata.survey.id];
    const hasParent = event.parent_event_id;

    let surveyAttrs = hasParent ? survey.smp?.occ?.attrs : survey.occ?.attrs;
    if (!surveyAttrs) {
      // sometimes we drop subSamples on upload so the structure changes
      surveyAttrs = survey.smp.occ.attrs! || survey.occ.attrs;
    }

    const parsedAttributes = parseRemoteAttrs(
      surveyAttrs,
      occurrence.attributes || []
    );

    const getMedia = ({ path }: ElasticOccurrenceMedia) => ({
      id: path,
      metadata: { updatedOn: date, createdOn: date, syncedOn: date },
      attrs: { data: `${config.backend.mediaUrl}${path}` },
    });
    const media = occurrence.media?.map(getMedia);

    const scientificName = taxon.species;
    const commonName =
      scientificName !== taxon.taxon_name ? taxon.taxon_name : '';

    return {
      id,
      cid: event.source_system_key || id,
      metadata: {
        updatedOn,
        createdOn: date,
        syncedOn: Date.now(),
      },
      attrs: {
        ...parsedAttributes,
        taxon: {
          warehouse_id: parseInt(taxon.taxa_taxon_list_id, 10),
          scientific_name: scientificName,
          common_name: commonName,
          found_in_name: commonName ? 'common_name' : 'scientific_name',
        },
        comment: occurrence.occurrence_remarks,
      },

      media,
    };
  }

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
      this?.attrs?.taxon?.warehouse_id === PAINTED_LADY_OCCURRENCE ||
      this?.attrs?.taxon?.scientific_name === 'Vanessa cardui' // for remote cached
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

  doesTaxonMatch = (taxon: Taxon) => {
    if (this.attrs.taxon.warehouse_id === taxon.warehouse_id) return true;
    if (this.attrs.taxon.warehouse_id === taxon.preferredId) return true;

    if (this.attrs.taxon.preferredId) {
      if (this.attrs.taxon.preferredId === taxon.preferredId) return true;
      if (this.attrs.taxon.preferredId === taxon.warehouse_id) return true;
    }

    if (taxon.preferredId) {
      if (this.attrs.taxon.preferredId === taxon.preferredId) return true;
      if (this.attrs.taxon.warehouse_id === taxon.preferredId) return true;
    }

    return false;
  };

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
