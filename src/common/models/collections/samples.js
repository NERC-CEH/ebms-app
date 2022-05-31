import { initStoredSamples } from '@flumens';
import Log from 'helpers/log';
import Sample from 'models/sample';
import { modelStore } from '../store';

Log('SavedSamples: initializing');
const savedSamples = initStoredSamples(modelStore, Sample);

// eslint-disable-next-line @getify/proper-arrows/name
savedSamples.remoteSaveAll = async () => {
  Log('SavedSamples: setting all samples to send.');
  let affectedRecordsCount = 0;
  for (let index = 0; index < savedSamples.length; index++) {
    const sample = savedSamples[index];

    const isNotInDraftStage = sample.metadata.saved;
    const isAlreadyUploaded = !!sample.id;
    const isOldSurvey = !sample.getSurvey();
    if (isNotInDraftStage && !isAlreadyUploaded && !isOldSurvey) {
      const invalids = sample.validateRemote(); // eslint-disable-line
      if (!invalids) {
        affectedRecordsCount++;
        sample.saveRemote();
      }
    }
  }

  return affectedRecordsCount;
};

export default savedSamples;
