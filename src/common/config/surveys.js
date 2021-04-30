import areaSurveyOld from 'Survey/AreaCountOld/config';
import preciseAreaSurvey from 'Survey/PreciseAreaCount/config';
import transectSurvey from 'Survey/Transect/config';

export default {
  [preciseAreaSurvey.name]: preciseAreaSurvey,
  [areaSurveyOld.name]: areaSurveyOld,
  [transectSurvey.name]: transectSurvey,
};
