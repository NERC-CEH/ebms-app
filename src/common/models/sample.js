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

const { warn, error } = toast;

// eslint-disable-next-line
class AppSample extends Sample {
  static fromJSON(json) {
    return super.fromJSON(json, Occurrence, AppSample, Media);
  }

  store = modelStore;

  constructor(...args) {
    super(...args);

    this.remote.url = `${config.backend.indicia.url}/index.php/services/rest`;
    // eslint-disable-next-line
    this.remote.headers = async () => ({
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    });

    this.metadata = observable({
      training: appModel.attrs.useTraining ? 't' : null,
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

  async upload() {
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

    const isActivated = await userModel.checkActivation();
    if (!isActivated) {
      return false;
    }

    this.cleanUp();
    this.saveRemote().catch(e => {
      error(e);
      throw e;
    });

    return true;
  }

  /**
   * Area count methods.
   */
  isTimerPaused = () => !!this.timerPausedTime.time;

  getTimerEndTime = () => {
    const startTime = new Date(this.attrs.surveyStartTime);

    return (
      startTime.getTime() +
      config.DEFAULT_SURVEY_TIME +
      this.metadata.pausedTime
    );
  };

  isTimerFinished = () => {
    if (this.isTimerPaused()) return false;

    return this.getTimerEndTime() < new Date().getTime();
  };
}

export { AppSample as default };
