/** ****************************************************************************
 * App model. Persistent.
 **************************************************************************** */
import Log from 'helpers/log';
import { observable, toJS, set as setMobXAttrs } from 'mobx';
import makeRequest from 'common/helpers/makeRequest';
import CONFIG from 'config';
import * as Yup from 'yup';
import { store } from './store';

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
  const userAuth = btoa(`${userModel.attrs.name}:${userModel.attrs.password}`);
  const url = `${CONFIG.site_url}api/v1/reports/projects/ebms/ebms_app_sites_list.xml`;
  const options = {
    qs: {
      website_id: CONFIG.indicia.website_id,
      userID: userModel.attrs.drupalID,
      location_type_id: '',
      locattrs: '',
    },
    headers: {
      authorization: `Basic ${userAuth}`,
      'x-api-key': CONFIG.indicia.api_key,
      'content-type': 'application/json',
    },
  };

  let transects;
  try {
    transects = await makeRequest(url, options, CONFIG.users.timeout);
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
  const userAuth = btoa(`${userModel.attrs.name}:${userModel.attrs.password}`);
  const url = `${CONFIG.site_url}api/v1/reports/projects/ebms/ebms_app_sections_list.xml`;
  const options = {
    qs: {
      website_id: CONFIG.indicia.website_id,
      userID: userModel.attrs.drupalID,
      location_list: transectLocationIds,
    },
    headers: {
      authorization: `Basic ${userAuth}`,
      'x-api-key': CONFIG.indicia.api_key,
      'content-type': 'application/json',
    },
  };

  let sections;
  try {
    sections = await makeRequest(url, options, CONFIG.users.timeout);
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

const getDefaultAttrs = () => ({
  showedWelcome: false,
  language: null,
  country: null,
  useTraining: false,
  feedbackGiven: false,
  areaSurveyListSortedByTime: false,
  areaCountDraftId: null,
  transectDraftId: null,

  transects: [],

  useExperiments: false,
  sendAnalytics: true,
  appSession: 0,

  showGuideHelpTip: true,
});

class AppModel {
  @observable attrs = getDefaultAttrs();

  @observable speciesReport = [];

  constructor() {
    Log('AppModel: initializing');
    this._init = store.find('app').then(app => {
      if (typeof app === 'string') {
        // backwards compatibility
        app = JSON.parse(app); // eslint-disable-line
      }

      if (!app) {
        Log('AppModel: persisting for the first time');
        this.save();
        return;
      }

      setMobXAttrs(this.attrs, app.attrs);
    });
  }

  async save() {
    return store.save('app', { attrs: toJS(this.attrs) });
  }

  resetDefaults() {
    setMobXAttrs(this.attrs, getDefaultAttrs());
    return this.save();
  }

  async updateUserTransects(userModel) {
    const transects = await fetchUserTransects(userModel);

    if (!transects.length) {
      return;
    }

    const transectLocationIds = transects.map(t => t.id).join(',');
    const sectionsList = await fetchTransectSections(
      transectLocationIds,
      userModel
    );

    const normalizeTransectsWithSections = section => {
      const transect = transects.find(t => t.id === section.parent_id);
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

const appModel = new AppModel();
export { appModel as default, AppModel };
