import { IObservableArray, observable } from 'mobx';
import { bulbOutline, chatboxOutline } from 'ionicons/icons';
import { snakeCase } from 'lodash';
import { z } from 'zod';
import { Geolocation } from '@capacitor/geolocation';
import {
  LocationModel,
  LocationData,
  LocationOptions,
  validateRemoteModel,
  useAlert,
  ModelAttrs,
  updateModelLocation,
  ModelValidationMessage,
  UUIDv7,
  LocationType,
} from '@flumens';
import { IonIcon } from '@ionic/react';
import mothTrap from 'common/images/moth-inside-icon.svg';
import numberIcon from 'common/images/number.svg';
import userModel from 'models/user';
import Media from './media';
import { locationsStore } from './store';
import { getLocalAttributes } from './utils';

export { locationDtoSchema as dtoSchema, LocationType } from '@flumens';

const mothTrapIcon = (<IonIcon src={mothTrap} className="size-6" />) as any;
const mothTrapNumberIcon = (
  <IonIcon src={numberIcon} className="size-6" />
) as any;
const mothTrapBulbIcon = (
  <IonIcon src={bulbOutline} className="size-6" />
) as any;
const chatboxOutlineIcon = (
  <IonIcon src={chatboxOutline} className="size-6" />
) as any;

export const mothTrapTypeAttr = {
  id: 'locAttr:330',
  type: 'choiceInput',
  title: 'Type',
  appearance: 'button',
  prefix: mothTrapIcon,
  choices: [
    { title: 'LED funnel trap', dataName: '19306' },
    { title: 'Other funnel trap', dataName: '19307' },
    { title: 'Trap with 2 sheets', dataName: '19308' },
    { title: 'Other trap', dataName: '19309' },
  ],
} as const;

export const mothTrapOtherTypeAttr = {
  id: 'locAttr:288',
  type: 'textInput',
  title: 'Other type',
  prefix: mothTrapIcon,
  visibility: [{ target: mothTrapTypeAttr.id, op: 'eq', value: '19309' }],
} as const;

export const mothTrapLampDescriptionAttr = {
  id: 'description',
  type: 'textInput',
  title: 'Description',
  prefix: chatboxOutlineIcon,
} as const;

export const mothTrapLampQuantityAttr = {
  id: 'quantity',
  type: 'numberInput',
  title: 'Quantity',
  prefix: mothTrapNumberIcon,
  appearance: 'counter',
  validation: { min: 1 },
} as const;

export const mothTrapLampsAttr = { id: 'locAttr:306' } as const;

export const mothTrapUserAttr = { id: 'locAttr:234' } as const;

export const mothTrapLampTypeNameAttr = { id: 'type' } as const;

export const mothTrapLampTypeAttr = {
  id: 'type_term',
  type: 'choiceInput',
  title: 'Type',
  appearance: 'button',
  prefix: mothTrapBulbIcon,
  choices: [
    { dataName: '19111', title: 'LED → Ledstrip → 395-405 SMD 2835' },
    { dataName: '19112', title: 'LED → Ledstrip → 395-405 SMD 5050' },
    { dataName: '19113', title: 'LED → PowerLED → Please describe' },
    { dataName: '19114', title: 'LED → LepiLed → Mini' },
    { dataName: '19115', title: 'LED → LepiLed → Standard' },
    { dataName: '19116', title: 'LED → LepiLed → Maxi' },
    { dataName: '19117', title: 'LED → LepiLed → Maxi switch' },
    { dataName: '19118', title: 'LED → Other → Please describe' },
    { dataName: '19127', title: 'TL → Actinic → 6W' },
    { dataName: '19128', title: 'TL → Actinic → 8W' },
    { dataName: '19129', title: 'TL → Blacklight → 18W' },
    { dataName: '19130', title: 'TL → Other → Please describe' },
    { dataName: '19131', title: 'E27 → Mercury vapour - ML → 160W' },
    { dataName: '19132', title: 'E27 → Mercury vapour - ML → 250W' },
    { dataName: '19133', title: 'E27 → Mercury vapour - ML → 500W' },
    { dataName: '19134', title: 'E27 → Mercury vapour - HPL → 125W' },
    { dataName: '19135', title: 'E27 → Mercury vapour - HPL → 400W' },
    { dataName: '19136', title: 'E27 → Mercury vapour - Blacklight → 160W' },
    { dataName: '19137', title: 'E27 → Mercury vapour - Blacklight → 400W' },
    { dataName: '19138', title: 'E27 → Sylvana UV-A → 20W' },
    { dataName: '19140', title: 'E27 → Other → Please describe' },
    { dataName: '20068', title: 'Other → Other → Please describe' },
  ],
} as const;

export type Lamp = {
  cid: string;
  data: {
    [mothTrapLampTypeNameAttr.id]: string;
    [mothTrapLampTypeAttr.id]: string;
    [mothTrapLampQuantityAttr.id]: number;
    [mothTrapLampDescriptionAttr.id]: string;
  };
};

export type MothTrapAttrs = {
  [mothTrapTypeAttr.id]: number;
  [mothTrapOtherTypeAttr.id]: string | null;
  [mothTrapLampsAttr.id]: Lamp[];
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
};

export type Data = LocationData & MothTrapAttrs & ModelAttrs;

const surveyConfig = {
  location: {
    remote: {
      id: 'entered_sref',
      values(location: any, submission: any) {
        const { latitude, longitude, name } = location;

        // eslint-disable-next-line
        submission.values = {
          ...submission.values,
        };

        submission.values['lat'] = latitude; // eslint-disable-line
        submission.values['lon'] = longitude; // eslint-disable-line
        submission.values['name'] = name; // eslint-disable-line
      },
    },
  },

  verify(attrs: any) {
    const lampSchema = z.object({
      data: z.object({
        description: z.string().optional(),
        quantity: z.number().min(1),
        type: z
          .string({ required_error: 'Lamp type is a required field.' })
          .min(1, 'Lamp type is a required field.'),
      }),
    });

    return z
      .object({
        location: z
          .object(
            {
              latitude: z.number().nullable().optional(),
              longitude: z.number().nullable().optional(),
              name: z
                .string({ required_error: 'Location name is missing' })
                .min(1, 'Please add the moth trap location and name.'),
            },
            { required_error: 'Location is missing.' }
          )
          .refine(
            (val: any) =>
              Number.isFinite(val.latitude) && Number.isFinite(val.longitude),
            'Location is missing.'
          ),

        [mothTrapTypeAttr.id]: z.string({
          required_error: 'Trap type is a required field.',
        }),
        [mothTrapLampsAttr.id]: z
          .array(lampSchema, { required_error: 'No lamps added' })
          .min(1, 'No lamps added'),
      })
      .safeParse(attrs).error;
  },
};

class Location extends LocationModel<Data> {
  static fromDTO(
    { id, createdOn, updatedOn, externalKey, ...data }: any,
    options?: LocationOptions
  ) {
    const parsedRemoteJSON: any = {
      cid: externalKey || UUIDv7(),
      id,
      createdAt: new Date(createdOn!).getTime(),
      updatedAt: new Date(updatedOn!).getTime(),
      data: {
        id,
        createdAt: createdOn,
        location: {
          name: data.name,
          latitude: Number(data.lat),
          longitude: Number(data.lon),
        },
        ...data,
        ...getLocalAttributes(data, surveyConfig),
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

  constructor({
    skipStore,
    media = [],
    metadata = {},
    ...options
  }: LocationOptions) {
    super({
      store: skipStore ? undefined : locationsStore,
      ...options,
    });

    this.metadata = observable(metadata);

    this.media = observable(media);
  }

  getSurvey = () => surveyConfig;

  private toMothTrapDTO() {
    const { location, comment, boundaryGeom, centroidSrefSystem } = this.data;

    const stringifyLamp = (lamp: any) => JSON.stringify(lamp);
    const getLampType = (lamp: any) => {
      const lat = parseFloat(`${location.latitude}`).toFixed(7);
      const lon = parseFloat(`${location.longitude}`).toFixed(7);

      return {
        ...lamp.data,
        centroid_sref: `${lat} ${lon}`,
      };
    };

    const stringifiedLamps = this.data[mothTrapLampsAttr.id]
      ?.map(getLampType)
      .map(stringifyLamp);

    return {
      ...this.data,
      name: location.name,
      location_type_id: LocationType.MothTrap, // the model already has this, so probably not needed
      centroid_sref_system: centroidSrefSystem,
      centroid_sref: `${location.latitude} ${location.longitude}`,
      boundary_geom: boundaryGeom,
      comment,
      [mothTrapLampsAttr.id]: stringifiedLamps,
      [mothTrapUserAttr.id]: userModel.id,
    };
  }

  toDTO(warehouseMediaNames = {}) {
    const toSnakeCase = (attrs: any) => {
      return Object.entries(attrs).reduce((agg: any, [attr, value]): any => {
        const attrModified = attr.includes('locAttr:') ? attr : snakeCase(attr);
        agg[attrModified] = value; // eslint-disable-line no-param-reassign
        return agg;
      }, {});
    };

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

    const submission: any = {
      values: {
        external_key: this.cid,
        ...data,
      },
      media: [],
    };

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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const options = {
      accuracyLimit,

      // eslint-disable-next-line @typescript-eslint/no-empty-function
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
        callback && callback(new Error(err.message));
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
        callback && callback(null, location);
      } else {
        onUpdate && onUpdate(location);
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
