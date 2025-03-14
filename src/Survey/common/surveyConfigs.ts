/* eslint-disable import/prefer-default-export */
import areaSurvey from 'Survey/AreaCount/config';
import areaSingleSpeciesSurvey from 'Survey/AreaCount/configSpecies';
import mothSurvey from 'Survey/Moth/config';
import transectSurvey from 'Survey/Transect/config';

export const getSurveyConfigs = () => ({
  [areaSurvey.id]: areaSurvey,
  [areaSingleSpeciesSurvey.id]: areaSingleSpeciesSurvey,
  [transectSurvey.id]: transectSurvey,
  [mothSurvey.id]: mothSurvey,
});
