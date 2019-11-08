import config from 'config';
import userModel from './user_model';
import savedSamples from '../saved_samples';
import Sample from './sample';

const Factory = {
  async createAreaCountSample() {
    const sample = new Sample();
    sample.metadata.survey = 'area';
    sample.set('surveyStartTime', sample.metadata.created_on); // this can't be done in defaults
    sample.toggleGPStracking();
    sample.startVibrateCounter();

    savedSamples.add(sample);
    return sample.save();
  },

  async createTransectSample() {
    const sample = new Sample();
    sample.metadata.survey = 'transect';
    sample.set('survey_id', config.indicia.surveys.transect.id);
    sample.set('date', new Date());
    sample.set('sample_method_id', 22);
    sample.set('surveyStartTime', new Date());

    const recorder = `${userModel.attrs.firstname} ${userModel.attrs.secondname}`;
    sample.set('recorder', recorder);

    savedSamples.add(sample);
    return sample.save();
  },

  createTransectSectionSample(location) {
    const sample = new Sample();
    sample.metadata.survey = 'transect';
    sample.set('survey_id', config.indicia.surveys.transect.id);
    sample.set('sample_method_id', 776);
    sample.set('location', location);

    return sample;
  },
};

export default Factory;
