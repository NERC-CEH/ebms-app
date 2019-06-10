/** ****************************************************************************
 * Indicia Sample.
 **************************************************************************** */
/* eslint-disable react/no-this-in-sfc */
import _ from 'lodash';
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
      entered_sref_system: 4326, // lat long
      location: {
        latitude: null,
        longitude: null,
        source: null,
        shape: [],
        area: null,
      },
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

  validateRemote(attributes) {
    const attrs = _.extend({}, this.attributes, attributes);

    const sample = {};
    const occurrences = {};

    // location
    const location = attrs.location || {};
    if (!location.latitude || !location.longitude) {
      sample.location = 'missing';
    }

    // location area
    if (!attrs.area) {
      sample.area = "can't be blank";
    }

    // date
    if (!attrs.date) {
      sample.date = 'missing';
    } else {
      const date = new Date(attrs.date);
      if (date === 'Invalid Date' || date > new Date()) {
        sample.date = new Date(date) > new Date() ? 'future date' : 'invalid';
      }
    }

    // occurrences
    this.occurrences.each(occurrence => {
      const errors = occurrence.validate(null, { remote: true });
      if (errors) {
        sample.occurrence = 'no species selected';
      }
    });

    if (!_.isEmpty(sample) || !_.isEmpty(occurrences)) {
      const errors = {
        sample,
        occurrences,
      };
      return errors;
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
