/** ****************************************************************************
 * App model. Persistent.
 **************************************************************************** */
import Log from 'helpers/log';
import { observable, set as setMobXAttrs } from 'mobx';
import { getStore } from 'common/store';

const getDefaultAttrs = () => ({
  showedWelcome: false,
  language: null,
  country: null,
  useTraining: false,
  feedbackGiven: false,
  areaSurveyListSortedByTime: false,
  areaCountDraftId: null,
  
  useExperiments: false,
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
