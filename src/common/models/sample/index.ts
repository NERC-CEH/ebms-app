import { observable } from 'mobx';
import config from 'common/config';
import userModel from 'models/user';
import appModel from 'models/app';
import {
  device,
  getDeepErrorMessage,
  useAlert,
  Sample,
  SampleAttrs,
  SampleOptions,
} from '@flumens';
import surveys from 'common/config/surveys';
import Occurrence from '../occurrence';
import Media from '../media';
import { modelStore } from '../store';
import GPSExtension from './GPSExt';
import VibrateExtension from './vibrateExt';
import MetOfficeExtension from './metofficeExt';

type Attrs = SampleAttrs & {
  date?: any;
  location?: any;
  surveyStartTime?: any;
  surveyEndTime?: any;
  recorder?: any;
  comment?: any;
  cloud?: any;
  temperature?: any;
  windDirection?: any;
  windSpeed?: any;
};

export default class AppSample extends Sample {
  static fromJSON(json: any) {
    return super.fromJSON(json, Occurrence, AppSample, Media);
  }

  store = modelStore;

  attrs: Attrs = this.attrs;

  occurrences: Occurrence[] = this.occurrences;

  samples: AppSample[] = this.samples;

  media: Media[] = this.media;

  shallowSpeciesList = observable([]);

  timerPausedTime = observable<any>({ time: null });

  gpsExtensionInit: any; // from extension

  setLocation: any; // from extension

  isGPSRunning: any; // from extension

  toggleGPStracking: any; // from extension

  startGPS: any; // from extension

  stopGPS: any; // from extension

  stopVibrateCounter: any; // from extension

  hasLoctionMissingAndIsnotLocating: any; // from extension

  constructor(options: SampleOptions) {
    super(options);

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

    const surveyName = this.metadata.survey || 'area'; // !survey - for backwards compatibility
    this.survey = surveys[surveyName];

    Object.assign(this, VibrateExtension);
    Object.assign(this, MetOfficeExtension);
    Object.assign(this, GPSExtension);
    this.gpsExtensionInit();
  }

  destroy(silent?: boolean) {
    this.cleanUp();
    return super.destroy(silent);
  }

  cleanUp = () => {
    this.stopGPS();
    const stopGPS = (smp: AppSample) => smp.stopGPS();
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
    if (this.remote.synchronising || this.isUploaded()) return true;

    const invalids = this.validateRemote();
    if (invalids) return false;

    if (!device.isOnline) return false;

    const isActivated = await userModel.checkActivation();
    if (!isActivated) return false;

    this.cleanUp();

    return this.saveRemote();
  }

  isSurveyPreciseSingleSpecies = () =>
    this.metadata.survey === 'precise-single-species-area';

  hasZeroAbundance = () => {
    if (this.parent) {
      return this.parent.samples[0].occurrences[0].attrs.zero_abundance;
    }

    return this.samples[0].occurrences[0].attrs.zero_abundance;
  };

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

  isDetailsComplete() {
    return this.metadata.completedDetails;
  }
}

export const useValidateCheck = (sample: AppSample) => {
  const alert = useAlert();

  return () => {
    const invalids = sample.validateRemote();
    if (invalids) {
      alert({
        header: 'Survey incomplete',
        message: getDeepErrorMessage(invalids),
        buttons: [
          {
            text: 'Got it',
            role: 'cancel',
          },
        ],
      });
      return false;
    }
    return true;
  };
};