/* eslint-disable camelcase */
import areaSurvey from 'Survey/AreaCount/config';
import areaSingleSpeciesSurvey from 'Survey/AreaCount/configSpecies';
import areaSurveyOld from 'Survey/AreaCountOld/config';
import transectSurvey from 'Survey/Transect/config';
import mothSurvey from 'Survey/Moth/config';
import Occurrence from 'models/occurrence';

export default {
  [areaSurvey.name]: areaSurvey,
  [areaSingleSpeciesSurvey.name]: areaSingleSpeciesSurvey,
  [areaSurveyOld.name]: areaSurveyOld,
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

  attrs: Attrs;

  occ?: {
    attrs: Attrs;
    create: (
      occurrence: typeof Occurrence,
      taxon: any,
      identifier: string,
      photo?: any
    ) => typeof Occurrence;
    verify?: (attrs: any) => any;
  };

  verify?: (attrs: any) => any;

  create: (
    sample: any,
    params?: any,
    surveyName?: any,
    recorder?: string
  ) => any;
}
