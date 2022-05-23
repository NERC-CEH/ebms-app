/* eslint-disable camelcase */
import CONFIG from 'common/config/config';
import axios from 'axios';
import userModel from 'models/userModel';
import { MOTH_TRAP_TYPE } from '../../location';

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

export default async function fetchLocations() {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/locations`;

  const token = await userModel.getAccessToken();

  const options = {
    params: {
      location_type_id: MOTH_TRAP_TYPE, // TODO: move the actual params to the Location model
      public: false,
      verbose: 1,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 80000,
  };

  const res = await axios.get(url, options);
  let docs: Response = res.data;

  if (typeof docs === 'string') {
    // TODO: remove once the empty locations with verbose bug is fixed.
    // https://github.com/Indicia-Team/warehouse/issues/430
    docs = [];
  }

  return docs;
}
