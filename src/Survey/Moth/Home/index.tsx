/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import { FC, useContext } from 'react';
import Sample, { useValidateCheck } from 'models/sample';
import { Capacitor } from '@capacitor/core';
import Occurrence from 'models/occurrence';
import appModel, { SurveyDraftKeys } from 'models/app';
import CONFIG from 'common/config';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { getUnkownSpecies } from 'Survey/Moth/config';
import { Page, Header, useAlert, useToast, captureImage } from '@flumens';
import Media from 'models/media';
import { useUserStatusCheck } from 'models/user';
import { IonButton, NavContext, isPlatform } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { usePromptImageSource } from 'common/Components/PhotoPicker';
import Main from './Main';
import './styles.scss';

function useDeleteSpeciesPrompt() {
  const alert = useAlert();

  function showDeleteSpeciesPrompt(occ: Occurrence) {
    const prompt = () => {
      alert({
        header: 'Delete',
        message: (
          <T>
            Are you sure you want to delete {{ taxon: occ.getTaxonName() }} ?
          </T>
        ),
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => occ.destroy(),
          },
        ],
      });
    };

    return new Promise(prompt);
  }

  return showDeleteSpeciesPrompt;
}

interface Props {
  sample: Sample;
}

const HomeController: FC<Props> = ({ sample }) => {
  const showDeleteSpeciesPrompt = useDeleteSpeciesPrompt();
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const toast = useToast();
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const promptImageSource = usePromptImageSource();

  const UNKNOWN_SPECIES = getUnkownSpecies();

  const { useImageIdentifier } = appModel.attrs;
  const isDisabled = sample.isDisabled();

  const surveyConfig = sample.getSurvey();

  const isEditing = sample.metadata.saved;

  const isTraining = !!sample.metadata.training;

  const _processSubmission = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);

    navigate(`/home/user-surveys`, 'root');
  };

  const _processDraft = async () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    const surveyName = sample.getSurvey().name;
    const draftKey = `draftId:${surveyName}` as keyof SurveyDraftKeys;
    appModel.attrs[draftKey] = '';
    await appModel.save();

    const saveAndReturn = () => {
      sample.cleanUp();
      sample.save();
      navigate(`/home/user-surveys`, 'root');
    };

    // eslint-disable-next-line no-param-reassign
    sample.metadata.saved = true;
    saveAndReturn();
  };

  const onSubmit = async () => {
    if (!sample.metadata.saved) {
      await _processDraft();
      return;
    }

    await _processSubmission();
  };

  const deleteOccurrence = (occ: Occurrence) => {
    showDeleteSpeciesPrompt(occ);
  };

  const increaseCount = (occ: Occurrence, is5x: boolean) => {
    occ.attrs.count += is5x ? 5 : 1;

    occ.save();
  };

  const getFinishButton = () => {
    const label = isEditing ? <T>Upload</T> : <T>Finish</T>;
    return (
      <IonButton
        color="secondary"
        fill="solid"
        shape="round"
        className="primary-button"
        onClick={onSubmit}
      >
        {label}
      </IonButton>
    );
  };

  const mergeOccurrence = (occ: Occurrence) => {
    const { comment, identifier } = occ.attrs;

    const speciesIsKnown =
      occ.attrs.taxon?.warehouse_id !== UNKNOWN_SPECIES.preferredId;
    if (!speciesIsKnown) return;

    const selectedTaxon = (selectedOccurrence: Occurrence) =>
      (selectedOccurrence.attrs.taxon?.preferredId ||
        selectedOccurrence.attrs.taxon?.warehouse_id) ===
        (occ?.attrs.taxon?.preferredId || occ?.attrs.taxon?.warehouse_id) &&
      selectedOccurrence !== occ &&
      selectedOccurrence.attrs.comment === comment &&
      selectedOccurrence.attrs.identifier === identifier;
    const occWithSameSpecies = sample.occurrences.find(selectedTaxon);

    if (!occWithSameSpecies) return;

    occWithSameSpecies.attrs.count += occ.attrs.count;
    occWithSameSpecies.attrs['count-outside'] += occ.attrs['count-outside'];

    while (occ.media.length) {
      const copy = occ.media.pop();
      occWithSameSpecies.media.push(copy);
    }

    occ.destroy();
    occWithSameSpecies.save();
  };

  const onIdentifyOccurrence = async (occ: Occurrence) => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    await occ.identify();

    mergeOccurrence(occ);
  };

  const onIdentifyAllOccurrences = () =>
    sample.occurrences.forEach(onIdentifyOccurrence);

  const photoSelect = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    async function getImage() {
      const shouldUseCamera = await promptImageSource();
      const cancelled = shouldUseCamera === null;
      if (cancelled) return [];

      const images = await captureImage(
        shouldUseCamera ? { camera: true } : { multiple: true }
      );
      if (!images.length) return [];

      const getImageModel = (image: any) => {
        const imageModel = Media.getImageModel(
          isPlatform('hybrid') ? Capacitor.convertFileSrc(image) : image,
          CONFIG.dataPath
        );

        return imageModel;
      };
      const imageModels = images.map(getImageModel);
      return Promise.all(imageModels);
    }

    const images = await getImage();
    if (!images.length) return;

    const identifier = sample.attrs.recorder;

    const taxon = UNKNOWN_SPECIES;

    images.forEach((imgModel: any) => {
      const newOccurrence = surveyConfig.occ.create(
        Occurrence,
        taxon,
        identifier,
        imgModel
      );

      sample.occurrences.push(newOccurrence);
      sample.save();
      if (!useImageIdentifier) return;
      onIdentifyOccurrence(newOccurrence);
    });
  };

  const trainingModeSubheader = isTraining && (
    <div className="training-survey">
      <T>Training Mode</T>
    </div>
  );

  return (
    <Page id="survey-moth-home">
      <Header
        title="Moth-trap survey"
        rightSlot={!isDisabled && getFinishButton()}
        subheader={trainingModeSubheader}
      />
      <Main
        match={match}
        sample={sample}
        increaseCount={increaseCount}
        deleteSpecies={deleteOccurrence}
        isDisabled={isDisabled}
        photoSelect={photoSelect}
        useImageIdentifier={useImageIdentifier}
        onIdentifyOccurrence={onIdentifyOccurrence}
        onIdentifyAllOccurrences={onIdentifyAllOccurrences}
      />
    </Page>
  );
};

export default observer(HomeController);
