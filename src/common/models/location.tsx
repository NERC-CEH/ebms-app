import { IObservableArray, observable } from 'mobx';
import {
  Lamp,
  mothTrapLampsAttr,
  mothTrapOtherTypeAttr,
  mothTrapTypeAttr,
  mothTrapUserAttr,
} from 'Location/MothTrap/New/config';
import { responsibleAttr } from 'Location/Site/NewSiteModal/config';
import {
  SQLiteInsertBuilder,
  SQLiteSyncDialect,
} from 'drizzle-orm/sqlite-core';
import { snakeCase } from 'lodash';
import { Geolocation } from '@capacitor/geolocation';
import {
  LocationModel,
  LocationData,
  LocationOptions,
  validateRemoteModel,
  useAlert,
  ModelData,
  updateModelLocation,
  ModelValidationMessage,
  UUIDv7,
} from '@flumens';
import config from 'common/config';
import userModel from 'models/user';
import locations from './collections/locations';
import Group from './group';
import Media from './media';
import { locationsStore } from './store';
import TaxonList from './taxonList';

const toSnakeCase = (attrs: any) =>
  Object.entries(attrs).reduce((agg: any, [attr, value]): any => {
    const attrModified = attr.includes('locAttr:') ? attr : snakeCase(attr);
    agg[attrModified] = value; // eslint-disable-line no-param-reassign
    return agg;
  }, {});

export { locationDtoSchema as dtoSchema, LocationType } from '@flumens';

export type MothTrapAttrs = {
  [mothTrapTypeAttr.id]: string;
  [mothTrapOtherTypeAttr.id]: string | null;
  [mothTrapLampsAttr.id]: Lamp[];
  [mothTrapUserAttr.id]: string;
  location: {
    latitude: number;
    longitude: number;
  };
};

type SiteAttrs = {
  [responsibleAttr.id]: string;
};

export const trapCountAttr = { id: 'locAttr:428' } as const;

type BaitTrapSiteAttrs = {
  [trapCountAttr.id]: { value: string };
};

export type Data = LocationData &
  ModelData &
  MothTrapAttrs &
  SiteAttrs &
  BaitTrapSiteAttrs;

class Location extends LocationModel<Data> {
  static fromDTO(
    { id, createdOn, updatedOn, externalKey, ...data }: any,
    options?: LocationOptions
  ) {
    const existingCid = locations.idMap.get(id)?.cid;
    const parsedRemoteJSON: any = {
      cid: existingCid || externalKey || UUIDv7(),
      id,
      createdAt: new Date(createdOn).getTime(),
      updatedAt: new Date(updatedOn).getTime(),
      data: {
        id,
        createdAt: createdOn,
        location: {
          latitude: Number(data.lat),
          longitude: Number(data.lon),
        },
        ...data,
      },
      ...options,
    };

    const parseLamp = (lamp: any) => {
      try {
        return JSON.parse(lamp.value);
      } catch (error) {
        throw new Error('Could not parse a lamp');
      }
    };

    parsedRemoteJSON.data[mothTrapLampsAttr.id] =
      parsedRemoteJSON.data[mothTrapLampsAttr.id]?.map(parseLamp) || [];

    return new this(parsedRemoteJSON);
  }

  validateRemote = validateRemoteModel;

  gps: { locating: null | string } = observable({ locating: null });

  media: IObservableArray<Media>;

  private _groupCids: IObservableArray<string>;

  private _taxonListCids: IObservableArray<string>;

  constructor({
    skipStore,
    media = [],
    metadata = {},
    groupCids,
    taxonListCids,
    ...options
  }: LocationOptions & { groupCids?: string[]; taxonListCids?: string[] }) {
    super({
      store: skipStore ? undefined : locationsStore,
      url: config.backend.indicia.url,
      getAccessToken: () => userModel.getAccessToken(),
      ...options,
    });

    this.metadata = observable(metadata);

    this.media = observable(media);

    this._groupCids = observable([...new Set(groupCids || [])]);
    this._taxonListCids = observable([...new Set(taxonListCids || [])]);
  }

  get groupCids(): readonly string[] {
    return this._groupCids;
  }

  get taxonListCids(): readonly string[] {
    return this._taxonListCids;
  }

  async linkGroup(group: Group) {
    if (!this._groupCids.includes(group.cid)) {
      this._groupCids.push(group.cid);
    }

    if (!group.locationCids.includes(this.cid)) {
      await group.linkLocation(this);
    }
  }

  async linkTaxonList(taxonList: TaxonList) {
    if (!this._taxonListCids.includes(taxonList.cid)) {
      this._taxonListCids.push(taxonList.cid);

      // persist the link to the locations_lists join table
      const query = new SQLiteInsertBuilder(
        locationsStore.locationLists.table,
        {} as any,
        new SQLiteSyncDialect()
      )
        .values({ locationCid: this.cid, taxonListCid: taxonList.cid })
        .onConflictDoNothing();

      await locationsStore.locationLists.db.query(query.toSQL());
    }

    if (!taxonList.locationCids.includes(this.cid)) {
      await taxonList.linkLocation(this);
    }
  }

  private toMothTrapDTO() {
    const stringifiedLamps = this.data[mothTrapLampsAttr.id].map(l =>
      JSON.stringify(l)
    );

    const snakeValues = toSnakeCase({ ...this.data });

    return {
      ...snakeValues,
      [mothTrapLampsAttr.id]: stringifiedLamps,
    };
  }

  toDTO(warehouseMediaNames = {}) {
    const transformBoolean = (attrs: any) =>
      Object.entries(attrs).reduce((agg: any, [attr, value]: any) => {
        if (typeof value === 'boolean') {
          agg[attr] = value; // eslint-disable-line no-param-reassign
        }
        return agg;
      }, attrs);

    const data = this.data[mothTrapTypeAttr.id]
      ? this.toMothTrapDTO()
      : transformBoolean(toSnakeCase(this.data));

    /* eslint-disable @typescript-eslint/naming-convention */
    const submission: any = {
      values: { external_key: this.cid, ...data },
      media: [],
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    this.media.forEach(model => {
      const modelSubmission = model.toDTO(warehouseMediaNames);
      if (!modelSubmission) {
        return;
      }

      submission.media.push(modelSubmission);
    });

    return submission;
  }

  destroy() {
    this.cleanUp();

    return super.destroy();
  }

  cleanUp() {
    // TODO:
    this.stopGPS();
  }

  /** GPS extension start  */
  isGPSRunning() {
    return !!(this.gps.locating || this.gps.locating === '0');
  }

  async startGPS(accuracyLimit = 50) {
    const that = this;
    const options = {
      accuracyLimit,

      onUpdate() {},

      callback(error: any, location: any) {
        if (error) {
          that.stopGPS();
          return;
        }
        if (location.accuracy <= options.accuracyLimit) {
          that.stopGPS();
        }

        updateModelLocation(that, location);
      },
    };

    this.gps.locating = await this.start(options);
  }

  stopGPS() {
    if (!this.gps.locating) {
      return;
    }

    this.stop(this.gps.locating);
    this.gps.locating = null;
  }

  start(options = {}) {
    const { callback, onUpdate }: any = options;
    const accuracyLimit = 100;

    // geolocation config
    const GPSoptions = {
      enableHighAccuracy: true,
    };

    const onPosition = (position: any, err: any) => {
      if (err) {
        callback?.(new Error(err.message));
        return;
      }

      const location = {
        latitude: Number(position.coords.latitude.toFixed(8)),
        longitude: Number(position.coords.longitude.toFixed(8)),
        accuracy: parseInt(position.coords.accuracy, 10),
        altitude: parseInt(position.coords.altitude, 10),
        altitudeAccuracy: parseInt(position.coords.altitudeAccuracy, 10),
      };

      if (location.accuracy <= accuracyLimit) {
        callback?.(null, location);
      } else {
        onUpdate?.(location);
      }
    };

    return Geolocation.watchPosition(GPSoptions, onPosition);
  }

  stop(id: string) {
    if (!id) {
      return;
    }

    Geolocation.clearWatch({ id });
  }
  /** GPS extension end  */
}

export const useValidateCheck = () => {
  const alert = useAlert();

  const validate = (location: Location) => {
    const invalids = location.validateRemote();
    if (invalids) {
      alert({
        header: 'Incomplete',
        message: <ModelValidationMessage {...invalids} />,
        buttons: [
          {
            text: 'Got it',
            role: 'cancel',
          },
        ],
      });
      return true;
    }

    return false;
  };

  return validate;
};

export default Location;
