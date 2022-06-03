import species from './index.json';

interface Abundance {
  AD: string;
  AL: string;
  AT: string;
  BA: string;
  BE: string;
  BG: string;
  BY: string;
  CH: string;
  CY: string;
  CZ: string;
  DE: string;
  DK: string;
  EE: string;
  ES: string;
  ES_CA: string;
  FI: string;
  FR: string;
  GB: string;
  GR: string;
  HR: string;
  HU: string;
  IE: string;
  IS: string;
  IT: string;
  LI: string;
  LT: string;
  LU: string;
  LV: string;
  MD: string;
  ME: string;
  MK: string;
  MT: string;
  NL: string;
  NO: string;
  PL: string;
  PT: string;
  PT_AZ: string;
  PT_MA: string;
  RO: string;
  RS: string;
  RU: string;
  SE: string;
  SI: string;
  SK: string;
  TR: string;
  TRA: string;
  UA: string;
  AM?: string;
}

export interface Species {
  id: number;
  sort_id: number;
  warehouse_id: number;
  external_key: string;
  taxon: string;
  family: string;
  descriptionKey: string;
  image: any;
  image_width: any;
  image_height: any;
  image_copyright: string;
  abundance: Abundance;
}

export default species as Species[];
