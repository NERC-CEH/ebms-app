import areaSurvey from 'Survey/AreaCount/config';
import areaSingleSpeciesSurvey from 'Survey/AreaCount/configSpecies';
import mothSurvey from 'Survey/MothTrap/config';
import transectSurvey from 'Survey/Transect/config';

// eslint-disable-next-line import-x/prefer-default-export
export const getSurveyConfigs = () => ({
  [areaSurvey.id]: areaSurvey,
  [areaSingleSpeciesSurvey.id]: areaSingleSpeciesSurvey,
  [transectSurvey.id]: transectSurvey,
  [mothSurvey.id]: mothSurvey,
});
