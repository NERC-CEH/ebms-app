import { intercept } from 'mobx';
import { initStoredSamples } from '@flumens';
import Sample from 'models/sample';
import { modelStore } from '../store';

console.log('SavedSamples: initializing');
const samplesCollection = initStoredSamples(modelStore, Sample);
export const samplesCollectionById = new Map<string, Sample>();

// eslint-disable-next-line @getify/proper-arrows/name
samplesCollection.remoteSaveAll = async () => {
  console.log('SavedSamples: setting all samples to send.');
  let affectedRecordsCount = 0;
  for (let index = 0; index < samplesCollection.length; index++) {
    const sample = samplesCollection[index];

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

const onChangeUpdateMap = (change: any) => {
  if (change.added && change.added.length) {
    const attachToById = (model: any) => {
      samplesCollectionById.set(model.cid, model);
    };
    change.added.forEach(attachToById);
  }

  if (change.removedCount > 0) {
    const key: string = Array.from(samplesCollectionById.keys())[change.index];
    samplesCollectionById.delete(key);
  }

  return change;
};
intercept(samplesCollection, onChangeUpdateMap);

export function getPending() {
  const byUploadStatus = (sample: Sample) =>
    !sample.metadata.syncedOn && sample.metadata.saved;

  return samplesCollection.filter(byUploadStatus);
}

export default samplesCollection;
