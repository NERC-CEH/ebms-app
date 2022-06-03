import {
  Store,
  validateRemoteModel,
  getDeepErrorMessage,
  useAlert,
  Model,
  ModelMetadata,
  ModelAttrs,
  Collection,
} from '@flumens';
import CONFIG from 'common/config';
import * as Yup from 'yup';
import userModel from 'models/user';
import UUID from 'common/helpers/UUID';
import { observable } from 'mobx';
import axios, { AxiosError } from 'axios';
import { Location } from './collections/locations/service';
import { locationsStore } from './store';
import { getLocalAttributes } from './utils';

type Metadata = ModelMetadata & {
  saved?: boolean;
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

export const MOTH_TRAP_TYPE = 18879;

export const verifyLocationSchema = Yup.mixed().test(
  'location',
  'Please add the moth trap location and name.',
  validateLocation
);

type ModelOptions<T = any> = {
  id?: string;
  cid?: string;
  attrs?: T;
  metadata?: any;
  store?: Store;
};

export type Lamp = {
  cid: string;
  attrs: { type: string; quantity: number; description: string };
};

interface Attrs extends ModelAttrs {
  type: number;
  typeOther: string | null;
  description: string;
  lamps: Lamp[];
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

class LocationModel extends Model {
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

  static parseRemoteJSON({ values: doc }: Location) {
    const parsedRemoteJSON = {
      cid: doc.external_key || UUID(),
      id: doc.id,

      attrs: {
        location: {
          name: doc.name,
          latitude: Number(doc.lat),
          longitude: Number(doc.lon),
          centroid_sref: doc.centroid_sref,
          centroid_sref_system: doc.centroid_sref_system,
        },

        ...getLocalAttributes(doc, LocationModel.schema, [
          'type',
          'lamps',
          'typeOther',
        ]),
      },

      metadata: {
        createdOn: new Date(doc.created_on).getTime(),
        updatedOn: new Date(doc.updated_on).getTime(),
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

  gps: { locating: null | number } = observable({ locating: null });

  _store = locationsStore;

  remote = observable({ synchronising: false });

  metadata: Metadata = this.metadata;

  attrs: Attrs = Model.extendAttrs(this.attrs, {
    location: this.attrs.location || {},
    typeOther: null,
    lamps: [],
  });

  constructor(options: ModelOptions) {
    super({ ...options, store: locationsStore });
  }

  isDraft = () => !this.id;

  getSchema = () => LocationModel.schema;

  getSurvey = () => this.getSchema();

  isGPSRunning() {
    return !!(this.gps.locating || this.gps.locating === 0);
  }

  async saveRemote() {
    console.log('Location uploading');

    const submission = this.toRemoteJSON();

    const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/locations`;

    try {
      this.remote.synchronising = true;

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

      this.save();

      console.log('Location uploading done');
      return this;
    } catch (e: any) {
      this.remote.synchronising = false;

      const err = e as AxiosError;

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

  toRemoteJSON() {
    const { lamps, location, type, typeOther } = this.attrs;
    const stringifyLamp = (lamp: any) => JSON.stringify(lamp);
    const getLampType = (lamp: any) => {
      const { type: lampTypeTerm, description, quantity } = lamp.attrs;

      const byId = ({ value }: any) => value === lampTypeTerm;
      const typeRemoteId =
        LocationModel.lampSchema.type.remote.values.find(byId)?.id;

      return {
        type_term: lampTypeTerm,
        type: typeRemoteId,
        description,
        quantity,
      };
    };
    const stringifiedLamps = lamps.map(getLampType).map(stringifyLamp);

    const byId = ({ value }: any) => value === type;
    const trapType = LocationModel.schema.type.remote.values.find(byId)?.id;

    const lat = parseFloat(`${location.latitude}`).toFixed(7);
    const lon = parseFloat(`${location.longitude}`).toFixed(7);

    // TODO: se scheme get keys
    const submission: any = {
      values: {
        external_key: this.cid,
        location_type_id: MOTH_TRAP_TYPE,
        name: location.name,

        centroid_sref: `${lat} ${lon}`,
        centroid_sref_system: 4326,

        'locAttr:306': stringifiedLamps,
        'locAttr:330': trapType,
        'locAttr:234': userModel.id,
        'locAttr:288': typeOther,
      },
    };

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
    // this.stopGPS();
  }
}

export const useValidateCheck = () => {
  const alert = useAlert();

  const validate = (location: LocationModel) => {
    const invalids = location.validateRemote();
    if (invalids) {
      alert({
        header: 'Incomplete',
        message: getDeepErrorMessage(invalids),
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
