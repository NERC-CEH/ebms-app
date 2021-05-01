/** ****************************************************************************
 * Indicia Sample.
 **************************************************************************** */
import { observable } from 'mobx';
import config from 'config';
import userModel from 'userModel';
import appModel from 'appModel';
import { Sample, showInvalidsMessage, device, toast } from '@apps';
import surveys from 'common/config/surveys';
import Occurrence from './occurrence';
import Media from './media';
import { modelStore } from './store';
import GPSExtension from './sample_gps_ext';
import VibrateExtension from './sample_vibrate_ext';
import MetOfficeExtension from './sample_metoffice_ext';

const { warn } = toast;

// eslint-disable-next-line
class AppSample extends Sample {
  static fromJSON(json) {
    return super.fromJSON(json, Occurrence, AppSample, Media);
  }

  store = modelStore;

  constructor(...args) {
    super(...args);

    this.remote = observable({
      api_key: config.backend.apiKey,
      host_url: `${config.backend.url}/`,
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

    const surveyName = this.metadata.survey || 'area'; // !survey - for backwards compatibility
    this.survey = surveys[surveyName];

    Object.assign(this, VibrateExtension);
    Object.assign(this, MetOfficeExtension);
    Object.assign(this, GPSExtension);
    this.gpsExtensionInit();
  }

  destroy = () => {
    this.cleanUp();
    super.destroy();
  };

  cleanUp = () => {
    this.stopGPS();
    const stopGPS = smp => smp.stopGPS();
    this.samples.forEach(stopGPS);
    this.stopVibrateCounter();
  };

  getPrettyName() {
    if (!this.parent || this.metadata.survey !== 'precise-area') {
      return '';
    }

    return this.occurrences[0].getTaxonName();
  }

  upload() {
    if (this.remote.synchronising) {
      return true;
    }

    const invalids = this.validateRemote();
    if (invalids) {
      showInvalidsMessage(invalids);
      return false;
    }

    if (!device.isOnline()) {
      warn('Looks like you are offline!');
      return false;
    }

    this.cleanUp();
    this.saveRemote();

    return true;
  }
}

export { AppSample as default };
