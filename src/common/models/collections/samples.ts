import SampleCollection from '@flumens/models/dist/Indicia/SampleCollection';
import config from 'common/config';
import Sample from 'models/sample';
import Occurrence from '../occurrence';
import { samplesStore } from '../store';
import userModel from '../user';

console.log('SavedSamples: initializing');

const samples: SampleCollection<Sample> = new SampleCollection({
  store: samplesStore,
  Model: Sample,
  Occurrence,
  url: config.backend.indicia.url,
  getAccessToken: () => userModel.getAccessToken(),
}) as any;

export async function uploadAllSamples() {
  console.log('SavedSamples: setting all samples to send.');
  let affectedRecordsCount = 0;
  for (let index = 0; index < samples.length; index++) {
    const sample = samples.data[index];

    const isNotInDraftStage = sample.metadata.saved;
    const isAlreadyUploaded = !!sample.id;
    const isOldSurvey = !sample.getSurvey();
    if (
      sample.isStored &&
      isNotInDraftStage &&
      !isAlreadyUploaded &&
      !isOldSurvey
    ) {
      const invalids = sample.validateRemote();
      if (!invalids) {
        affectedRecordsCount++;
        sample.saveRemote();
      }
    }
  }

  return affectedRecordsCount;
}

export function getPending() {
  const byUploadStatus = (sample: Sample) =>
    !sample.syncedAt && sample.metadata.saved;

  return samples.filter(byUploadStatus);
}

export function bySurveyDate(sample1: Sample, sample2: Sample) {
  const date1 = new Date(sample1.data.date);
  const moveToTop = !date1 || date1.toString() === 'Invalid Date';
  if (moveToTop) return -1;

  const date2 = new Date(sample2.data.date);
  return date2.getTime() - date1.getTime();
}

export default samples;
