import areaSurvey from 'Survey/AreaCount/config';
import areaSingleSpeciesSurvey from 'Survey/AreaCount/configSpecies';
import mothSurvey from 'Survey/Moth/config';
import transectSurvey from 'Survey/Transect/config';
import { Survey } from 'Survey/common/config';

export const getSurveyQuery = ({ id }: Survey) => ({
  match: {
    'metadata.survey.id': id,
  },
});

export const matchAppSurveys = {
  bool: {
    should: [
      transectSurvey,
      areaSurvey,
      areaSingleSpeciesSurvey,
      mothSurvey,
    ].map(getSurveyQuery),
  },
};
