import { observable } from 'mobx';
import { Model, ModelAttrs } from '@flumens';
import { CountryCode } from 'common/config/countries';
import { LanguageCode } from 'common/config/languages';
import { genericStore } from '../store';
import PastLocationsExtension from './pastLocExt';

export type SurveyDraftKeys = {
  'draftId:precise-area'?: string;
  'draftId:precise-single-species-area'?: string;
  'draftId:transect'?: string;
  'draftId:moth'?: string | null;
};

export const DEFAULT_SPECIES_GROUP = ['butterflies'];

export type Attrs = ModelAttrs & {
  showedWelcome: boolean;
  language?: LanguageCode;
  country?: CountryCode;
  useTraining: boolean;
  feedbackGiven: boolean;
  areaSurveyListSortedByTime: boolean;

  speciesGroups: string[];
  useDayFlyingMothsOnly: boolean;
  /**
   * Instead of local species show all available species names when surveying.
   */
  useGlobalSpeciesList: boolean;
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
  showWhatsNew: boolean;
  showWhatsNewInVersion122: boolean;
  showGPSPermissionTip: boolean;
  showCommonNamesInGuide: boolean;
  showCopyHelpTip: boolean;
  transectsRefreshTimestamp: number | null;
} & SurveyDraftKeys;

const defaults: Attrs = {
  showedWelcome: false,
  useTraining: false,
  language: undefined,
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
  useGlobalSpeciesList: false,
  locations: [],

  primarySurvey: 'precise-area',

  useImageIdentifier: true,
  showWhatsNewInVersion122: true,
  useExperiments: false,
  sendAnalytics: true,
  appSession: 0,
  showCommonNamesInGuide: true,

  showWhatsNew: true,

  // tips
  showCopyHelpTip: true,
  showGuideHelpTip: true,
  showSurveysDeleteTip: true,
  showSurveyUploadTip: true,
  showCopySpeciesTip: true,
};

export class AppModel extends Model {
  // eslint-disable-next-line
  // @ts-ignore
  attrs: Attrs = Model.extendAttrs(this.attrs, defaults);

  setLocation: any; // from extension

  removeLocation: any; // from extension

  speciesReport = observable([]);

  constructor(options: any) {
    super(options);

    Object.assign(this, PastLocationsExtension);
  }

  toggleTaxonFilter(filter: any) {
    const { taxonGroupFilters } = this.attrs;
    const index = taxonGroupFilters.indexOf(filter);
    if (index >= 0) {
      taxonGroupFilters.splice(index, 1);
    } else {
      taxonGroupFilters.push(filter);
    }

    this.save();
  }

  resetDefaults() {
    return super.resetDefaults(defaults);
  }
}

const appModel = new AppModel({ cid: 'app', store: genericStore });
export default appModel;
