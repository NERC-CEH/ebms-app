/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import { FC, useContext } from 'react';
import Sample, { useValidateCheck } from 'models/sample';
import { Capacitor } from '@capacitor/core';
import Occurrence from 'models/occurrence';
import appModel from 'models/app';
import CONFIG from 'common/config';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';
import { useRouteMatch } from 'react-router';
import { getUnkownSpecies } from 'Survey/Moth/config';
import savedSamples from 'models/collections/samples';
import { Page, Header, useAlert, useToast, captureImage } from '@flumens';
import Media from 'models/media';
import { useUserStatusCheck } from 'models/user';
import { IonButton, NavContext, isPlatform, IonLabel } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { usePromptImageSource } from 'common/Components/PhotoPicker';
import Main from './Main';
import './styles.scss';

const useDeleteSpeciesPrompt = () => {
  const alert = useAlert();

  function showDeleteSpeciesPrompt(taxon: any) {
    const prompt = (resolve: any) => {
      const taxonName = taxon.scientific_name;
      alert({
        header: i18n.t('Delete'),
        skipTranslation: true,
        message: i18n.t('Are you sure you want to delete {{taxon}} ?', {
          taxon: taxonName,
        }),
        buttons: [
          {
            text: i18n.t('Cancel'),
            role: 'cancel',
          },
          {
            text: i18n.t('Delete'),
            role: 'destructive',
            handler: resolve,
          },
        ],
      });
    };

    return new Promise(prompt);
  }

  return showDeleteSpeciesPrompt;
};

function byCreateTime(model1: Sample, model2: Sample) {
  const date1 = new Date(model1.metadata.createdOn);
  const date2 = new Date(model2.metadata.createdOn);
  return date2.getTime() - date1.getTime();
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

  // const deleteOccurrence = (occ: Occurrence) => {
  //   showDeleteSpeciesPrompt(occ);
  // };

  const deleteFromShallowList = (taxon: any) => {
    const withSamePreferredIdOrWarehouseId = (t: any) => {
      if (t.preferredId) return t.preferredId === taxon.preferredId;

      return t.warehouse_id === taxon.warehouse_id;
    };

    const taxonIndexInShallowList = sample.shallowSpeciesList.findIndex(
      withSamePreferredIdOrWarehouseId
    );

    sample.shallowSpeciesList.splice(taxonIndexInShallowList, 1);
  };

  const deleteSpecies = async (taxon: any, isShallow: boolean, ref: any) => {
    if (!sample.isSurveyPreciseSingleSpecies() && isShallow) {
      deleteFromShallowList(taxon);

      await ref.current.closeOpened();

      return;
    }

    const destroyWrap = () => {
      const matchingTaxon = (occ: Occurrence) =>
        occ.attrs.taxon.warehouse_id === taxon.warehouse_id;
      const subSamplesMatchingTaxon = sample.occurrences.filter(matchingTaxon);

      const destroy = (occ: Occurrence) => occ.destroy();
      subSamplesMatchingTaxon.forEach(destroy);
    };

    showDeleteSpeciesPrompt(taxon).then(destroyWrap);
  };

  const navigateToSpeciesOccurrences = (taxon: any) => {
    const matchingTaxon = (occ: Occurrence) =>
      occ.attrs.taxon.warehouse_id === taxon.warehouse_id;
    const occ = sample.occurrences.find(matchingTaxon);

    if (!occ) return;

    navigate(`${match.url}/occ/${occ.cid}`);
  };

  const increaseCount = (taxon: any, isShallow: boolean, is5x: boolean) => {
    if (isShallow) {
      deleteFromShallowList(taxon);

      const survey = sample.getSurvey();
      const newOccurrence = survey.occ!.create!({ Occurrence, taxon });
      // newOccurrence.attrs.taxon.machineInvolvement = machineInvolvement;
      sample.occurrences.push(newOccurrence);
      sample.save();
    } else {
      const matchingTaxon = (occ: Occurrence) =>
        occ.attrs.taxon.warehouse_id === taxon.warehouse_id;

      const occ = sample.occurrences.find(matchingTaxon);

      if (!occ) return;

      occ.attrs.count += is5x ? 5 : 1;
      occ.save();
    }
  };

  const getFinishButton = () => {
    const label = isEditing ? <T>Upload</T> : <T>Finish</T>;

    const isValid = !sample.validateRemote();
    return (
      <IonButton
        color={isValid ? 'secondary' : 'medium'}
        fill="solid"
        shape="round"
        className="primary-button"
        onClick={onSubmit}
      >
        <IonLabel>{label}</IonLabel>
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
      const copy = occ.media.pop() as Media;
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

      const getImageModel = (image: any) =>
        Media.getImageModel(
          isPlatform('hybrid') ? Capacitor.convertFileSrc(image) : image,
          CONFIG.dataPath
        ) as Promise<Media>;

      const imageModels = images.map(getImageModel);

      return Promise.all(imageModels);
    }

    const images = await getImage();
    if (!images.length) return;

    const identifier = sample.attrs.recorder;

    const taxon = UNKNOWN_SPECIES;

    images.forEach((photo: Media) => {
      const newOccurrence = surveyConfig.occ!.create!({
        Occurrence,
        taxon,
        identifier,
        photo,
      });

      sample.occurrences.push(newOccurrence);
      sample.save();
      if (!useImageIdentifier) return;
      onIdentifyOccurrence(newOccurrence);
    });
  };

  const getPreviousSurvey = () => {
    const sortedSavedSamples = [...savedSamples].sort(byCreateTime).reverse();

    const matchingSampleId = (s: Sample) => s.cid === sample.cid;
    const currentSampleIndex = sortedSavedSamples.findIndex(matchingSampleId);

    const isFirstSurvey = !currentSampleIndex;
    if (isFirstSurvey) return null;

    const previousSurveys = sortedSavedSamples
      .slice(0, currentSampleIndex)
      .reverse();

    const matchingSurvey = (s: Sample) => s.getSurvey().name === 'moth';
    const previousSurvey = previousSurveys.find(matchingSurvey);

    return previousSurvey;
  };

  const copyPreviousSurveyTaxonList = () => {
    if (sample.metadata.saved) return;

    const previousSurvey = getPreviousSurvey();
    if (!previousSurvey) {
      toast.warn('Sorry, no previous survey to copy species from.');
      return;
    }

    const getSpeciesId = (occ: Occurrence) =>
      occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id;
    const existingSpeciesIds = sample.occurrences.map(getSpeciesId);

    const uniqueSpeciesList: any = [];
    const getNewSpeciesOnly = ({ warehouse_id, preferredId }: any) => {
      const speciesID = preferredId || warehouse_id;

      if (uniqueSpeciesList.includes(speciesID)) {
        return false;
      }
      uniqueSpeciesList.push(speciesID);
      return !existingSpeciesIds.includes(speciesID);
    };

    const getTaxon = (occ: Occurrence) => toJS(occ.attrs.taxon);
    const newSpeciesList = previousSurvey.occurrences
      .map(getTaxon)
      .filter(getNewSpeciesOnly) as [];

    // copy but retain old observable ref
    sample.shallowSpeciesList.splice(
      0,
      sample.shallowSpeciesList.length,
      ...newSpeciesList
    );

    if (!newSpeciesList.length) {
      toast.warn('Sorry, no species were found to copy.');
    } else {
      toast.success(
        i18n.t('You have successfully copied {{speciesCount}} species.', {
          speciesCount: newSpeciesList.length,
        }),
        { skipTranslation: true }
      );
    }
  };

  const isTraining = !!sample.attrs.training;
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
        deleteSpecies={deleteSpecies}
        isDisabled={isDisabled}
        photoSelect={photoSelect}
        useImageIdentifier={useImageIdentifier}
        onIdentifyOccurrence={onIdentifyOccurrence}
        onIdentifyAllOccurrences={onIdentifyAllOccurrences}
        copyPreviousSurveyTaxonList={copyPreviousSurveyTaxonList}
        navigateToSpeciesOccurrences={navigateToSpeciesOccurrences}
      />
    </Page>
  );
};

export default observer(HomeController);
