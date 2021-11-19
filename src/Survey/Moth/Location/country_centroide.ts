interface Types {
  [k: string]: {
    lat: number;
    long: number;
    country: string;
    zoom?: number;
  };
}

const COUNTRIES_CENTROID: Types = {
  AL: {
    lat: 41.153332,
    long: 20.168331,
    country: 'Albania',
    zoom: 9,
  },
  AD: {
    lat: 42.546245,
    long: 1.601554,
    country: 'Andorra',
    zoom: 9,
  },
  AM: {
    lat: 40.069099,
    long: 45.038189,
    country: 'Armenia',
    zoom: 9,
  },
  AT: {
    lat: 47.516231,
    long: 14.550072,
    country: 'Austria',
  },
  BY: {
    lat: 53.709807,
    long: 27.953389,
    country: 'Belarus',
  },
  BE: {
    lat: 50.503887,
    long: 4.469936,
    country: 'Belgium',
    zoom: 9,
  },
  BA: {
    lat: 43.915886,
    long: 17.679076,
    country: 'Bosnia and Herzegovina',
    zoom: 9,
  },
  BG: {
    lat: 42.733883,
    long: 25.48583,
    country: 'Bulgaria',
  },
  HR: { lat: 45.1, long: 15.2, country: 'Croatia', zoom: 9 },
  CY: {
    lat: 35.126413,
    long: 33.429859,
    country: 'Cyprus',
    zoom: 9,
  },
  CZ: {
    lat: 49.817492,
    long: 15.472962,
    country: 'Czech Republic',
  },
  DK: {
    lat: 56.26392,
    long: 9.501785,
    country: 'Denmark',
  },
  EE: {
    lat: 58.595272,
    long: 25.013607,
    country: 'Estonia',
    zoom: 9,
  },
  FI: {
    lat: 61.92411,
    long: 25.748151,
    country: 'Finland',
  },
  FR: {
    lat: 46.227638,
    long: 2.213749,
    country: 'France',
  },
  DE: {
    lat: 51.165691,
    long: 10.451526,
    country: 'Germany',
  },

  GR: { lat: 39.074208, long: 21.824312, country: 'Greece', zoom: 7 },
  HU: {
    lat: 47.162494,
    long: 19.503304,
    country: 'Hungary',
    zoom: 7,
  },
  IS: {
    lat: 64.963051,
    long: -19.020835,
    country: 'Iceland',
    zoom: 7,
  },
  IE: { lat: 53.41291, long: -8.24389, country: 'Ireland', zoom: 7 },
  IT: { lat: 41.87194, long: 12.56738, country: 'Italy', zoom: 5 },
  LV: { lat: 56.879635, long: 24.603189, country: 'Latvia', zoom: 7 },
  LI: {
    lat: 47.166,
    long: 9.555373,
    country: 'Liechtenstein',
    zoom: 7,
  },
  LT: {
    lat: 55.169438,
    long: 23.881275,
    country: 'Lithuania',
    zoom: 7,
  },
  LU: {
    lat: 49.815273,
    long: 6.129583,
    country: 'Luxembourg',
    zoom: 7,
  },
  MT: { lat: 35.937496, long: 14.375416, country: 'Malta', zoom: 7 },
  MD: {
    lat: 47.411631,
    long: 28.369885,
    country: 'Moldova',
    zoom: 7,
  },
  ME: {
    lat: 42.708678,
    long: 19.37439,
    country: 'Montenegro',
    zoom: 7,
  },
  NL: {
    lat: 52.132633,
    long: 5.291266,
    country: 'Netherlands',
    zoom: 7,
  },
  MK: {
    lat: 41.608635,
    long: 21.745275,
    country: 'Macedonia ',
    zoom: 7,
  },
  NO: { lat: 60.472024, long: 8.468946, country: 'Norway', zoom: 4 },
  PL: { lat: 51.919438, long: 19.145136, country: 'Poland', zoom: 5 },
  PT: { lat: 39.399872, long: -8.224454, country: 'Portugal', zoom: 5 },
  RO: { lat: 45.943161, long: 24.96676, country: 'Romania', zoom: 5 },
  RS: { lat: 44.016521, long: 21.005859, country: 'Serbia', zoom: 7 },
  SK: {
    lat: 48.669026,
    long: 19.699024,
    country: 'Slovakia',
    zoom: 5,
  },
  SI: {
    lat: 46.151241,
    long: 14.995463,
    country: 'Slovenia',
    zoom: 5,
  },
  ES: { lat: 40.463667, long: -3.74922, country: 'Spain', zoom: 5 },
  SE: { lat: 60.128161, long: 18.643501, country: 'Sweden', zoom: 4 },
  UA: { lat: 48.379433, long: 31.16558, country: 'Ukraine', zoom: 5 },
  UK: { lat: 55.378051, long: -3.435973, country: 'United Kingdom', zoom: 5 },
  ES_CA: {
    lat: 28.05607,
    long: -15.695324,
    country: 'Canary Islands',
    zoom: 7,
  },
  PT_MA: {
    lat: 32.7607,
    long: -16.9595,
    country: 'Madeira Islands',
    zoom: 9,
  },
  TR: {
    lat: 38.9637,
    long: 35.2433,
    country: 'Turkey',
    zoom: 4,
  },

  TRA: {
    lat: 38.9637,
    long: 35.2433,
    country: 'Turkey',
    zoom: 4,
  },

  RU: {
    lat: 56.2816,
    long: 32.842,
    country: 'Russian Federation',
    zoom: 4,
  },
  PT_AZ: {
    lat: 37.7412,
    long: -25.6756,
    country: 'Portugal azores',
    zoom: 7,
  },
};

export default COUNTRIES_CENTROID;
