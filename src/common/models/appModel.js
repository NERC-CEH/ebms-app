/** ****************************************************************************
 * App model. Persistent.
 **************************************************************************** */
import { Model } from '@apps';
import { observable } from 'mobx';
import axios from 'axios';
import CONFIG from 'config';
import * as Yup from 'yup';
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

const parseGeometries = s => ({
  ...s,
  ...{ geom: JSON.parse(s.geom) },
});

async function fetchUserTransects(userModel) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/reports/projects/ebms/ebms_app_sites_list.xml`;
  const options = {
    params: {
      website_id: CONFIG.backend.websiteId,
      userID: userModel.attrs.id,
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

    const replaceSectionsCountWithArray = t => ({
      ...t,
      ...{ sections: [] },
    });
    transects = [...transects.data].map(replaceSectionsCountWithArray);

    const deduplicateTransects = transectsArray => {
      const assignById = (agg, t) => ({ ...agg, [t.id]: t });
      const transectsObject = transectsArray.reduce(assignById, {});
      return Object.values(transectsObject);
    };

    transects = deduplicateTransects(transects); // for some reason the warehouse report returns duplicates
  } catch (e) {
    throw new Error(t(e.message));
  }

  return transects;
}

async function fetchTransectSections(transectLocationIds, userModel) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/reports/projects/ebms/ebms_app_sections_list.xml`;
  const options = {
    params: {
      website_id: CONFIG.backend.websiteId,
      userID: userModel.attrs.id,
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
  } catch (e) {
    throw new Error(t(e.message));
  }

  return sections;
}

class AppModel extends Model {
  @observable speciesReport = [];

  async updateUserTransects(userModel) {
    const transects = await fetchUserTransects(userModel);

    if (!transects.length) {
      return;
    }

    const getLocationsId = t => t.id;
    const transectLocationIds = transects.map(getLocationsId).join(',');
    const sectionsList = await fetchTransectSections(
      transectLocationIds,
      userModel
    );

    const normalizeTransectsWithSections = section => {
      const byId = t => t.id === section.parent_id;
      const transect = transects.find(byId);
      transect.sections.push(section);
    };
    sectionsList.forEach(normalizeTransectsWithSections);

    this.attrs.transects = transects;
    await this.save();
  }

  toggleTaxonFilter(filter) {
    const { taxonGroupFilters } = this.attrs;
    const index = taxonGroupFilters.indexOf(filter);
    if (index >= 0) {
      taxonGroupFilters.splice(index, 1);
    } else {
      taxonGroupFilters.push(filter);
    }

    this.save();
  }
}

const defaults = {
  showedWelcome: false,
  language: null,
  country: null,
  useTraining: false,
  feedbackGiven: false,
  areaSurveyListSortedByTime: false,

  'draftId:precise-area': null,
  'draftId:precise-single-species-area': null,
  'draftId:transect': null,
  'draftId:moth': null,

  speciesGroups: ['butterflies'],
  transects: [],

  primarySurvey: 'precise-area',

  useImageIdentifier: true,
  showWhatsNewInVersion115: true,
  useExperiments: false,
  sendAnalytics: true,
  appSession: 0,

  // tips
  showGuideHelpTip: true,
  showSurveysDeleteTip: true,
  showSurveyUploadTip: true,
  showCopySpeciesTip: true,
};

const appModel = new AppModel(genericStore, 'app', defaults);
export { appModel as default, AppModel };
