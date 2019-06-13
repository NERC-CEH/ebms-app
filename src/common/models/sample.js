/** ****************************************************************************
 * Indicia Sample.
 **************************************************************************** */
/* eslint-disable react/no-this-in-sfc */
import * as Yup from 'yup';
import Indicia from 'indicia';
import { observable, toJS } from 'mobx';
import CONFIG from 'config';
import userModel from 'user_model';
import appModel from 'app_model';
import Occurrence from 'occurrence';
import Log from 'helpers/log';
import Device from 'helpers/device';
import store from '../store';
import GPSExtension from './sample_gps_ext';

const locationSchema = Yup.object().shape({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
  area: Yup.number().required(), // TODO: max 20,000,000 m²
  shape: Yup.number().required(),
  source: Yup.string().required(),
});

const schema = Yup.object().shape({
  location: Yup.mixed().test('area', 'Area is not valid.', val => {
    try {
      locationSchema.validateSync(val);
    } catch (e) {
      return false;
    }
    return true;
  }),

  surveyStartTime: Yup.date().required('Date is missing'),
  location_type: Yup.string()
    .matches(/latlon/)
    .required('Location type is missing'),
});

// eslint-disable-next-line
let Sample = Indicia.Sample.extend({
  api_key: CONFIG.indicia.api_key,
  host_url: CONFIG.indicia.host,
  user: userModel.getUser.bind(userModel),
  password: userModel.getPassword.bind(userModel),

  store, // offline store

  Occurrence,

  metadata() {
    return {
      saved: null,
      training: appModel.get('useTraining'),
    };
  },

  // warehouse attribute keys
  keys() {
    return CONFIG.indicia.attrs.smp;
  },

  /**
   * Need a function because Device might not be ready on module load.
   * @returns {{device: *, device_version: *}}
   */
  defaults() {
    return {
      surveyStartTime: null,
      entered_sref_system: 4326, // lat long
      location: null,
    };
  },

  initialize() {
    this.attributes = observable(this.attributes);
    this.metadata = observable(this.metadata);
    this.remote = observable({ synchronising: null });
    this.media.models = observable(this.media.models);
    this.occurrences.models = observable(this.occurrences.models);

    // for mobx to keep same refs
    this.media.models.add = (...args) =>
      Indicia.Collection.prototype.add.apply(this, [...args, { sort: false }]);

    this.gpsExtensionInit();
  },

  /**
   * Disable sort for mobx to keep the same refs.
   * @param mediaObj
   */
  addMedia(mediaObj) {
    if (!mediaObj) return;
    mediaObj.setParent(this);
    this.media.add(mediaObj, { sort: false });
  },

  validateRemote() {
    try {
      schema.validateSync(this.attributes);
    } catch (e) {
      return e;
    }
    return null;
  },

  /**
   * Changes the plain survey key to survey specific metadata
   */
  onSend(submission, media) {
    const newAttrs = {
      survey_id: CONFIG.indicia.id,
      input_form: CONFIG.indicia.webForm,
    };

    const smpAttrs = this.keys();
    const updatedSubmission = Object.assign({}, submission, newAttrs);
    updatedSubmission.fields = Object.assign({}, updatedSubmission.fields, {
      [smpAttrs.device.id]: smpAttrs.device.values[Device.getPlatform()],
      [smpAttrs.device_version.id]: Device.getVersion(),
      [smpAttrs.app_version.id]: `${CONFIG.version}.${CONFIG.build}`,
    });

    // add the survey_id to subsamples too
    if (this.metadata.complex_survey) {
      updatedSubmission.samples.forEach(subSample => {
        subSample.survey_id = surveyConfig.id; // eslint-disable-line
        subSample.input_form = surveyConfig.webForm; // eslint-disable-line
      });
    }

    return Promise.resolve([updatedSubmission, media]);
  },

  /**
   * Set the sample for submission and send it.
   */
  setToSend() {
    // don't change it's status if already saved
    if (this.metadata.saved) {
      return Promise.resolve(this);
    }

    // TODO: remove this once clear why the resubmission occurs
    // https://www.brc.ac.uk/irecord/node/7194
    if (this.id || this.metadata.server_on) {
      // an error, this should never happen
      Log(
        'SampleModel: trying to set a record for submission that is already sent!',
        'w'
      );
    }

    this.metadata.saved = true;

    if (!this.isValid({ remote: true })) {
      // since the sample was invalid and so was not saved
      // we need to revert it's status
      this.metadata.saved = false;
      return false;
    }

    Log('SampleModel: was set to send.');

    // save sample
    return this.save();
  },

  // TODO: remove this once clear why the resubmission occurs
  // https://www.brc.ac.uk/irecord/node/7194
  _syncRemote(...args) {
    const { remote } = args[2] || {};

    if (remote && (this.id || this.metadata.server_on)) {
      // an error, this should never happen
      Log('SampleModel: trying to send a record that is already sent!', 'w');
      return Promise.resolve({ data: {} });
    }

    return Indicia.Sample.prototype._syncRemote.apply(this, args);
  },

  toJSON() {
    const json = Indicia.Sample.prototype.toJSON.apply(this);
    json.attributes = toJS(json.attributes);
    return json;
  },

  timeout() {
    if (!Device.connectionWifi()) {
      return 180000; // 3 min
    }
    return 60000; // 1 min
  },
});

// add geolocation functionality
Sample = Sample.extend(GPSExtension);

export { Sample as default };
