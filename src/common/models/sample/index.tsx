import { IObservableArray, observable } from 'mobx';
import { useTranslation } from 'react-i18next';
import wkt from 'wellknown';
import {
  device,
  ModelValidationMessage,
  useAlert,
  Sample as SampleOriginal,
  SampleAttrs,
  SampleOptions as SampleOptionsOriginal,
  SampleMetadata,
  ElasticSample,
  ElasticSampleMedia,
  Location as SampleLocation,
} from '@flumens';
import config from 'common/config';
import groups from 'common/data/groups';
import appModel from 'models/app';
import userModel from 'models/user';
import areaSurvey from 'Survey/AreaCount/config';
import areaOldSurvey from 'Survey/AreaCount/configOld';
import areaSingleSpeciesSurvey from 'Survey/AreaCount/configSpecies';
import mothSurvey from 'Survey/Moth/config';
import transectSurvey from 'Survey/Transect/config';
import { Survey } from 'Survey/common/config';
import { RemoteAttributes as LocationAttributes } from '../location';
import Media from '../media';
import Occurrence, { SpeciesGroup } from '../occurrence';
import { modelStore } from '../store';
import GPSExtension, { calculateArea } from './GPSExt';
import RemoteExtension, { parseRemoteAttrs } from './remoteExt';
import VibrateExtension from './vibrateExt';

export type Project = {
  /**
   * Remote (warehouse) project ID.
   */
  id: string;
  /**
   * Project's title.
   */
  name: string;
};

export type Site = LocationAttributes;

export type TransectLocation = LocationAttributes;

export type MothTrapLocation = {
  attrs: {
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

export type Attrs = SampleAttrs & {
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
  speciesGroups: string[];
  project?: Project;
  site?: Site;
  privacyPrecision?: number;

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
  [areaOldSurvey.name]: areaOldSurvey as Survey, // deprecated
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

  speciesGroups?: any[];
};

type SampleOptions = SampleOptionsOriginal & { skipStore?: boolean };

export default class Sample extends SampleOriginal<Attrs, Metadata> {
  /**
   * Transform ES document into local structure.
   */
  static parseRemoteJSON({ id, event, location, metadata }: ElasticSample) {
    const survey = surveyConfigsByCode[metadata.survey.id];
    const date = new Date(event.date_start).toISOString();
    const updatedOn = new Date(metadata.updated_on).toISOString();

    const [latitude, longitude] = location.point.split(',').map(parseFloat);

    const gridref =
      location.output_sref_system === 'OSGB' ? location.output_sref : '';

    const shape = location.geom ? wkt.parse(location.geom) : null;

    const hasParent = event.parent_event_id;
    const parsedAttributes = parseRemoteAttrs(
      hasParent ? survey.smp.attrs! : survey.attrs,
      event.attributes || []
    );

    const getMedia = ({ path }: ElasticSampleMedia) => ({
      id: path,
      metadata: { updatedOn: date, createdOn: date, syncedOn: date },
      attrs: { data: `${config.backend.mediaUrl}${path}` },
    });
    const media = event.media?.map(getMedia);

    return {
      id,
      cid: event.source_system_key || id,
      metadata: {
        saved: true,
        survey: survey.name,
        updatedOn,
        createdOn: date,
        syncedOn: Date.now(),
      },
      attrs: {
        ...parsedAttributes,
        date,
        location: {
          code: location.code,
          name: location.name,
          latitude,
          longitude,
          shape,
          area: calculateArea(shape),
          gridref,
        },
        comment: event.event_remarks,
        training: metadata.trial === 'true',
      },

      media,
    };
  }

  static fromJSON(json: any) {
    return super.fromJSON(json, Occurrence, Sample, Media) as Sample;
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

  stopVibrateCounter: any; // from extension

  startVibrateCounter: any; // from extension

  hasLoctionMissingAndIsnotLocating: any; // from extension

  fetchRemote: any; // from extension

  isPartial: any; // from extension

  constructor({ skipStore, ...options }: SampleOptions) {
    super({
      store: skipStore ? undefined : modelStore,
      ...options,
    });

    this.remote.url = `${config.backend.indicia.url}/index.php/services/rest`;
    // eslint-disable-next-line
    this.remote.headers = async () => ({
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    });

    const surveyName = this.metadata.survey;
    this.survey = surveyConfigs[surveyName];

    if (!this.metadata.survey) {
      // TODO: remove in the future
      console.error('Fixing missing config', JSON.stringify(this.metadata));
      this.metadata.survey = areaSurvey.name;
      this.metadata.survey_id = areaSurvey.id;
      this.survey = areaSurvey;
      this.save();
    }

    Object.assign(this, VibrateExtension);
    Object.assign(this, GPSExtension);
    Object.assign(this, RemoteExtension);
    this.gpsExtensionInit();
  }

  isCached = () => !this._store;

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
    if (this.isDisabled()) return true;

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

    const uniqueSpeciesGroupList = Array.from(new Set(array));

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

export function bySurveyDate(sample1: Sample, sample2: Sample) {
  const date1 = new Date(sample1.attrs.date);
  const moveToTop = !date1 || date1.toString() === 'Invalid Date';
  if (moveToTop) return -1;

  const date2 = new Date(sample2.attrs.date);
  return date2.getTime() - date1.getTime();
}
