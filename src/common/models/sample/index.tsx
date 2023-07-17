import { IObservableArray, observable } from 'mobx';
import { useTranslation } from 'react-i18next';
import {
  device,
  ModelValidationMessage,
  useAlert,
  Sample as SampleOriginal,
  SampleAttrs,
  SampleOptions,
  SampleMetadata,
} from '@flumens';
import config from 'common/config';
import groups from 'common/helpers/groups';
import appModel from 'models/app';
import userModel from 'models/user';
import areaSurvey from 'Survey/AreaCount/config';
import areaOldSurvey from 'Survey/AreaCount/configOld';
import areaSingleSpeciesSurvey from 'Survey/AreaCount/configSpecies';
import mothSurvey from 'Survey/Moth/config';
import transectSurvey from 'Survey/Transect/config';
import { Survey } from 'Survey/common/config';
import Media from '../media';
import Occurrence, { SpeciesGroup } from '../occurrence';
import { modelStore } from '../store';
import GPSExtension from './GPSExt';
import MetOfficeExtension from './metofficeExt';
import VibrateExtension from './vibrateExt';

type Attrs = SampleAttrs & {
  date?: any;
  location?: any;
  surveyStartTime?: string;
  surveyEndTime?: any;
  recorder?: any;
  comment?: any;
  cloud?: any;
  temperature?: any;
  windDirection?: any;
  windSpeed?: any;
  reliability?: string;
  recorders?: number;
  speciesGroups: string[];
};

export const surveyConfigs = {
  [areaSurvey.name]: areaSurvey,
  [areaOldSurvey.name]: areaOldSurvey as Survey, // deprecated
  [areaSingleSpeciesSurvey.name]: areaSingleSpeciesSurvey,
  [transectSurvey.name]: transectSurvey,
  [mothSurvey.name]: mothSurvey,
};

type Metadata = SampleMetadata & {
  /**
   * Survey name.
   */
  survey: keyof typeof surveyConfigs;
  /**
   * If the sample was saved and ready for upload.
   */
  saved?: boolean;
  /**
   * If the sample has basic top-level details entered.
   * Doesn't mean the details aren't changed and are valid though.
   */
  completedDetails?: boolean;

  useDayFlyingMothsOnly?: boolean;

  /**
   * How long the survey was paused in milliseconds.
   */
  pausedTime?: number;

  /**
   * Has large sections in the walked trail.
   */
  hasBigJump?: boolean;

  speciesGroups?: any[];
};

export default class Sample extends SampleOriginal<Attrs, Metadata> {
  static fromJSON(json: any) {
    return super.fromJSON(json, Occurrence, Sample, Media);
  }

  declare occurrences: IObservableArray<Occurrence>;

  declare samples: IObservableArray<Sample>;

  declare media: IObservableArray<Media>;

  declare parent?: Sample;

  declare survey: Survey;

  shallowSpeciesList = observable([]);

  copyAttributes = observable({});

  timerPausedTime = observable<any>({ time: null });

  gpsExtensionInit: any; // from extension

  setLocation: any; // from extension

  isGPSRunning: any; // from extension

  toggleGPStracking: any; // from extension

  gps: any; // from extension

  startGPS: any; // from extension

  stopGPS: any; // from extension

  startMetOfficePull: any; // from extension

  stopVibrateCounter: any; // from extension

  startVibrateCounter: any; // from extension

  hasLoctionMissingAndIsnotLocating: any; // from extension

  constructor(options: SampleOptions) {
    super({ ...options, store: modelStore });

    this.remote.url = `${config.backend.indicia.url}/index.php/services/rest`;
    // eslint-disable-next-line
    this.remote.headers = async () => ({
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    });

    const surveyName = this.metadata.survey;
    this.survey = surveyConfigs[surveyName];

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
    const stopGPS = (smp: Sample) => smp.stopGPS();
    this.samples.forEach(stopGPS);
    this.stopVibrateCounter();
  };

  getSurvey() {
    try {
      return super.getSurvey() as Survey;
    } catch (error) {
      console.error(`Survey config was missing ${this.metadata.survey}`);
      return {} as Survey;
    }
  }

  getPrettyName() {
    if (!this.parent || this.metadata.survey !== 'precise-area') {
      return '';
    }

    return this.occurrences[0].getTaxonName();
  }

  async upload() {
    if (
      this.remote.synchronising ||
      this.isUploaded() ||
      this.getSurvey().deprecated
    ) {
      return true;
    }

    const invalids = this.validateRemote();
    if (invalids) return false;

    if (!device.isOnline) return false;

    const isActivated = await userModel.checkActivation();
    if (!isActivated) return false;

    if (
      this.metadata.survey === 'precise-area' ||
      this.metadata.survey === 'precise-single-species-area'
    ) {
      this.setMissingSpeciesGroups();
    }

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
    const startTime = new Date(this.attrs.surveyStartTime!);

    return (
      startTime.getTime() +
      config.DEFAULT_SURVEY_TIME +
      this.metadata.pausedTime!
    );
  };

  isTimerFinished = () => {
    if (this.isTimerPaused()) return false;

    return this.getTimerEndTime() < new Date().getTime();
  };

  isDetailsComplete() {
    const isMothSurvey = this.metadata.survey === 'moth';
    return isMothSurvey ? this.metadata.completedDetails : true;
  }

  getSpeciesGroupList() {
    const array: string[] = [];

    const spGroups = Object.values(groups);
    this.samples.forEach(smp => {
      const spGroupValue = spGroups.find(
        (group: SpeciesGroup) =>
          group.id === smp.occurrences[0].attrs.taxon.group
      )?.value;

      if (!spGroupValue) return;

      array.push(spGroupValue);
    });

    const uniqueSpeciesGroupList = [...new Set(array)];

    const addDisableProperty = (value: SpeciesGroup) => {
      const disabled = uniqueSpeciesGroupList.includes(value.value);

      return {
        ...value,
        ...(disabled && { disabled }),
      };
    };

    const existingSpeciesGroupsInSample = (group: SpeciesGroup) => {
      const speciesGr = this.metadata?.speciesGroups?.length
        ? this.metadata?.speciesGroups
        : appModel.attrs.speciesGroups;

      const isUniqueGroup = uniqueSpeciesGroupList.includes(group.value);
      const isDuplicate = speciesGr.includes(group.value);

      if (isUniqueGroup && !isDuplicate) {
        return true;
      }

      return speciesGr.includes(group.value);
    };

    const byDisabledProperty = (groupA: SpeciesGroup, groupB: SpeciesGroup) => {
      if (!!groupB?.disabled < !!groupA?.disabled) {
        return -1;
      }
      if (!!groupB?.disabled > !!groupA?.disabled) {
        return 1;
      }

      return 0;
    };

    return [...Object.values(groups)]
      .filter(existingSpeciesGroupsInSample)
      .map(addDisableProperty)
      .sort(byDisabledProperty);
  }

  setMissingSpeciesGroups() {
    if (!this.attrs.speciesGroups) {
      this.attrs.speciesGroups = [];
      this.save();
    }

    const formattedGroups = Object.values(groups);

    const checkIfNewSpeciesGroupsAreAdded = (smp: Sample) => {
      const byTaxonGroup = (group: SpeciesGroup) =>
        group.id === smp.occurrences[0].attrs.taxon.group;
      const speciesGroups = formattedGroups.find(byTaxonGroup);

      if (!speciesGroups) return;

      const missingSpeciesGroup = !this.attrs.speciesGroups.includes(
        speciesGroups.value
      );

      if (missingSpeciesGroup) {
        this.attrs.speciesGroups.push(speciesGroups.value);
      }
    };

    this.samples.forEach(checkIfNewSpeciesGroupsAreAdded);
    this.save();
  }

  setPreviousSpeciesGroups() {
    if (this.metadata.survey === 'moth') return;

    this.metadata.speciesGroups = appModel.attrs.speciesGroups;
    this.metadata.useDayFlyingMothsOnly = appModel.attrs.useDayFlyingMothsOnly;
    this.save();
  }

  isPreciseSingleSpeciesSurvey() {
    return this.metadata.survey === 'precise-single-species-area';
  }

  isPaintedLadySurvey() {
    if (this.parent) {
      return (
        this.metadata.survey === 'precise-single-species-area' &&
        this.occurrences[0].isPaintedLadySpecies()
      );
    }

    return (
      this.metadata.survey === 'precise-single-species-area' &&
      this.samples[0].occurrences[0].isPaintedLadySpecies()
    );
  }
}

export const useValidateCheck = (sample: Sample) => {
  const alert = useAlert();
  const { t } = useTranslation();

  return () => {
    const invalids = sample.validateRemote();
    if (invalids) {
      alert({
        header: t('Survey incomplete'),
        skipTranslation: true,
        message: <ModelValidationMessage {...invalids} />,
        buttons: [
          {
            text: t('Got it'),
            role: 'cancel',
          },
        ],
      });
      return false;
    }
    return true;
  };
};
