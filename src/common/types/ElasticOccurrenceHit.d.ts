interface Attribute {
  value: any;
  id: string;
}

export interface Media {
  type: string;
  path: string;
}

interface Event {
  date_start: string;
  source_system_key: string;
  parent_attributes: Attribute[];
  week: string;
  date_end: string;
  ukbms_week: string;
  month: string;
  sampling_protocol: string;
  event_id: string;
  year: string;
  date_type: string;
  day_of_year: string;
  recorded_by: string;
  parent_event_id: string;
  attributes?: Attribute[];
  media?: Media[];
}

interface Square {
  centre: string;
}

interface GridSquare {
  '1km': Square;
  srid: string;
  '10km': Square;
  '2km': Square;
}

interface HigherGeography {
  name: string;
  id: string;
  type: string;
  code: string;
}

interface Location {
  input_sref: string;
  output_sref: string;
  verbatim_locality: string;
  geom: string;
  grid_square: GridSquare;
  point: string;
  output_sref_system: string;
  coordinate_uncertainty_in_meters: string;
  input_sref_system: string;
}

interface Survey {
  title: string;
  id: string;
}

interface Website {
  title: string;
  id: string;
}

interface Metadata {
  private: string;
  trial: string;
  sensitive: string;
  survey: Survey;
  tracking: string;
  import_guid: string;
  confidential: string;
  created_by_id: string;
  updated_on: string;
  website: Website;
  created_on: string;
  release_status: string;
}

interface AutoChecks {
  result: string;
  enabled: string;
  output: any[];
}

interface Verifier {
  id: string;
  name: string;
}

export type VerifiedStates = 'C' | 'V' | 'R';

interface Identification {
  verification_status: VerifiedStates;
  auto_checks: AutoChecks;
  verification_substatus: string;
  verified_on: string;
  verifier: Verifier;
}

interface TaxonList {
  title: string;
  id: string;
}

interface Taxon {
  taxa_taxon_list_id: string;
  taxon_meaning_id: string;
  group_id: string;
  taxon_list: TaxonList;
  accepted_name: string;
  vernacular_name?: string;
  group: string;
  taxon_name: string;
  taxon_rank_sort_order: string;
  taxon_rank: string;
  input_group: string;
  input_group_id: string;
}

interface Occurrence {
  zero_abundance: string;
  source_system_key: string;
  attributes?: Attribute[];
  media?: Media[];
}

export default interface Source {
  event: Event;
  date: string;
  '@version': string;
  '@timestamp': Date;
  identification: Identification;
  taxon: Taxon;
  occurrence: Occurrence;
  location: Location;
  metadata: Metadata;
  warehouse: string;
  id: string;
}
