interface Attribute {
  value: any;
  id: string;
}

interface Event {
  date_start: string;
  source_system_key: string;
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
  attributes: Attribute[];
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

export interface HigherGeography {
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
  higher_geography: HigherGeography[];
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
  verification_status: string;
  sensitive: string;
  survey: Survey;
  tracking: string;
  confidential: string;
  created_by_id: string;
  updated_on: string;
  website: Website;
  created_on: string;
  release_status: string;
}

interface Stats {
  count_taxa: string;
  count_taxon_groups: string;
  count_occurrences: string;
  sum_individual_count: string;
}

export default interface Source {
  event: Event;
  location: Location;
  metadata: Metadata;
  '@version': string;
  stats: Stats;
  '@timestamp': Date;
  id: string;
}
