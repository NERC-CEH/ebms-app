/* eslint-disable camelcase */
import areaSurvey from 'Survey/AreaCount/config';
import areaOldSurvey from 'Survey/AreaCount/configOld';
import areaSingleSpeciesSurvey from 'Survey/AreaCount/configSpecies';
import transectSurvey from 'Survey/Transect/config';
import mothSurvey from 'Survey/Moth/config';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';

export default {
  [areaSurvey.name]: areaSurvey,
  [areaOldSurvey.name]: areaOldSurvey, // deprecated
  [areaSingleSpeciesSurvey.name]: areaSingleSpeciesSurvey,
  [transectSurvey.name]: transectSurvey,
  [mothSurvey.name]: mothSurvey,
};

export type AttrConfig = {
  remote: {
    id?: number | string;
    values?: { id: number; value: string }[];
  };
};

// TODO:
// interface Attrs {
//   [key: string]: AttrConfig;
// }

type Attrs = any;

export interface Survey {
  id: number;
  name: string;
  label: string;
  deprecated?: boolean;
  webForm?: string;

  attrs: Attrs;

  occ?: {
    attrs: Attrs;
    create: (
      occurrence: typeof Occurrence,
      taxon: any,
      identifier: string,
      photo?: any
    ) => Occurrence;
    verify?: (attrs: any) => any;
  };

  verify?: (attrs: any) => any;

  create: (
    sample: typeof Sample,
    params?: any,
    surveyName?: any,
    recorder?: string
  ) => any;
}
