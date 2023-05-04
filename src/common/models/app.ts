import { Model, ModelAttrs } from '@flumens';
import { observable } from 'mobx';
import axios from 'axios';
import CONFIG from 'common/config';
import * as Yup from 'yup';
import { UserModel } from './user';
import { genericStore } from './store';

const transectsSchemaBackend = Yup.object().shape({
  data: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      name: Yup.string().required(),
      sections: Yup.string().required(),
    })
  ),
});

const sectionsSchemaBackend = Yup.object().shape({
  data: Yup.array()
    .of(
      Yup.object().shape({
        parent_id: Yup.string().required(),
        id: Yup.string().required(),
        name: Yup.string().required(),
        code: Yup.string().required(),
        centroid_sref: Yup.string().required(),
        sref_system: Yup.string().required(),
        geom: Yup.string().required(),
      })
    )
    .min(1, 'No sections were found for a transect'),
});

const parseGeometries = (s: any) => ({
  ...s,
  ...{ geom: JSON.parse(s.geom) },
});

async function fetchUserTransects(userModel: UserModel) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/reports/projects/ebms/ebms_app_sites_list.xml`;
  const options = {
    params: {
      website_id: CONFIG.backend.websiteId,
      userID: userModel.id,
      location_type_id: '',
      locattrs: '',
      limit: 3000,
    },
    headers: {
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    },
  };

  let transects;
  try {
    const res = await axios(url, options);
    transects = res.data;
    const isValidResponse = await transectsSchemaBackend.isValid(transects);

    if (!isValidResponse) {
      throw new Error('Invalid server response.');
    }

    const replaceSectionsCountWithArray = (t: any) => ({
      ...t,
      ...{ sections: [] },
    });
    transects = [...transects.data].map(replaceSectionsCountWithArray);

    const deduplicateTransects = (transectsArray: any) => {
      const assignById = (agg: any, t: any) => ({ ...agg, [t.id]: t });
      const transectsObject = transectsArray.reduce(assignById, {});
      return Object.values(transectsObject);
    };

    transects = deduplicateTransects(transects); // for some reason the warehouse report returns duplicates
  } catch (e: any) {
    throw new Error(e.message);
  }

  return transects;
}

async function fetchTransectSections(
  transectLocationIds: string,
  userModel: UserModel
) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/reports/projects/ebms/ebms_app_sections_list.xml`;
  const options = {
    params: {
      website_id: CONFIG.backend.websiteId,
      userID: userModel.id,
      location_list: transectLocationIds,
      limit: 3000,
    },
    headers: {
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    },
  };

  let sections;
  try {
    const res = await axios(url, options);
    sections = res.data;
    const isValidResponse = await sectionsSchemaBackend.isValid(sections);
    if (!isValidResponse) {
      throw new Error('Invalid server response.');
    }

    sections = [...sections.data].map(parseGeometries);
  } catch (e: any) {
    throw new Error(e.message);
  }

  return sections;
}

export type SurveyDraftKeys = {
  'draftId:precise-area'?: string;
  'draftId:precise-single-species-area'?: string;
  'draftId:transect'?: string;
  'draftId:moth'?: string | null;
};

export const DEFAULT_SPECIES_GROUP = ['butterflies'];

export type Attrs = ModelAttrs & {
  showedWelcome: boolean;
  language: string | null;
  country: any;
  useTraining: boolean;
  feedbackGiven: boolean;
  areaSurveyListSortedByTime: boolean;

  speciesGroups: string[];
  useDayFlyingMothsOnly: boolean;
  transects: any;
  taxonGroupFilters?: any;
  primarySurvey: any;
  useImageIdentifier: boolean;
  useExperiments: boolean;
  sendAnalytics: boolean;
  appSession: any;
  showGuideHelpTip: boolean;
  showSurveysDeleteTip: boolean;
  showSurveyUploadTip: boolean;
  showCopySpeciesTip: boolean;
  showWhatsNewInVersion120: boolean;
  showGPSPermissionTip: boolean;
  showCommonNamesInGuide: boolean;
  showCopyHelpTip: boolean;
  transectsRefreshTimestamp: number | null;
} & SurveyDraftKeys;

const defaults: Attrs = {
  showedWelcome: false,
  language: null,
  country: null,
  useTraining: false,
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
  transects: [],

  primarySurvey: 'precise-area',

  useImageIdentifier: true,
  showWhatsNewInVersion120: true,
  useExperiments: false,
  sendAnalytics: true,
  appSession: 0,
  showCommonNamesInGuide: true,

  // tips
  showCopyHelpTip: true,
  showGuideHelpTip: true,
  showSurveysDeleteTip: true,
  showSurveyUploadTip: true,
  showCopySpeciesTip: true,
};

export class AppModel extends Model {
  attrs: Attrs = Model.extendAttrs(this.attrs, defaults);

  speciesReport = observable([]);

  async updateUserTransects(userModel: UserModel) {
    const transects = await fetchUserTransects(userModel);

    if (!transects.length) {
      return;
    }

    const getLocationsId = (t: any) => t.id;
    const transectLocationIds = transects.map(getLocationsId).join(',');
    const sectionsList = await fetchTransectSections(
      transectLocationIds,
      userModel
    );

    const normalizeTransectsWithSections = (section: any) => {
      const byId = (t: any) => t.id === section.parent_id;
      const transect = transects.find(byId) as any;
      transect.sections.push(section);
    };
    sectionsList.forEach(normalizeTransectsWithSections);

    this.attrs.transects = transects;
    await this.save();
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
