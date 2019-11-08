/** ****************************************************************************
 * App model. Persistent.
 **************************************************************************** */
import Log from 'helpers/log';
import { observable, set as setMobXAttrs } from 'mobx';
import { getStore } from 'common/store';
import makeRequest from 'common/helpers/makeRequest';
import CONFIG from 'config';
import * as Yup from 'yup';

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
});

class AppModel {
  @observable attrs = getDefaultAttrs();

  constructor() {
    Log('AppModel: initializing');
    this._init = getStore()
      .then(store => store.getItem('app'))
      .then(appStr => {
        const app = JSON.parse(appStr);
        if (!app) {
          Log('AppModel: persisting for the first time');
          this._initDone = true;
          this.save();
          return;
        }

        setMobXAttrs(this.attrs, app.attrs);
        this._initDone = true;
      });
  }

  get(name) {
    return this.attrs[name];
  }

  set(name, value) {
    this.attrs[name] = value;
    return this;
  }

  save() {
    if (!this._initDone) {
      throw new Error(`App Model can't be saved before initialisation`);
    }
    const userStr = JSON.stringify({
      attrs: this.attrs,
    });
    return getStore().then(store => store.setItem('app', userStr));
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

    this.set('transects', transects);
    await this.save();
  }

  toggleTaxonFilter(filter) {
    const taxonGroupFilters = this.get('taxonGroupFilters');
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
