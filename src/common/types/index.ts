/* eslint-disable camelcase */
export type MatchParams = {
  isExact: boolean;
  params: {
    smpId: string;
    taxa: string;
  };
  path: string;
  url: string;
};

export interface MothTrap {
  boundary_geom: string;
  centroid_geom: string;
  centroid_sref: string;
  centroid_sref_system: string;
  code: string | null;
  comment: string | null;
  created_by_id: string;
  created_on: string;
  external_key: string | null;
  id: string;
  latitude: number;
  location_type_id: string;
  longitude: number;
  name: string;
  parent_id: string;
  public: string;
  updated_by_id: string;
  updated_on: string;
  distance?: any;
}
