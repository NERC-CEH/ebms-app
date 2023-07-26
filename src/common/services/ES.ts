import areaSurvey from 'Survey/AreaCount/config';
import mothSurvey from 'Survey/Moth/config';
import transectSurvey from 'Survey/Transect/config';
import { Survey } from 'Survey/common/config';

// eslint-disable-next-line import/prefer-default-export
export const getSurveyQuery = ({ id }: Survey) => ({
  match: {
    'metadata.survey.id': id,
  },
});

export const matchAppSurveys = {
  bool: {
    should: [transectSurvey, areaSurvey, mothSurvey].map(getSurveyQuery),
  },
};
