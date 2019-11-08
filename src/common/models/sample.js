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
      pausedTime: 0,
      survey: null,
      training: appModel.get('useTraining'),
    };
  },

  // warehouse attribute keys
  keys() {
    return CONFIG.indicia.surveys[this.getSurvey()].attrs.smp;
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
    this.error = observable({ message: null });
    this.attributes = observable(this.attributes);
    this.metadata = observable(this.metadata);
    this.remote = observable({ synchronising: null });
    this.timerPausedTime = observable({ time: null });
    this.media.models = observable(this.media.models);
    this.occurrences.models = observable(this.occurrences.models);

    // for mobx to keep same refs
    this.media.models.add = (...args) =>
      Indicia.Collection.prototype.add.apply(this, [...args, { sort: false }]);

    this.gpsExtensionInit();
  },

  getSurvey() {
    return this.metadata.survey || 'area'; // !survey - for backwards compatibility
  },

  destroy(...args) {
    this.toggleGPStracking(false);
    this.stopVibrateCounter();
    Indicia.Sample.prototype.destroy.apply(this, args);
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
    if (this.getSurvey() === 'transect') {
      try {
        console.log(toJS(this.attributes));
        transectSchema.validateSync(this.attributes);
      } catch (e) {
        return e;
      }
    } else {
      try {
        areaCountSchema.validateSync(this.attributes);
      } catch (e) {
        return e;
      }
    }

    return null;
  },

  /**
   * Changes the plain survey key to survey specific metadata
   */
  onSend(submission, media) {
    const newAttrs = {
      survey_id: CONFIG.indicia.surveys[this.getSurvey()].id,
      input_form: CONFIG.indicia.surveys[this.getSurvey()].webForm,
    };
    submission.samples.forEach(sample => {
      sample.survey_id = CONFIG.indicia.surveys[this.getSurvey()].id; // eslint-disable-line
    });

    const smpAttrs = this.keys();
    const updatedSubmission = { ...{}, ...submission, ...newAttrs };
    updatedSubmission.fields = {
      ...{},
      ...updatedSubmission.fields,
      ...{
        [smpAttrs.device.id]: smpAttrs.device.values[Device.getPlatform()],
        [smpAttrs.device_version.id]: Device.getVersion(),
        [smpAttrs.app_version.id]: `${CONFIG.version}.${CONFIG.build}`,
      },
    };

    return Promise.resolve([updatedSubmission, media]);
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
    json.metadata = toJS(json.metadata);
    return json;
  },

  getSectionSample(id) {
    return this.samples.models.find(s => s.cid === id);
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
Sample = Sample.extend(VibrateExtension);

export { Sample as default };
