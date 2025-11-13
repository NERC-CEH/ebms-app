import { IObservableArray, observable } from 'mobx';
import { useTranslation } from 'react-i18next';
import {
  device,
  ModelValidationMessage,
  useAlert,
  SampleModel,
  SampleAttrs,
  SampleOptions,
  SampleMetadata,
  Location as SampleLocation,
  ElasticSample,
} from '@flumens';
import config from 'common/config';
import groups, { SpeciesGroup } from 'common/data/groups';
import appModel from 'models/app';
import userModel from 'models/user';
import areaSurvey from 'Survey/AreaCount/config';
import areaSingleSpeciesSurvey from 'Survey/AreaCount/configSpecies';
import mothSurvey from 'Survey/Moth/config';
import transectSurvey from 'Survey/Transect/config';
import { Survey } from 'Survey/common/config';
import { Data as LocationAttributes } from '../location';
import Media from '../media';
import Occurrence from '../occurrence';
import { samplesStore } from '../store';
import GPSExtension, { calculateArea } from './GPSExt';
import VibrateExtension from './vibrateExt';

export type Group = {
  /**
   * Remote (warehouse) group ID.
   */
  id: string;
  /**
   * Group's title.
   */
  title: string;
};

export type Site = LocationAttributes;

export type TransectLocation = LocationAttributes;

export type MothTrapLocation = {
  data: {
    deleted: boolean;
    type: string;
    typeOther?: string;
    location: { name: string; latitude: number; longitude: number };
  };
  name: string;
  id: string;
  cid: string;
};

export type AreaCountLocation = SampleLocation & {
  name: string;
  area?: number;
};

export type Location = AreaCountLocation | MothTrapLocation | TransectLocation;

export type Data = SampleAttrs & {
  date?: any;
  location?: Location;
  surveyStartTime?: string;
  surveyEndTime?: string;
  recorder?: any;
  comment?: any;
  cloud?: any;
  temperature?: any;
  windDirection?: any;
  windSpeed?: any;
  reliability?: string;
  recorders?: number;
  speciesGroups: number[];
  group?: Group;
  site?: Site;
  privacyPrecision?: number;
  groupId?: number;

  // moth survey attributes
  wind: string;
  temperatureEnd: number;
  directionEnd: string;
  windEnd: string;
  cloudEnd: number;
  moon?: string;
  moonEnd?: string;
};

export const surveyConfigs = {
  [areaSurvey.name]: areaSurvey,
  [areaSingleSpeciesSurvey.name]: areaSingleSpeciesSurvey,
  [transectSurvey.name]: transectSurvey,
  [mothSurvey.name]: mothSurvey,
};

export const surveyConfigsByCode = Object.values(surveyConfigs).reduce<any>(
  (agg: any, survey: Survey) => {
    if (survey.deprecated) return agg;

    // eslint-disable-next-line no-param-reassign
    agg[survey.id] = survey;
    return agg;
  },
  {}
);

type Metadata = SampleMetadata & {
  /**
   * Survey name.
   */
  survey: keyof typeof surveyConfigs;
  /**
   * Survey id.
   */
  survey_id: number;
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
};

export default class Sample extends SampleModel<Data, Metadata> {
  static fromElasticDTO(json: ElasticSample, options: any, survey?: any) {
    const parsed = super.fromElasticDTO(json, options, survey) as any;
    if (parsed.data?.location?.shape) {
      parsed.data.location.area = calculateArea(parsed.data?.location?.shape);
    }

    return parsed;
  }

  declare occurrences: IObservableArray<Occurrence>;

  declare samples: IObservableArray<Sample>;

  declare media: IObservableArray<Media>;

  declare parent?: Sample;

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

  stopVibrateCounter: any; // from extension

  startVibrateCounter: any; // from extension

  hasLoctionMissingAndIsnotLocating: any; // from extension

  constructor(options: SampleOptions) {
    super({
      ...options,
      url: config.backend.indicia.url,
      getAccessToken: () => userModel.getAccessToken(),
      Occurrence,
      Media,
      store: samplesStore,
    });

    Object.assign(this, VibrateExtension);
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

  getSurvey(): Survey {
    if (this.parent) return (this.parent.getSurvey().smp as Survey) || {};

    let survey = surveyConfigsByCode[this.data.surveyId as any];

    if (!survey) {
      const surveyName = this.metadata.survey;
      survey = surveyConfigs[surveyName];
    }

    if (!survey) {
      console.log(JSON.stringify(this.metadata));
      console.log(JSON.stringify(this.data));
      console.error(`Survey config was missing`);
      return {} as Survey;
    }

    return survey;
  }

  getPrettyName() {
    if (!this.parent || this.metadata.survey !== 'precise-area') {
      return '';
    }

    return this.occurrences[0].getTaxonName();
  }

  async upload() {
    if (
      this.isSynchronising ||
      this.isUploaded ||
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
      return this.parent.samples[0].occurrences[0].data.zero_abundance;
    }

    return this.samples[0].occurrences[0].data.zero_abundance;
  };

  /**
   * Area count methods.
   */
  isTimerPaused = () => !!this.timerPausedTime.time;

  getTimerEndTime = () => {
    const startTime = new Date(this.data.surveyStartTime!);

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
    if (this.isDisabled) return true;

    const isMothSurvey = this.metadata.survey === 'moth';
    return isMothSurvey ? this.metadata.completedDetails : true;
  }

  setMissingSpeciesGroups() {
    if (!this.data.speciesGroups) {
      this.data.speciesGroups = [];
      this.save();
    }

    const checkIfNewSpeciesGroupsAreAdded = (smp: Sample) => {
      const byTaxonGroup = (group: SpeciesGroup) =>
        group.id === smp.occurrences[0].data.taxon.group ||
        group.listId === smp.occurrences[0].data.taxon.group; // backward compatibility, some old samples use listId
      const speciesGroups = Object.values(groups).find(byTaxonGroup);
      if (!speciesGroups) return;

      const missingSpeciesGroup = !this.data.speciesGroups.includes(
        speciesGroups.id
      );

      if (missingSpeciesGroup) {
        this.data.speciesGroups.push(speciesGroups.id);
      }
    };

    this.samples.forEach(checkIfNewSpeciesGroupsAreAdded);
    this.save();
  }

  setPreviousSpeciesGroups() {
    if (this.metadata.survey === 'moth') return;

    this.data.speciesGroups = appModel.data.speciesGroups;
    this.metadata.useDayFlyingMothsOnly = appModel.data.useDayFlyingMothsOnly;
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

export const useValidateCheck = (sample?: Sample) => {
  const alert = useAlert();
  const { t } = useTranslation();

  return () => {
    const invalids = sample?.validateRemote();
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

export function bySurveyDate(sample1: Sample, sample2: Sample) {
  const date1 = new Date(sample1.data.date);
  const moveToTop = !date1 || date1.toString() === 'Invalid Date';
  if (moveToTop) return -1;

  const date2 = new Date(sample2.data.date);
  return date2.getTime() - date1.getTime();
}
