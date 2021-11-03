import { Survey } from 'common/config/surveys';
const survey: Survey = {
  id: -1,
  name: 'moth',
  label: 'Moth survey',

  create(AppSample, surveyId = survey.id, surveyName = survey.name) {
    const sample = new AppSample({
      metadata: {
        survey_id: surveyId,
        survey: surveyName,
      },
    });

    return sample;
  },
};

export default survey;
