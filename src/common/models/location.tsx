import { IObservableArray, observable } from 'mobx';
import axios, { AxiosError } from 'axios';
import { snakeCase } from 'lodash';
import * as Yup from 'yup';
import { z, object } from 'zod';
import { Geolocation } from '@capacitor/geolocation';
import {
  ModelOptions,
  validateRemoteModel,
  useAlert,
  Model,
  ModelMetadata,
  ModelAttrs,
  Collection,
  updateModelLocation,
  ModelValidationMessage,
  UUID,
  boolToWarehouseValue,
} from '@flumens';
import CONFIG from 'common/config';
import userModel from 'models/user';
import Media from './media';
import { locationsStore } from './store';
import { getLocalAttributes } from './utils';

type Metadata = ModelMetadata & {
  saved?: boolean;
  groupId?: string;
};

const trapTypes = [
  { value: 'LED funnel trap', id: 19306 },
  { value: 'Other funnel trap', id: 19307 },
  { value: 'Trap with 2 sheets', id: 19308 },
  { value: 'Other trap', id: 19309 },
];

const lampType = [
  { id: 19111, value: 'LED → Ledstrip → 395-405 SMD 2835' },
  { id: 19112, value: 'LED → Ledstrip → 395-405 SMD 5050' },
  { id: 19113, value: 'LED → PowerLED → Please describe' },
  { id: 19114, value: 'LED → LepiLed → Mini' },
  { id: 19115, value: 'LED → LepiLed → Standard' },
  { id: 19116, value: 'LED → LepiLed → Maxi' },
  { id: 19117, value: 'LED → LepiLed → Maxi switch' },
  { id: 19118, value: 'LED → Other → Please describe' },
  { id: 19127, value: 'TL → Actinic → 6W' },
  { id: 19128, value: 'TL → Actinic → 8W' },
  { id: 19129, value: 'TL → Blacklight → 18W' },
  { id: 19130, value: 'TL → Other → Please describe' },
  { id: 19131, value: 'E27 → Mercury vapour - ML → 160W' },
  { id: 19132, value: 'E27 → Mercury vapour - ML → 250W' },
  { id: 19133, value: 'E27 → Mercury vapour - ML → 500W' },
  { id: 19134, value: 'E27 → Mercury vapour - HPL → 125W' },
  { id: 19135, value: 'E27 → Mercury vapour - HPL → 400W' },
  { id: 19136, value: 'E27 → Mercury vapour - Blacklight → 160W' },
  { id: 19137, value: 'E27 → Mercury vapour - Blacklight → 400W' },
  { id: 19138, value: 'E27 → Sylvana UV-A → 20W' },
  { id: 19140, value: 'E27 → Other → Please describe' },
  { id: 20068, value: 'Other → Other → Please describe' },
];

const fixedLocationSchema = Yup.object().shape({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
  name: Yup.string().required(),
});

const validateLocation = (val: any) => {
  try {
    fixedLocationSchema.validateSync(val);
    return true;
  } catch (e) {
    return false;
  }
};

export const MOTH_TRAP_TYPE = '18879';
export const TRANSECT_TYPE = '777';
export const TRANSECT_SECTION_TYPE = '778';
export const GROUP_SITE_TYPE = '14';

export const verifyLocationSchema = Yup.mixed().test(
  'location',
  'Please add the moth trap location and name.',
  validateLocation
);

type LocationOptions = ModelOptions<Attrs> & {
  media?: any[];
  skipStore?: boolean;
};

export type Lamp = {
  cid: string;
  attrs: { type: string; quantity: number; description: string };
};

export type RemoteAttributes = z.infer<typeof LocationModel.remoteSchema>;

export type MothTrapAttrs = {
  type: number;
  typeOther: string | null;
  description: string;
  lamps: Lamp[];
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
};

export type Attrs = RemoteAttributes & MothTrapAttrs & ModelAttrs;

class LocationModel extends Model {
  static remoteSchema = object({
    lat: z.string().min(1),
    lon: z.string().min(1),
    /**
     * Location name.
     */
    name: z.string().min(1),
    /**
     * Location type e.g. transect = 777, transect section = 778 etc.
     */
    locationTypeId: z.string().min(1),
    centroidSref: z.string().min(1),
    centroidSrefSystem: z.string().min(1),
    /**
     * Entity ID.
     */
    id: z.string().optional(),
    createdOn: z.string().optional(),
    updatedOn: z.string().optional(),
    parentId: z.string().nullable().optional(),
    boundaryGeom: z.string().nullable().optional(),
    code: z.string().nullable().optional(),
    createdById: z.string().nullable().optional(),
    updatedById: z.string().nullable().optional(),
    externalKey: z.string().nullable().optional(),
    centroidGeom: z.string().nullable().optional(),
    public: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
  });

  static schema = {
    type: {
      pageProps: {
        attrProps: {
          input: 'radio',
          info: 'What is the moth trap type?',
          inputProps: { options: trapTypes },
          set: (value: string, model: any) => {
            if (model.attrs.type !== 'Other trap') {
              // eslint-disable-next-line
              model.attrs.typeOther = null;
            }
            // eslint-disable-next-line
            model.attrs.type = value;
            model.save();
          },
        },
      },
      remote: { id: 330, values: trapTypes },
    },

    typeOther: {
      pageProps: {
        headerProps: {
          title: 'Other type',
        },
        attrProps: {
          input: 'textarea',
          info: 'What type of trap was it?',
        },
      },
      remote: { id: 288 },
    },

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

    lamps: { remote: { id: 306 } },

    verify(attrs: any) {
      try {
        const lampSchema = Yup.object().shape({
          attrs: Yup.object().shape({
            description: Yup.string(),
            quantity: Yup.number().min(1),
            type: Yup.string().required('Lamp type is a required field.'),
          }),
        });

        const schema = Yup.object().shape({
          location: verifyLocationSchema,
          type: Yup.string().required('Trap type is a required field.'),
          lamps: Yup.array().of(lampSchema),
        });

        schema.validateSync(attrs, { abortEarly: false });
      } catch (attrError) {
        return attrError;
      }

      return null;
    },
  };

  static lampSchema = {
    type: {
      input: 'radio',
      info: 'What is the lamp type?',
      inputProps: {
        options: lampType,
      },
      remote: { id: 366, values: lampType },
    },
    description: {
      input: 'textarea',
      info: 'Additional description of lamp.',
    },
    quantity: { remote: { id: 16 } },
  };

  static parseRemoteJSON(
    { id, createdOn, updatedOn, externalKey, ...attrs }: RemoteAttributes,
    metadata?: Partial<Metadata>
  ) {
    const parsedRemoteJSON = {
      cid: externalKey || UUID(),
      id,

      attrs: {
        id,
        createdOn,
        location: {
          name: attrs.name,
          latitude: Number(attrs.lat),
          longitude: Number(attrs.lon),
        },
        ...attrs,
        ...getLocalAttributes(attrs, LocationModel.schema, [
          'type',
          'lamps',
          'typeOther',
        ]),
      },

      metadata: {
        ...metadata,
        createdOn: new Date(createdOn!).getTime(),
        updatedOn: new Date(updatedOn!).getTime(),
      },
    };

    const parseLamp = (lamp: string) => {
      try {
        return JSON.parse(lamp);
      } catch (error) {
        throw new Error('Could not parse a lamp');
      }
    };
    parsedRemoteJSON.attrs.lamps =
      parsedRemoteJSON.attrs?.lamps?.map(parseLamp) || [];

    return parsedRemoteJSON;
  }

  collection?: Collection<LocationModel>;

  validateRemote = validateRemoteModel;

  gps: { locating: null | string } = observable({ locating: null });

  remote = observable({ synchronising: false });

  // eslint-disable-next-line
  // @ts-ignore
  metadata: Metadata = this.metadata;

  // eslint-disable-next-line
  // @ts-ignore
  attrs: Attrs = Model.extendAttrs(this.attrs, {});

  media: IObservableArray<Media>;

  constructor({ skipStore, media = [], ...options }: LocationOptions) {
    super({
      store: skipStore ? undefined : locationsStore,
      ...options,
    });

    this.media = observable(media);
  }

  isDraft = () => !this.id;

  getSchema = () => LocationModel.schema;

  getSurvey = () => this.getSchema();

  isGPSRunning() {
    return !!(this.gps.locating || this.gps.locating === '0');
  }

  async saveRemote() {
    try {
      this.remote.synchronising = true;

      const warehouseMediaNames = await this.uploadMedia();
      const submission = this.toRemoteJSON(warehouseMediaNames);
      const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/locations`;

      const token = await userModel.getAccessToken();

      const options: any = {
        url,
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        timeout: 80000,
        data: submission,
      };

      const { data: dataRaw, status } = await axios(options);
      let data = dataRaw;

      // update the model and occurrences with new remote IDs
      // remoteCreateParse(this, resp);
      if (typeof data === 'string') {
        if (status === 201 && data.includes('Object Moved')) {
          // IIS issue: https://forums.iis.net/p/1209573/2082988.aspx
          data = JSON.parse(data.slice(data.indexOf('{"values')));
        } else {
          throw new Error(`Can't parse server response.`);
        }
      }

      // update metadata
      const uploadTime = new Date(data.values.updated_on).getTime();
      this.metadata.updatedOn = uploadTime;
      this.metadata.syncedOn = uploadTime;
      this.id = data.values.id;

      this.remote.synchronising = false;

      this._store && this.save();

      console.log('Location uploading done');
      return this;
    } catch (e: any) {
      this.remote.synchronising = false;

      const err = e as AxiosError<any>;

      if (err.response?.status === 409 && err.response?.data.duplicate_of) {
        console.log('Location uploading duplicate was found');
        const uploadTime = new Date().getTime();
        this.metadata.updatedOn = uploadTime;
        this.metadata.syncedOn = uploadTime;
        this.id = err.response?.data.duplicate_of.id;
        return this;
      }

      const serverMessage = err.response?.data?.message;
      if (!serverMessage) {
        throw e;
      }

      if (typeof serverMessage === 'object') {
        const getErrorMessageFromObject = (errors: any) =>
          Object.entries(errors).reduce(
            (string, val: any) => `${string}${val[0]} ${val[1]}\n`,
            ''
          );

        throw new Error(getErrorMessageFromObject(serverMessage));
      }

      throw new Error(serverMessage);
    }
  }

  isUploaded() {
    return !!this.metadata.syncedOn;
  }

  private toRemoteMothTrapJSON() {
    const {
      lamps,
      type,
      typeOther,
      location,
      comment,
      boundaryGeom,
      centroidSrefSystem,
    } = this.attrs;

    const stringifyLamp = (lamp: any) => JSON.stringify(lamp);
    const getLampType = (lamp: any) => {
      const { type: lampTypeTerm, description, quantity } = lamp.attrs;

      const byId = ({ value }: any) => value === lampTypeTerm;
      const typeRemoteId =
        LocationModel.lampSchema.type.remote.values.find(byId)?.id;

      const lat = parseFloat(`${location.latitude}`).toFixed(7);
      const lon = parseFloat(`${location.longitude}`).toFixed(7);

      return {
        centroid_sref: `${lat} ${lon}`,
        type_term: lampTypeTerm,
        type: typeRemoteId,
        description,
        quantity,
      };
    };
    const stringifiedLamps = lamps?.map(getLampType).map(stringifyLamp);

    const byValue = ({ value }: any) => value === type;
    const trapType = LocationModel.schema.type.remote.values.find(byValue)?.id;

    return {
      name: location.name,
      location_type_id: MOTH_TRAP_TYPE, // the model already has this, so probably not needed
      centroid_sref_system: centroidSrefSystem,
      centroid_sref: `${location.latitude} ${location.longitude}`,
      boundary_geom: boundaryGeom,
      comment,
      'locAttr:306': stringifiedLamps,
      'locAttr:330': trapType,
      'locAttr:234': userModel.id,
      'locAttr:288': typeOther,
    };
  }

  toRemoteJSON(warehouseMediaNames = {}) {
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
          agg[attr] = boolToWarehouseValue(value); // eslint-disable-line no-param-reassign
        }
        return agg;
      }, attrs);

    const attrs = this.attrs.type
      ? this.toRemoteMothTrapJSON()
      : transformBoolean(toSnakeCase(this.attrs));

    const submission: any = {
      values: {
        external_key: this.cid,
        ...attrs,
      },
      media: [],
    };

    this.media.forEach(model => {
      const modelSubmission = model.getSubmission(warehouseMediaNames);
      if (!modelSubmission) {
        return;
      }

      submission.media.push(modelSubmission);
    });

    return submission;
  }

  destroy() {
    this.cleanUp();

    if (this.collection) {
      this.collection.remove(this);
    }

    return super.destroy();
  }

  cleanUp() {
    // TODO:
    this.stopGPS();
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

  private async uploadMedia() {
    // return bulkUploadMedia(this.media); //TODO: take it from Indicia Sample
    await Promise.all(this.media.map(m => m.uploadFile()));

    const warehouseMediaNames: any = {};

    this.media.forEach(m => {
      warehouseMediaNames[m.cid] = { name: m.attrs.queued };
    });

    return warehouseMediaNames;
  }
}

export const useValidateCheck = () => {
  const alert = useAlert();

  const validate = (location: LocationModel) => {
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

export default LocationModel;
