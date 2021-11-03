import areaSurvey from 'Survey/AreaCount/config';
import areaSingleSpeciesSurvey from 'Survey/AreaCount/configSpecies';
import areaSurveyOld from 'Survey/AreaCountOld/config';
import transectSurvey from 'Survey/Transect/config';
import mothSurvey from 'Survey/Moth/config';

export default {
  [areaSurvey.name]: areaSurvey,
  [areaSingleSpeciesSurvey.name]: areaSingleSpeciesSurvey,
  [areaSurveyOld.name]: areaSurveyOld,
  [transectSurvey.name]: transectSurvey,
  [mothSurvey.name]: mothSurvey,
};
