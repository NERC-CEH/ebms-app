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
  type SQLiteSession,
  SQLiteSyncDialect,
} from 'drizzle-orm/sqlite-core';
import { snakeCase } from 'lodash';
import { Geolocation, Position } from '@capacitor/geolocation';
import {
  LocationModel,
  LocationData,
  LocationOptions,
  LocationDTO,
  validateRemoteModel,
  useAlert,
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

const toSnakeCase = (attrs: object) =>
  Object.entries(attrs).reduce<Record<string, unknown>>(
    (result, [attr, value]) => {
      const attrModified = attr.includes('locAttr:') ? attr : snakeCase(attr);
      result[attrModified] = value;
      return result;
    },
    {}
  );

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
  [trapCountAttr.id]: string;
};

export type Data = LocationData &
  Pick<MothTrapAttrs, 'location'> &
  Partial<Omit<MothTrapAttrs, 'location'> & SiteAttrs & BaitTrapSiteAttrs>;

type GPSLocation = MothTrapAttrs['location'] & {
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
};

class Location extends LocationModel<Data> {
  static fromDTO(
    { id, createdOn, updatedOn, externalKey, ...data }: LocationDTO,
    options?: LocationOptions<Data>
  ) {
    const existingCid = id ? locations.idMap.get(id)?.cid : undefined;
    const parsedRemoteJSON: LocationOptions<Data> = {
      cid: existingCid || externalKey || UUIDv7(),
      id,
      createdAt: new Date(createdOn!).getTime(),
      updatedAt: new Date(updatedOn!).getTime(),
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

    const parseLamp = (lamp: unknown) => {
      try {
        if (!lamp || typeof lamp !== 'object' || !('value' in lamp))
          throw new Error();

        return JSON.parse(String(lamp.value)) as Lamp;
      } catch (error) {
        throw new Error('Could not parse a lamp');
      }
    };

    const remoteLamps = parsedRemoteJSON.data?.[mothTrapLampsAttr.id];
    parsedRemoteJSON.data![mothTrapLampsAttr.id] =
      remoteLamps?.map(parseLamp) || [];

    return new this(parsedRemoteJSON);
  }

  validateRemote = validateRemoteModel;

  gps: { locating: null | string } = observable({ locating: null });

  declare media: IObservableArray<Media>;

  private _groupCids: IObservableArray<string>;

  private _taxonListCids: IObservableArray<string>;

  constructor({
    skipStore,
    media = [],
    metadata = {},
    groupCids,
    taxonListCids,
    ...options
  }: LocationOptions<Data> & {
    groupCids?: string[];
    taxonListCids?: string[];
  }) {
    super({
      store: skipStore ? undefined : locationsStore,
      url: config.backend.indicia.url,
      getAccessToken: () => userModel.getAccessToken(),
      Media,
      media,
      metadata,
      ...options,
    });

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
        {} as SQLiteSession<
          'sync',
          unknown,
          Record<string, never>,
          Record<string, never>
        >,
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
    const stringifiedLamps = (this.data[mothTrapLampsAttr.id] || []).map(l =>
      JSON.stringify(l)
    );

    const snakeValues = toSnakeCase({ ...this.data });

    return {
      ...snakeValues,
      [mothTrapLampsAttr.id]: stringifiedLamps,
    };
  }

  toDTO(warehouseMediaNames = {}) {
    const transformBoolean = (attrs: Record<string, unknown>) =>
      Object.entries(attrs).reduce((result, [attr, value]) => {
        if (typeof value === 'boolean') result[attr] = value;
        return result;
      }, attrs);

    const data = this.data[mothTrapTypeAttr.id]
      ? this.toMothTrapDTO()
      : transformBoolean(toSnakeCase(this.data));

    /* eslint-disable @typescript-eslint/naming-convention */
    const submission = {
      values: { external_key: this.cid, ...data },
      media: [] as ReturnType<Media['toDTO']>[],
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

      callback(error: Error | null, location?: GPSLocation) {
        if (error) {
          that.stopGPS();
          return;
        }
        if (!location) return;
        if (location.accuracy <= options.accuracyLimit) {
          that.stopGPS();
        }

        updateModelLocation(that, {
          ...location,
          altitude: location.altitude ?? undefined,
          altitudeAccuracy: location.altitudeAccuracy ?? undefined,
        });
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

  start(options?: {
    callback?: (error: Error | null, location?: GPSLocation) => void;
    onUpdate?: (location: GPSLocation) => void;
  }) {
    const { callback, onUpdate } = options || {};
    const accuracyLimit = 100;

    // geolocation config
    const GPSoptions = {
      enableHighAccuracy: true,
    };

    const onPosition = (
      position: Position | null,
      error?: { message: string }
    ) => {
      if (error) {
        callback?.(new Error(error.message));
        return;
      }

      if (!position) return;

      const location = {
        latitude: Number(position.coords.latitude.toFixed(8)),
        longitude: Number(position.coords.longitude.toFixed(8)),
        accuracy: Math.trunc(position.coords.accuracy),
        altitude:
          typeof position.coords.altitude === 'number'
            ? Math.trunc(position.coords.altitude)
            : null,
        altitudeAccuracy:
          typeof position.coords.altitudeAccuracy === 'number'
            ? Math.trunc(position.coords.altitudeAccuracy)
            : null,
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
