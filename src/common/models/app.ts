import { IObservableArray, observable } from 'mobx';
import { Species as ReportSpecies } from 'src/Home/Report/services';
import { Model, ModelData, ModelOptions } from '@flumens';
import { CountryCode } from 'common/config/countries';
import { LanguageCode } from 'common/config/languages';
import groups from 'common/data/groups';
import { mainStore } from './store';

export type SurveyDraftKeys = {
  'draftId:precise-area'?: string;
  'draftId:precise-single-species-area'?: string;
  'draftId:transect'?: string;
  'draftId:moth'?: string;
  'draftId:bait-trap'?: string;
};

export const DEFAULT_SPECIES_GROUP = [groups.butterflies.id];

export type TaxonNameDisplayType =
  'commonScientific' | 'commonOnly' | 'scientificOnly';

export type SpeciesListSortOrder = 'alphabetical' | 'lastAdded' | 'lastEdited';

export type Data = ModelData & {
  showedWelcome: boolean;
  language: LanguageCode | null;
  country?: CountryCode;
  useTraining: boolean;
  feedbackGiven: boolean;
  speciesListSortOrder: SpeciesListSortOrder;

  speciesGroups: number[];
  useDayFlyingMothsOnly: boolean;
  locations: unknown[];
  taxonGroupFilters?: number[];
  /**
   * Default user group/project ID.
   */
  defaultGroupId?: string;
  useImageIdentifier: boolean;
  useExperiments: boolean;
  sendAnalytics: boolean;
  appSession: number;
  showGuideHelpTip: boolean;
  showSurveysDeleteTip: boolean;
  showSurveyUploadTip: boolean;
  showCopySpeciesTip: boolean;
  // showWhatsNewInVersion122: boolean;
  showGPSPermissionTip: boolean;
  showCopyHelpTip: boolean;
  /**
   * Timestamp of last species lists automatic update.
   */
  taxonListsUpdatedAt?: number;
  taxonNameDisplay: TaxonNameDisplayType;
  /** offset in minutes applied to default moth survey sunset start/end times */
  mothSunsetOffset: number;
  /** offset in minutes applied to default moth survey sunrise end time */
  mothSunriseOffset: number;
} & SurveyDraftKeys;

const defaults: Data = {
  showedWelcome: false,
  useTraining: false,
  language: null,
  country: undefined,
  feedbackGiven: false,
  speciesListSortOrder: 'alphabetical',
  showGPSPermissionTip: true,

  'draftId:precise-area': '',
  'draftId:precise-single-species-area': '',
  'draftId:transect': '',
  'draftId:moth': '',

  speciesGroups: DEFAULT_SPECIES_GROUP,
  useDayFlyingMothsOnly: false,
  locations: [],

  useImageIdentifier: true,
  useExperiments: false,
  sendAnalytics: true,
  appSession: 0,
  taxonNameDisplay: 'commonScientific',
  mothSunsetOffset: 0,
  mothSunriseOffset: 0,

  // tips
  showCopyHelpTip: true,
  showGuideHelpTip: true,
  showSurveysDeleteTip: true,
  showSurveyUploadTip: true,
  showCopySpeciesTip: true,
};

export class AppModel extends Model<Data> {
  speciesReport: IObservableArray<ReportSpecies> = observable([]);

  constructor(options: ModelOptions<Data>) {
    super({ ...options, data: { ...defaults, ...options.data } });
  }

  cycleSpeciesListSortOrder() {
    const sortCycle: Record<SpeciesListSortOrder, SpeciesListSortOrder> = {
      alphabetical: 'lastAdded',
      lastAdded: 'lastEdited',
      lastEdited: 'alphabetical',
    };

    this.data.speciesListSortOrder =
      sortCycle[this.data.speciesListSortOrder] || 'alphabetical';
    this.save();

    const orders = {
      alphabetical: 'survey.changedListOrderingAlphabetical',
      lastAdded: 'survey.changedListOrderingLastAdded',
      lastEdited: 'survey.changedListOrderingLastEdited',
    };
    return orders[this.data.speciesListSortOrder];
  }

  toggleTaxonFilter(filter: number) {
    this.data.taxonGroupFilters ||= [];
    const { taxonGroupFilters } = this.data;
    const index = taxonGroupFilters.indexOf(filter);
    if (index >= 0) {
      taxonGroupFilters.splice(index, 1);
    } else {
      taxonGroupFilters.push(filter);
    }

    this.save();
  }

  reset() {
    return super.reset(defaults);
  }
}

const appModel = new AppModel({ cid: 'app', store: mainStore });
export default appModel;
