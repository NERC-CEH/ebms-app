/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import { FC, useContext } from 'react';
import Sample, { useValidateCheck } from 'models/sample';
import Occurrence from 'models/occurrence';
import appModel, { SurveyDraftKeys } from 'models/app';
import CONFIG from 'common/config';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { getUnkownSpecies } from 'Survey/Moth/config';
import { Page, Header, useAlert, device, useToast } from '@flumens';
import Media from 'models/media';
import { useUserStatusCheck } from 'models/user';
import ImageHelp from 'common/Components/PhotoPicker/imageUtils';
import { IonButton, NavContext } from '@ionic/react';
import { useTranslation, Trans as T } from 'react-i18next';
import Main from './Main';
import './styles.scss';

function useDeleteSpeciesPrompt() {
  const alert = useAlert();

  function showDeleteSpeciesPrompt(occ: Occurrence) {
    const prompt = () => {
      alert({
        header: 'Delete',
        message: `Are you sure you want to delete ${occ.getTaxonName()}?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'primary',
          },
          {
            text: 'Delete',
            cssClass: 'secondary',
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
  const { t } = useTranslation();
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const toast = useToast();
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const UNKNOWN_SPECIES = getUnkownSpecies();

  const { useImageIdentifier } = appModel.attrs;
  const isDisabled = sample.isDisabled();

  const surveyConfig = sample.getSurvey();

  const isEditing = sample.metadata.saved;

  const _processSubmission = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);

    navigate(`/home/user-surveys`, 'root');
  };

  const _processDraft = async () => {
    const surveyName = sample.getSurvey().name;
    const draftKey = `draftId:${surveyName}` as keyof SurveyDraftKeys;
    appModel.attrs[draftKey] = '';
    await appModel.save();

    const saveAndReturn = () => {
      sample.cleanUp();
      sample.save();
      navigate(`/home/user-surveys`, 'root');
    };

    const isValid = checkSampleStatus();
    if (!isValid) return;

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
    return <IonButton onClick={onSubmit}>{label}</IonButton>;
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
    await occ.identify();

    mergeOccurrence(occ);
  };

  const onIdentifyAllOccurrences = () =>
    sample.occurrences.forEach(onIdentifyOccurrence);

  const photoSelect = async () => {
    if (!device.isOnline) {
      toast.warn('Looks like you are offline!');
      return;
    }

    const promptOptions = {
      promptLabelHeader: t('Choose a method to upload a photo'),
      promptLabelPhoto: t('Gallery'),
      promptLabelPicture: t('Camera'),
      promptLabelCancel: t('Cancel'),
    };
    const photo = await ImageHelp.getImage(promptOptions);
    if (!photo) return;

    const dataDirPath = CONFIG.dataPath;

    const image = await ImageHelp.getImageModel(Media, photo, dataDirPath);

    const identifier = sample.attrs.recorder;

    const taxon = UNKNOWN_SPECIES;

    const newOccurrence = surveyConfig.occ.create(
      Occurrence,
      taxon,
      identifier,
      image
    );

    sample.occurrences.push(newOccurrence);
    sample.save();

    if (!useImageIdentifier) return;

    onIdentifyOccurrence(newOccurrence);
  };

  return (
    <Page id="survey-moth-home">
      <Header
        title="Moth-trap survey"
        rightSlot={!isDisabled && getFinishButton()}
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
