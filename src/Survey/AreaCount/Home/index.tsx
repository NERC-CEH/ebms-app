import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { toJS } from 'mobx';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Page, useAlert, useToast } from '@flumens';
import i18n from 'i18next';
import { NavContext, isPlatform } from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample, { useValidateCheck } from 'models/sample';
import savedSamples from 'models/collections/samples';
import appModel, { SurveyDraftKeys } from 'models/app';
import { useUserStatusCheck } from 'models/user';
import Header from './Header';
import Main from './Main';

const hapticsImpact = async () => {
  await Haptics.impact({ style: ImpactStyle.Heavy });
};

const useDeleteSpeciesPrompt = () => {
  const alert = useAlert();

  function showDeleteSpeciesPrompt(taxon: any) {
    const prompt = (resolve: any) => {
      const name = taxon.scientific_name;
      alert({
        header: 'Delete',
        message: i18n.t('Are you sure you want to delete {{taxon}} ?', {
          name,
        }),
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'primary',
          },
          {
            text: 'Delete',
            cssClass: 'secondary',
            handler: resolve,
          },
        ],
      });
    };

    return new Promise(prompt);
  }

  return showDeleteSpeciesPrompt;
};

function setSurveyEndTime(sample: Sample) {
  sample.attrs.surveyEndTime = new Date(); // eslint-disable-line no-param-reassign
  return sample.save();
}

/* eslint-disable no-param-reassign */
function toggleTimer(sample: Sample) {
  if (sample.isTimerFinished()) return;

  if (sample.timerPausedTime.time) {
    const pausedTime =
      Date.now() - new Date(sample.timerPausedTime.time).getTime();
    sample.metadata.pausedTime += pausedTime;
    sample.timerPausedTime.time = null;
    sample.save();
    return;
  }
  sample.timerPausedTime.time = new Date();
}
/* eslint-enable no-param-reassign */

function byCreateTime(model1: Sample, model2: Sample) {
  const date1 = new Date(model1.metadata.created_on);
  const date2 = new Date(model2.metadata.created_on);
  return date2.getTime() - date1.getTime();
}

type Props = {
  sample: Sample;
};

const HomeController: FC<Props> = ({ sample }) => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch<any>();
  const showDeleteSpeciesPrompt = useDeleteSpeciesPrompt();
  const toast = useToast();
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

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
      setSurveyEndTime(sample);

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

  const navigateToSpeciesOccurrences = (taxon: any) => {
    navigate(`${match.url}/speciesOccurrences/${taxon.warehouse_id}`);
  };

  const toggleSpeciesSort = () => {
    const { areaSurveyListSortedByTime } = appModel.attrs;
    appModel.attrs.areaSurveyListSortedByTime = !areaSurveyListSortedByTime;
    appModel.save();
  };

  const getPreviousSurvey = () => {
    const sortedSavedSamples = [...savedSamples].sort(byCreateTime).reverse();
    const matchingSampleId = (s: Sample) => s.cid === sample.cid;

    const currentSampleIndex = sortedSavedSamples.findIndex(matchingSampleId);

    const isFirstSurvey = !currentSampleIndex;

    if (isFirstSurvey) {
      return null;
    }

    const previousSurveys = sortedSavedSamples
      .slice(0, currentSampleIndex)
      .reverse();

    const matchingSurvey = (s: Sample) => s.getSurvey().name === 'precise-area';
    const previousSurvey = previousSurveys.find(matchingSurvey);

    return previousSurvey;
  };

  const copyPreviousSurveyTaxonList = () => {
    const previousSurvey = getPreviousSurvey();
    if (!previousSurvey) {
      toast.warn('Sorry, no previous survey to copy species from.');
      return;
    }

    const getSpeciesId = (s: Sample) =>
      s.occurrences[0].attrs.taxon.preferredId;
    const existingSpeciesIds = sample.samples.map(getSpeciesId);

    const uniqueSpeciesList: any = [];
    const getNewSpeciesOnly = ({ preferredId }: any) => {
      if (uniqueSpeciesList.includes(preferredId)) {
        return false;
      }
      uniqueSpeciesList.push(preferredId);
      return !existingSpeciesIds.includes(preferredId);
    };

    const getTaxon = (s: Sample) => toJS(s.occurrences[0].attrs.taxon);
    const newSpeciesList = previousSurvey.samples
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
        })
      );
    }
  };

  const deleteFromShallowList = (taxon: any) => {
    const withSamePreferredId = (t: any) => t.preferredId === taxon.preferredId;
    const taxonIndexInShallowList =
      sample.shallowSpeciesList.findIndex(withSamePreferredId);

    sample.shallowSpeciesList.splice(taxonIndexInShallowList, 1);
  };

  const deleteSpecies = (taxon: any, isShallow: boolean) => {
    if (!sample.isSurveyPreciseSingleSpecies() && isShallow) {
      deleteFromShallowList(taxon);
      return;
    }

    const destroyWrap = () => {
      const matchingTaxon = (smp: Sample) =>
        smp.occurrences[0].attrs.taxon.warehouse_id === taxon.warehouse_id;
      const subSamplesMatchingTaxon = sample.samples.filter(matchingTaxon);

      const destroy = (s: Sample) => s.destroy();
      subSamplesMatchingTaxon.forEach(destroy);
    };

    showDeleteSpeciesPrompt(taxon).then(destroyWrap);
  };

  const increaseCount = (taxon: any, isShallow: boolean) => {
    if (sample.isSurveyPreciseSingleSpecies() && sample.hasZeroAbundance()) {
      // eslint-disable-next-line no-param-reassign
      sample.samples[0].occurrences[0].attrs.zero_abundance = null;
      sample.samples[0].startGPS();
      sample.save();
      return;
    }

    if (sample.isDisabled()) {
      return;
    }

    if (isShallow) {
      deleteFromShallowList(taxon);
    }

    const survey = sample.getSurvey();

    const newSubSample = survey.smp.create(Sample, Occurrence, taxon, null);
    sample.samples.push(newSubSample);
    newSubSample.startGPS();
    sample.save();

    isPlatform('hybrid') && hapticsImpact();
  };

  const { areaSurveyListSortedByTime } = appModel.attrs;
  const isTraining = !!sample.metadata.training;
  const isEditing = sample.metadata.saved;
  const isDisabled = !!sample.metadata.synced_on;

  const previousSurvey = getPreviousSurvey();

  return (
    <Page id="precise-area-count-edit">
      <Header
        survey={sample.getSurvey()}
        onSubmit={onSubmit}
        isTraining={isTraining}
        isEditing={isEditing}
        isDisabled={isDisabled}
      />
      <Main
        sample={sample}
        previousSurvey={previousSurvey}
        deleteSpecies={deleteSpecies}
        increaseCount={increaseCount}
        toggleTimer={toggleTimer}
        navigateToSpeciesOccurrences={navigateToSpeciesOccurrences}
        areaSurveyListSortedByTime={areaSurveyListSortedByTime}
        onToggleSpeciesSort={toggleSpeciesSort}
        isDisabled={isDisabled}
        copyPreviousSurveyTaxonList={copyPreviousSurveyTaxonList}
      />
    </Page>
  );
};

export default observer(HomeController);
