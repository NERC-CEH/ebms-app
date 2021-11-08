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

interface Attrs {}

export interface Survey {
  id: number;
  name: string;
  label: string;

  attrs: Attrs;

  occ?: {
    attrs: Attrs | any;
    create: (occurrence: typeof Occurrence, taxon: any) => typeof Occurrence;
    verify?: (attrs: any) => any;
  };

  create: (
    sample: any,
    params?: any,
    surveyName?: any,
    recorder?: string
  ) => any;
}
