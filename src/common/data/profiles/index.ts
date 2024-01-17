import { CountryCode } from 'common/config/countries';
import species from './index.json';

export enum Abundance {
  A = 'Absent',
  P = 'Present',
  'P?' = 'Possibly present',
  M = 'Regular migrant',
  I = 'Irregular vagrant',
  Ex = 'Regionally extinct',
}

export type AbundanceCode = keyof typeof Abundance;

export interface Species {
  id?: number;
  sort_id?: number;
  warehouse_id: number;
  external_key: string;
  taxon: string;
  family?: string;
  descriptionKey?: string;
  image_copyright?: string[] | null;
  abundance: {
    [key in Exclude<CountryCode, 'UK' | 'ELSEWHERE'>]?: AbundanceCode;
  };
}

export default species as Species[];
