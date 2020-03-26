/** ****************************************************************************
 * Indicia Sample.
 **************************************************************************** */
import * as Yup from 'yup';
import _ from 'lodash';
import Indicia from '@indicia-js/core';
import { observable, intercept, toJS } from 'mobx';
import CONFIG from 'config';
import userModel from 'user_model';
import appModel from 'app_model';
import Log from 'helpers/log';
import Device from 'helpers/device';
import Occurrence from './occurrence';
import Media from './image';
import { modelStore } from '../store';
import GPSExtension from './sample_gps_ext';
import VibrateExtension from './sample_vibrate_ext';

const locationSchema = Yup.object().shape({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
  area: Yup.number()
    .max(20000000, 'Please select a smaller area.')
    .required(),
  shape: Yup.object().required(),
  source: Yup.string().required(),
});

const transectLocationSchema = Yup.object().shape({
  id: Yup.string().required(),
  centroid_sref: Yup.string().required(),
  sref_system: Yup.string().required(),
});

const areaCountSchema = Yup.object().shape({
  location: Yup.mixed().test(
    'area',
    'Please add survey area information.',
    val => {
      if (!val) {
        return false;
      }
      locationSchema.validateSync(val);
      return true;
    }
  ),

  surveyStartTime: Yup.date().required('Date is missing'),
  location_type: Yup.string()
    .matches(/latlon/)
    .required('Location type is missing'),
});

const transectSchema = Yup.object().shape({
  location: Yup.mixed().test('area', 'Please select your transect.', val => {
    if (!val) {
      return false;
    }
    transectLocationSchema.validateSync(val);
    return true;
  }),
  recorder: Yup.string().required('Recorder info is missing'),
  surveyStartTime: Yup.date().required('Start time is missing'),
  // surveyEndTime: Yup.date().required('End time is missing'), // automatically set on send
  temperature: Yup.string().required('Temperature info is missing'),
  windSpeed: Yup.string().required('Wind speed info is missing'),
});

// eslint-disable-next-line
class Sample extends Indicia.Sample {
  static fromJSON(json) {
    return super.fromJSON(json, Occurrence, Sample, Media);
  }

  store = modelStore;

  constructor(...args) {
    super(...args);

    this.attrs = observable(this.attrs);
    this.error = observable({ message: null });
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
    this.samples = observable(this.samples);
    this.occurrences = observable(this.occurrences);
    this.media = observable(this.media);

    this.timerPausedTime = observable({ time: null });

    const onAddedSetParent = change => {
      if (change.added && change.added.length) {
        const model = change.added[0];
        model.parent = this;
      }

      return change;
    };
    intercept(this.samples, onAddedSetParent);
    intercept(this.occurrences, onAddedSetParent);
    intercept(this.media, onAddedSetParent);

    this.gpsExtensionInit();
  }

  keys = () => {
    return {
      ...Indicia.Sample.keys,
      ...CONFIG.indicia.surveys[this.getSurvey()].attrs.smp,
    };
  };

  validateRemote() {
    let attributes;

    if (this.parent) {
      // no verification for transect subsamples yet
      return null;
    }

    try {
      const survey = this.getSurvey();
      survey === 'transect'
        ? transectSchema.validateSync(this.attrs, { abortEarly: false })
        : areaCountSchema.validateSync(this.attrs, { abortEarly: false });
    } catch (attrError) {
      attributes = attrError;
    }

    const validateSubModel = (agg, model) => {
      if (model.validateRemote) {
        const invalids = model.validateRemote();
        if (invalids) {
          return { [model.cid]: invalids, ...agg };
        }
      }

      return agg;
    };

    const samples = this.samples.reduce(validateSubModel, {});
    const occurrences = this.occurrences.reduce(validateSubModel, {});
    const media = this.media.reduce(validateSubModel, {});

    if (
      !_.isEmpty(attributes) ||
      !_.isEmpty(samples) ||
      !_.isEmpty(occurrences) ||
      !_.isEmpty(media)
    ) {
      return { attributes, samples, occurrences, media };
    }

    return null;
  }

  toJSON() {
    return toJS(super.toJSON(), { recurseEverything: true });
  }

  _attachTopSampleSubmission(updatedSubmission) {
    const isTopSample = !this.parent;
    if (!isTopSample) {
      return;
    }

    const keys = this.keys();

    const appAndDeviceFields = {
      [keys.device.id]: keys.device.values[Device.getPlatform()],
      [keys.device_version.id]: Device.getVersion(),
      [keys.app_version.id]: `${CONFIG.version}.${CONFIG.build}`,
    };

    // eslint-disable-next-line no-param-reassign
    updatedSubmission.fields = {
      ...updatedSubmission.fields,
      ...appAndDeviceFields,
    };
  }

  _attachSubSampleSubmission(updatedSubmission, parentSurvey) {
    const isTopSample = !this.parent;
    if (isTopSample) {
      return;
    }

    updatedSubmission.survey_id = parentSurvey.id; // eslint-disable-line no-param-reassign
  }

  getSubmission(...args) {
    const [submission, media] = super.getSubmission(...args);
    const surveyName = this.getSurvey();
    const survey = CONFIG.indicia.surveys[surveyName];

    const newAttrs = {
      survey_id: survey.id,
      input_form: survey.webForm,
    };
    const updatedSubmission = { ...submission, ...newAttrs };

    this._attachTopSampleSubmission(updatedSubmission);
    this._attachSubSampleSubmission(updatedSubmission, survey);

    return [updatedSubmission, media];
  }

  async save() {
    if (this.parent) {
      return this.parent.save();
    }

    if (!this.store) {
      return Promise.reject(
        new Error('Trying to sync locally without a store')
      );
    }

    await this.store.save(this.cid, this.toJSON());
    return this;
  }

  async destroy(silent) {
    const destroySubModels = () =>
      Promise.all([
        Promise.all(this.media.map(media => media.destroy(true))),
        Promise.all(this.occurrences.map(occ => occ.destroy(true))),
      ]);

    if (this.parent) {
      this.parent.samples.remove(this);

      await destroySubModels();

      if (silent) {
        return null;
      }

      return this.parent.save();
    }

    if (!this.store) {
      return Promise.reject(
        new Error('Trying to sync locally without a store')
      );
    }

    await this.store.destroy(this.cid);

    if (this.collection) {
      this.collection.remove(this);
    }

    await destroySubModels();

    return this;
  }

  getSurvey() {
    return this.metadata.survey || 'area'; // !survey - for backwards compatibility
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

  getSectionSample(id) {
    return this.samples.find(s => s.cid === id);
  }
}

// add geolocation functionality
Sample.prototype = Object.assign(Sample.prototype, GPSExtension);
Sample.prototype = Object.assign(Sample.prototype, VibrateExtension);
Sample.prototype.constructor = Sample;

export { Sample as default };
