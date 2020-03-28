import config from 'config';
import userModel from './user_model';
import savedSamples from './saved_samples';
import Sample from './sample';

const Factory = {
  async createAreaCountSample() {
    const sample = new Sample({
      metadata: {
        survey: 'area',
        pausedTime: 0,
      },
      attrs: { surveyStartTime: null },
    });
    sample.attrs.surveyStartTime = sample.metadata.created_on; // this can't be done in defaults
    sample.toggleGPStracking();
    sample.startVibrateCounter();

    savedSamples.push(sample);
    return sample.save();
  },

  async createTransectSample() {
    const recorder = `${userModel.attrs.firstname} ${userModel.attrs.secondname}`;

    const sample = new Sample({
      metadata: {
        survey: 'transect',
      },
      attrs: {
        survey_id: config.indicia.surveys.transect.id,
        date: new Date(),
        sample_method_id: 22,
        surveyStartTime: new Date(),
        recorder,
      },
    });

    savedSamples.push(sample);
    return sample.save();
  },

  createTransectSectionSample(location) {
    const sample = new Sample({
      metadata: {
        survey: 'transect',
      },
      attrs: {
        survey_id: config.indicia.surveys.transect.id,
        sample_method_id: 776,
        location,
      },
    });

    return sample;
  },
};

export default Factory;
