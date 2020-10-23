import areaSurvey from 'Survey/AreaCount/config';
import preciseAreaSurvey from 'Survey/PreciseAreaCount/config';
import transectSurvey from 'Survey/Transect/config';

export default {
  [preciseAreaSurvey.name]: preciseAreaSurvey,
  [areaSurvey.name]: areaSurvey,
  [transectSurvey.name]: transectSurvey,
};
