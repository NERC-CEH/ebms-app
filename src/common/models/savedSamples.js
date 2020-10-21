import { initStoredSamples } from '@apps';
import Log from 'helpers/log';
import Sample from 'sample';
import { modelStore } from './store';

Log('SavedSamples: initializing');
const savedSamples = initStoredSamples(modelStore, Sample);

savedSamples.remoteSaveAll = async () => {
  Log('SavedSamples: setting all samples to send.');
  let affectedRecordsCount = 0;
  for (let index = 0; index < savedSamples.length; index++) {
    const sample = savedSamples[index];

    const isNotInDraftStage = sample.metadata.saved;
    const isAlreadyUploaded = !!sample.id;
    if (isNotInDraftStage && !isAlreadyUploaded) {
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
