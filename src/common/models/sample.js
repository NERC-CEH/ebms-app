/** ****************************************************************************
 * Indicia Sample.
 **************************************************************************** */
import { observable } from 'mobx';
import CONFIG from 'config';
import userModel from 'userModel';
import appModel from 'appModel';
import Log from 'helpers/log';
import { device, Sample, validateRemoteModel } from '@apps';
import surveys from 'common/config/surveys';
import Occurrence from './occurrence';
import Media from './media';
import { modelStore } from './store';
import GPSExtension from './sample_gps_ext';
import VibrateExtension from './sample_vibrate_ext';
import MetOfficeExtension from './sample_metoffice_ext';

// eslint-disable-next-line
class AppSample extends Sample {
  store = modelStore;

  constructor(...args) {
    super(...args);

    this.remote = observable({
      api_key: CONFIG.indicia.api_key,
      host_url: CONFIG.indicia.host,
      user: userModel.getUser.bind(userModel),
      password: userModel.getPassword.bind(userModel),
      synchronising: false,
    });

    this.metadata = observable({
      training: appModel.attrs.useTraining,
      saved: null,
      survey: null,
      ...this.metadata,
    });

    this.shallowSpeciesList = observable([]);

    this.timerPausedTime = observable({ time: null });

    this.gpsExtensionInit();
  }

  keys = () => {
    return { ...Sample.keys, ...this.getSurvey().attrs };
  };

  static fromJSON(json) {
    return super.fromJSON(json, Occurrence, AppSample, Media);
  }

  getSurvey() {
    const surveyName = this.metadata.survey || 'area'; // !survey - for backwards compatibility

    const survey = surveys[surveyName];
    if (!survey) {
      throw new Error('No survey config was found');
    }

    if (this.parent) {
      return survey.smp;
    }

    return survey;
  }

  isDisabled() {
    if (this.parent) {
      return this.parent.isDisabled();
    }

    return !!this.metadata.synced_on;
  }

  async saveRemote() {
    if (this.id || this.metadata.server_on) {
      // This should never happen
      // TODO: remove this once clear why the resubmission occurs
      // https://www.brc.ac.uk/irecord/node/7194
      Log('SampleModel: trying to send a record that is already sent!', 'w');
      return Promise.resolve({ data: {} });
    }

    this.error.message = null;

    await super.saveRemote();
    return this.save();
  }

  validateRemote = validateRemoteModel;

  _attachTopSampleSubmission(updatedSubmission) {
    const isTopSample = !this.parent;
    if (!isTopSample) {
      return;
    }

    const keys = this.keys();

    const appAndDeviceFields = {
      [keys.device.id]: keys.device.values[device.getPlatform()],
      [keys.device_version.id]: device.getVersion(),
      [keys.app_version.id]: `${CONFIG.version}.${CONFIG.build}`,
    };

    // eslint-disable-next-line no-param-reassign
    updatedSubmission.fields = {
      ...updatedSubmission.fields,
      ...appAndDeviceFields,
    };
  }

  _attachSubSampleSubmission(updatedSubmission) {
    const isTopSample = !this.parent;
    if (isTopSample) {
      return;
    }

    updatedSubmission.survey_id = this.parent.getSurvey().id; // eslint-disable-line no-param-reassign
  }

  getSubmission(...args) {
    let submission;
    let media;

    const survey = this.getSurvey();
    if (survey.getSubmission) {
      [submission, media] = survey.getSubmission(this, ...args);
    } else {
      [submission, media] = super.getSubmission(...args);
    }

    const newAttrs = {
      survey_id: survey.id,
      input_form: survey.webForm,
    };
    const updatedSubmission = { ...submission, ...newAttrs };

    this._attachTopSampleSubmission(updatedSubmission);
    this._attachSubSampleSubmission(updatedSubmission);

    return [updatedSubmission, media];
  }

  getPrettyName() {
    if (!this.parent || this.metadata.survey !== 'precise-area') {
      return '';
    }

    return this.occurrences[0].getTaxonName();
  }
}

// add geolocation functionality
Sample.prototype = Object.assign(Sample.prototype, GPSExtension);
Sample.prototype = Object.assign(Sample.prototype, VibrateExtension);
Sample.prototype = Object.assign(Sample.prototype, MetOfficeExtension);
Sample.prototype.constructor = Sample;

export { AppSample as default };
