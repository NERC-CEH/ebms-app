import { useContext } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Capacitor } from '@capacitor/core';
import {
  Page,
  useAlert,
  useToast,
  captureImage,
  useRemoteSample,
  useSample,
} from '@flumens';
import { NavContext, isPlatform } from '@ionic/react';
import { usePromptImageSource } from 'common/Components/PhotoPicker';
import CONFIG from 'common/config';
import appModel from 'models/app';
import samplesCollection from 'models/collections/samples';
import Media from 'models/media';
import Occurrence, { Taxon, doesShallowTaxonMatch } from 'models/occurrence';
import Sample, { useValidateCheck } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import { getUnknownSpecies } from 'Survey/Moth/config';
import Header from './Header';
import Main from './Main';

const useDeleteSpeciesPrompt = () => {
  const alert = useAlert();
  const { t } = useTranslation();

  function showDeleteSpeciesPrompt(taxon: any) {
    const prompt = (resolve: any) => {
      const taxonName = taxon.scientific_name;
      alert({
        header: t('Delete'),
        skipTranslation: true,
        message: t('Are you sure you want to delete {{taxon}} ?', {
          taxon: taxonName,
        }),
        buttons: [
          {
            text: t('Cancel'),
            role: 'cancel',
          },
          {
            text: t('Delete'),
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
  const date1 = new Date(model1.createdAt);
  const date2 = new Date(model2.createdAt);
  return date2.getTime() - date1.getTime();
}

const HomeController = () => {
  const showDeleteSpeciesPrompt = useDeleteSpeciesPrompt();
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const toast = useToast();

  let { sample } = useSample<Sample>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const promptImageSource = usePromptImageSource();

  if (!sample) return null;

  const UNKNOWN_SPECIES = getUnknownSpecies();

  const { useImageIdentifier } = appModel.data;
  const { isDisabled } = sample;

  const surveyConfig = sample.getSurvey();

  const processSubmission = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);

    navigate('/home/user-surveys', 'root');
  };

  const processDraft = async () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    await appModel.save();

    const saveAndReturn = () => {
      sample.cleanUp();
      sample.save();
      navigate('/home/user-surveys', 'root');
    };

    sample.metadata.saved = true;
    saveAndReturn();
  };

  const onSubmit = async () => {
    if (!sample.metadata.saved) {
      await processDraft();
      return;
    }

    await processSubmission();
  };

  const toggleSpeciesSort = () => {
    const { areaSurveyListSortedByTime } = appModel.data;
    const newSort = !areaSurveyListSortedByTime;
    appModel.data.areaSurveyListSortedByTime = newSort;
    appModel.save();

    const prettySortName = appModel.data.areaSurveyListSortedByTime
      ? 'last added'
      : 'alphabetical';

    toast.success(`Changed list ordering to ${prettySortName}.`, {
      color: 'light',
      position: 'bottom',
      duration: 1000,
    });
  };

  // const deleteOccurrence = (occ: Occurrence) => {
  //   showDeleteSpeciesPrompt(occ);
  // };

  const deleteFromShallowList = (taxon: Taxon) => {
    const withSamePreferredIdOrWarehouseId = (shallowEntry: Taxon) =>
      doesShallowTaxonMatch(shallowEntry, taxon);

    const taxonIndexInShallowList = sample.shallowSpeciesList.findIndex(
      withSamePreferredIdOrWarehouseId
    );

    const isNotInShallowList = taxonIndexInShallowList === -1;
    if (isNotInShallowList) return;

    sample.shallowSpeciesList.splice(taxonIndexInShallowList, 1);
  };

  const deleteSpecies = async (taxon: any, isShallow: boolean, ref: any) => {
    if (isShallow) {
      deleteFromShallowList(taxon);
      await ref.current.closeOpened();

      return;
    }

    const destroyWrap = () => {
      const matchingTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxon);
      const sampleMatchingTaxon = sample.occurrences.filter(matchingTaxon);

      const destroy = (occ: Occurrence) => {
        occ.destroy();
        deleteFromShallowList(taxon);
      };
      sampleMatchingTaxon.forEach(destroy);
    };

    showDeleteSpeciesPrompt(taxon).then(destroyWrap);
  };
  const navigateToSpeciesOccurrences = (taxon: any) => {
    const matchingTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxon);
    const occ = sample.occurrences.find(matchingTaxon);

    if (!occ) return;

    navigate(`${match.url}/occ/${occ.cid}`);
  };

  const increaseCount = (taxa: Taxon, isShallow: boolean, is5x: boolean) => {
    if (isShallow) {
      const survey = sample.getSurvey();
      const newOccurrence = survey.occ!.create!({ Occurrence, taxon: taxa });

      newOccurrence.createdAt = 0;
      sample.occurrences.push(newOccurrence);
      sample.save();
      return;
    }

    const matchingTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxa);

    const occ = sample.occurrences.find(matchingTaxon);

    if (!occ) return;

    occ.data.count += is5x ? 5 : 1;
    occ.save();
  };

  const mergeOccurrence = (occ: Occurrence) => {
    const { comment, identifier } = occ.data;

    const speciesIsKnown =
      occ.data.taxon?.warehouse_id !== UNKNOWN_SPECIES.preferredId;
    if (!speciesIsKnown) return;

    const selectedTaxon = (selectedOccurrence: Occurrence) =>
      (selectedOccurrence.data.taxon?.preferredId ||
        selectedOccurrence.data.taxon?.warehouse_id) ===
        (occ?.data.taxon?.preferredId || occ?.data.taxon?.warehouse_id) &&
      selectedOccurrence !== occ &&
      selectedOccurrence.data.comment === comment &&
      selectedOccurrence.data.identifier === identifier;
    const occWithSameSpecies = sample.occurrences.find(selectedTaxon);
    if (!occWithSameSpecies) return;

    const isAlreadyMerged =
      occWithSameSpecies.cid === occ.cid ||
      occWithSameSpecies.metadata.mergedOccurrences?.includes(occ.cid);
    if (isAlreadyMerged) {
      // Don't know how this can happen yet
      console.error('Moth occ duplicate was rejected for merging.');
      return;
    }

    occWithSameSpecies.metadata.mergedOccurrences ??= [];
    occWithSameSpecies.metadata.mergedOccurrences.push(occ.cid);

    occWithSameSpecies.data.count += occ.data.count;
    occWithSameSpecies.data['count-outside'] += occ.data['count-outside'];

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
          CONFIG.dataPath,
          true
        ) as Promise<Media>;

      const imageModels = images.map(getImageModel);

      return Promise.all(imageModels);
    }

    const images = await getImage();
    if (!images.length) return;

    const identifier = sample.data.recorder;

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
    const sortedSavedSamples = [...samplesCollection]
      .sort(byCreateTime)
      .reverse();

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
      occ.data.taxon.preferredId || occ.data.taxon.warehouse_id;
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

    const getTaxon = (occ: Occurrence) => toJS(occ.data.taxon);
    const newSpeciesList = previousSurvey.occurrences
      .map(getTaxon)
      .filter(getNewSpeciesOnly) as [];

    // copy but retain old observable ref
    sample.shallowSpeciesList.splice(
      0,
      sample.shallowSpeciesList.length,
      ...newSpeciesList
    );

    const speciesNameSort = (sp1: any, sp2: any) => {
      const taxon1 = sp1.found_in_name;
      const taxonName1 = sp1[taxon1];

      const taxon2 = sp2.found_in_name;
      const taxonName2 = sp2[taxon2];

      return taxonName1.localeCompare(taxonName2);
    };

    sample.shallowSpeciesList.sort(speciesNameSort);

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

  const { areaSurveyListSortedByTime } = appModel.data;

  return (
    <Page id="survey-moth-home">
      <Header sample={sample} onSubmit={onSubmit} />
      <Main
        match={match}
        sample={sample}
        increaseCount={increaseCount}
        deleteSpecies={deleteSpecies}
        isDisabled={isDisabled}
        onToggleSpeciesSort={toggleSpeciesSort}
        photoSelect={photoSelect}
        areaSurveyListSortedByTime={areaSurveyListSortedByTime}
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
