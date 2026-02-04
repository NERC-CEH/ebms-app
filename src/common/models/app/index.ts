import { IObservableArray, observable } from 'mobx';
import { Species as ReportSpecies } from 'src/Home/Report/services';
import { Model, ModelAttrs } from '@flumens';
import { CountryCode } from 'common/config/countries';
import { LanguageCode } from 'common/config/languages';
import groups from 'common/data/groups';
import { mainStore } from '../store';
import PastLocationsExtension from './pastLocExt';

export type SurveyDraftKeys = {
  'draftId:precise-area'?: string;
  'draftId:precise-single-species-area'?: string;
  'draftId:transect'?: string;
  'draftId:moth'?: string | null;
};

export const DEFAULT_SPECIES_GROUP = [groups.butterflies.id];

export type TaxonNameDisplayType =
  | 'commonScientific'
  | 'commonOnly'
  | 'scientificOnly';

export type Data = ModelAttrs & {
  showedWelcome: boolean;
  language?: LanguageCode | null;
  country?: CountryCode;
  useTraining: boolean;
  feedbackGiven: boolean;
  areaSurveyListSortedByTime: boolean;

  speciesGroups: number[];
  useDayFlyingMothsOnly: boolean;
  locations: any[];
  taxonGroupFilters?: any;
  primarySurvey: any;
  defaultGroup?: { title: string; id: string };
  useImageIdentifier: boolean;
  useExperiments: boolean;
  sendAnalytics: boolean;
  appSession: any;
  showGuideHelpTip: boolean;
  showSurveysDeleteTip: boolean;
  showSurveyUploadTip: boolean;
  showCopySpeciesTip: boolean;
  // showWhatsNewInVersion122: boolean;
  showGPSPermissionTip: boolean;
  showCopyHelpTip: boolean;
  transectsRefreshTimestamp: number | null;
  /**
   * Timestamp of last species lists automatic update.
   */
  speciesListsUpdatedAt?: number;
  taxonNameDisplay: TaxonNameDisplayType;
} & SurveyDraftKeys;

const defaults: Data = {
  showedWelcome: false,
  useTraining: false,
  language: null,
  country: undefined,
  feedbackGiven: false,
  areaSurveyListSortedByTime: false,
  showGPSPermissionTip: true,
  transectsRefreshTimestamp: null,

  'draftId:precise-area': '',
  'draftId:precise-single-species-area': '',
  'draftId:transect': '',
  'draftId:moth': '',

  speciesGroups: DEFAULT_SPECIES_GROUP,
  useDayFlyingMothsOnly: false,
  locations: [],

  primarySurvey: 'precise-area',

  useImageIdentifier: true,
  useExperiments: false,
  sendAnalytics: true,
  appSession: 0,
  taxonNameDisplay: 'commonScientific',

  // tips
  showCopyHelpTip: true,
  showGuideHelpTip: true,
  showSurveysDeleteTip: true,
  showSurveyUploadTip: true,
  showCopySpeciesTip: true,
};

export class AppModel extends Model<Data> {
  setLocation: any; // from extension

  removeLocation: any; // from extension

  speciesReport: IObservableArray<ReportSpecies> = observable([]);

  constructor(options: any) {
    super({ ...options, data: { ...defaults, ...options.data } });

    Object.assign(this, PastLocationsExtension);
  }

  toggleTaxonFilter(filter: any) {
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
