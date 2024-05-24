/* eslint-disable camelcase */
import axios from 'axios';
import { camelCase, mapKeys } from 'lodash';
import { z, ZodError } from 'zod';
import { isAxiosNetworkError, HandledError } from '@flumens';
import CONFIG from 'common/config';
import LocationModel, { RemoteAttributes } from 'models/location';
import userModel from 'models/user';

export type Response = Location[];

export type CustomAttr = {
  attribute_id: string;
  value_id: string;
  caption: string;
  data_type: string;
  multi_value: string;
  value: string;
  raw_value: string;
  upper_value: any;
};

export type Lamp = CustomAttr;
export type TrapType = CustomAttr;
export type UserId = CustomAttr;

export interface Location {
  values: {
    id: string;
    code: any;
    parent_id: any;
    centroid_sref: string;
    centroid_sref_system: string;
    created_on: string;
    created_by_id: string;
    updated_on: string;
    updated_by_id: string;
    comment: any;
    external_key: any;
    centroid_geom: string;
    boundary_geom: any;
    location_type_id: string;
    public: string;
    lat: string;
    lon: string;
    name: string;
    'locAttr:306'?: Lamp[];
    'locAttr:330'?: TrapType;
    'locAttr:234'?: UserId[];
  };
}

export async function fetch(
  locationTypeId: number | string
): Promise<RemoteAttributes[]> {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/locations`;

  const token = await userModel.getAccessToken();

  const options = {
    params: {
      location_type_id: locationTypeId,
      public: false,
      verbose: 1,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 80000,
  };

  try {
    const res = await axios.get(url, options);

    const getValues = (doc: any) =>
      mapKeys(doc.values, (_, key) =>
        key.includes(':') ? key : camelCase(key)
      );
    const docs = res.data.map(getValues);

    docs.forEach(LocationModel.remoteSchema.parse);

    return docs;
  } catch (error: any) {
    if (axios.isCancel(error)) return [];

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    if ('issues' in error) {
      const err: ZodError = error;
      throw new Error(
        err.issues.map(e => `${e.path.join(' ')} ${e.message}`).join(' ')
      );
    }

    throw error;
  }
}

const convertSrefSystem = (loc: any) => ({
  ...loc,
  centroidSrefSystem: loc.srefSystem || loc.centroidSrefSystem, // TODO: remove once the report supports this
});

export async function fetchTransects(): Promise<RemoteAttributes[]> {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/reports/projects/ebms/ebms_app_sites_list_2.xml`;

  const token = await userModel.getAccessToken();

  const options = {
    params: {
      location_type_id: '',
      locattrs: '',
      website_id: 118,
      userID: userModel.id,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 80000,
  };

  try {
    const res = await axios.get(url, options);

    const getValues = (doc: any) =>
      mapKeys(doc, (_, key) => (key.includes(':') ? key : camelCase(key)));

    const docs = res.data.data.map(getValues).map(convertSrefSystem);
    docs.forEach(LocationModel.remoteSchema.parse);

    return docs;
  } catch (error: any) {
    if (axios.isCancel(error)) return [];

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    if ('issues' in error) {
      const err: ZodError = error;
      throw new Error(
        err.issues.map(e => `${e.path.join(' ')} ${e.message}`).join(' ')
      );
    }

    throw error;
  }
}

export async function fetchTransectSections(
  locationList: string[]
): Promise<RemoteAttributes[]> {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/reports/projects/ebms/ebms_app_sections_list_2.xml`;

  const token = await userModel.getAccessToken();

  const options = {
    params: {
      website_id: 118,
      userID: userModel.id,
      location_list: locationList?.join(','),
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 80000,
  };

  try {
    const res = await axios.get(url, options);

    const getValues = (doc: any) =>
      mapKeys(doc, (_, key) => (key.includes(':') ? key : camelCase(key)));

    const docs = res.data.data.map(getValues).map(convertSrefSystem);
    const remoteSchema = LocationModel.remoteSchema.extend({
      parentId: z.string(), // this is required to join with transects
    });

    docs.forEach(remoteSchema.parse);

    return docs;
  } catch (error: any) {
    if (axios.isCancel(error)) return [];

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    if ('issues' in error) {
      const err: ZodError = error;
      throw new Error(
        err.issues.map(e => `${e.path.join(' ')} ${e.message}`).join(' ')
      );
    }

    throw error;
  }
}
