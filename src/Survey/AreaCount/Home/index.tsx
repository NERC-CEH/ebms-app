import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { toJS, observable } from 'mobx';
import { Page, useAlert, useToast, Attr } from '@flumens';
import i18n from 'i18next';
import { NavContext } from '@ionic/react';
import Occurrence, { SpeciesGroup } from 'models/occurrence';
import Sample, { useValidateCheck } from 'models/sample';
import savedSamples from 'models/collections/samples';
import appModel from 'models/app';
import { useUserStatusCheck } from 'models/user';
import { useDeleteConfirmation } from '../SpeciesOccurrences';
import Header from './Header';
import Main from './Main';

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
          },
          {
            text: 'Delete',
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

function showSpeciesGroupList(
  sample: Sample,
  alert: any,
  speciesGroups: SpeciesGroup
) {
  let lastSpeciesGroup: string[];
  const form = (
    <div id="filters-dialog-form">
      <div className="taxon-groups taxa-filter-edit-dialog-form">
        <Attr
          attr="speciesGroups"
          model={sample}
          input="checkbox"
          set={(newValues: string[], model: Sample) => {
            // eslint-disable-next-line no-param-reassign
            model.attrs.speciesGroups = newValues;
            model.save();

            if (model.attrs.speciesGroups.length) {
              lastSpeciesGroup = newValues;
            }

            if (!model.attrs.speciesGroups.length) {
              // eslint-disable-next-line no-param-reassign, prefer-destructuring
              model.attrs.speciesGroups = lastSpeciesGroup;
              model.save();
            }
          }}
          get={(model: Sample) => [...model.attrs.speciesGroups]}
          inputProps={{ options: speciesGroups }}
        />
      </div>
    </div>
  );

  const showSpeciesGroupDialog = (resolve: (param: boolean) => void) => {
    alert({
      header: 'Which species groups have you counted?',
      cssClass: 'speciesGroupAlert',
      message: <>{form}</>,

      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => resolve(false),
        },

        {
          text: 'Confirm',
          role: 'primary',
          handler: () => resolve(true),
        },
      ],
    });
  };

  return new Promise(showSpeciesGroupDialog);
}

const shouldShowSpeciesGroupDialog = (groups: SpeciesGroup[]) => {
  if (groups.length !== 1 && !groups.every((gr: SpeciesGroup) => gr.disabled)) {
    if (groups.length) {
      return true;
    }
  }

  return false;
};

type Props = {
  sample: Sample;
};

const HomeController: FC<Props> = ({ sample }) => {
  const alert = useAlert();

  const { navigate } = useContext(NavContext);
  const match = useRouteMatch<any>();
  const showDeleteSpeciesPrompt = useDeleteSpeciesPrompt();
  const toast = useToast();
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();
  const confirmDelete = useDeleteConfirmation();

  const _processSubmission = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);

    navigate(`/home/user-surveys`, 'root');
  };

  const showSpeciesGroupConfirmationDialog = (speciesGroups: any) =>
    showSpeciesGroupList(sample, alert, speciesGroups);

  const _processDraft = async () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    if (!sample.isPreciseSingleSpeciesSurvey()) {
      const speciesGroups = sample.getSpeciesGroupList();
      const extractValue = (group: SpeciesGroup) => group.value;
      // eslint-disable-next-line no-param-reassign
      sample.attrs.speciesGroups = speciesGroups.map(extractValue);
      sample.save();

      if (shouldShowSpeciesGroupDialog(speciesGroups)) {
        const speciesGroupConfirmationDialog =
          await showSpeciesGroupConfirmationDialog(speciesGroups);
        if (!speciesGroupConfirmationDialog) return;
      }
    }

    appModel.setLocation(sample.attrs.location);

    await appModel.save();

    const saveAndReturn = () => {
      setSurveyEndTime(sample);

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
    if (sample.metadata.saved) return;

    const previousSurvey = getPreviousSurvey();
    if (!previousSurvey) {
      toast.warn('Sorry, no previous survey to copy species from.');
      return;
    }

    const getSpeciesId = (s: Sample) =>
      s.occurrences[0].attrs.taxon.preferredId ||
      s.occurrences[0].attrs.taxon.warehouse_id;
    const existingSpeciesIds = sample.samples.map(getSpeciesId);

    const uniqueSpeciesList: any = [];
    const getNewSpeciesOnly = ({ warehouse_id, preferredId }: any) => {
      const speciesID = preferredId || warehouse_id;

      if (uniqueSpeciesList.includes(speciesID)) {
        return false;
      }
      uniqueSpeciesList.push(speciesID);
      return !existingSpeciesIds.includes(speciesID);
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
    const withSamePreferredIdOrWarehouseId = (t: any) => {
      if (t.preferredId) return t.preferredId === taxon.preferredId;

      return t.warehouse_id === taxon.warehouse_id;
    };

    const taxonIndexInShallowList = sample.shallowSpeciesList.findIndex(
      withSamePreferredIdOrWarehouseId
    );

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

  const increaseCount = (taxon: any, isShallow: boolean, is5x: boolean) => {
    if (sample.isSurveyPreciseSingleSpecies() && sample.hasZeroAbundance()) {
      // eslint-disable-next-line no-param-reassign
      sample.samples[0].occurrences[0].attrs.zero_abundance = null;
      sample.samples[0].startGPS();
      sample.save();
      return;
    }

    if (sample.isDisabled()) return;

    if (isShallow) {
      deleteFromShallowList(taxon);
    }

    const survey = sample.getSurvey();

    const addOneCount = () => {
      const newSubSample = survey.smp.create(Sample, Occurrence, taxon, null);
      sample.samples.push(newSubSample);
      newSubSample.startGPS();
    };

    if (is5x) {
      [...Array(5)].forEach(addOneCount);
    } else {
      addOneCount();
    }

    sample.save();
  };

  const deleteSingleSample = async (smp: Sample) => {
    const shouldDelete = await confirmDelete();
    if (!shouldDelete) return;

    const taxon = { ...smp.occurrences[0].attrs.taxon };
    await smp.destroy();

    const byTaxonId = (s: Sample) =>
      s.occurrences[0].attrs.taxon.preferredId === taxon.preferredId ||
      s.occurrences[0].attrs.taxon.warehouse_id === taxon.warehouse_id;

    const isLastSampleDeleted = ![...sample.samples].filter(byTaxonId).length;

    if (!isLastSampleDeleted && !sample.isPreciseSingleSpeciesSurvey()) return;

    if (isLastSampleDeleted) {
      const survey = sample.getSurvey();

      const zeroAbundace = 't';
      const newSubSample = survey.smp.create(
        Sample,
        Occurrence,
        taxon,
        zeroAbundace
      );
      sample.samples.push(newSubSample);
      sample.save();
    }
  };

  const navigateToOccurrence = (smp: Sample) => {
    const { url } = match;
    const occ = smp.occurrences[0];

    navigate(`${url}/samples/${smp.cid}/occ/${occ.cid}`);
  };

  const cloneSubSample = async (copiedSubSample: Sample, ref: any) => {
    // eslint-disable-next-line no-param-reassign
    sample.copyAttributes = {}; // clean previous copy
    sample.save();

    // eslint-disable-next-line no-param-reassign
    sample.copyAttributes = toJS(copiedSubSample.occurrences[0].attrs);

    const taxon = { ...copiedSubSample.occurrences[0].attrs.taxon };

    const survey = sample.getSurvey();
    const newSubSample = survey.smp.create(Sample, Occurrence, taxon);
    // eslint-disable-next-line no-param-reassign
    (sample.copyAttributes as any).timeOfSighting = new Date().toISOString();

    newSubSample.occurrences[0].attrs = observable(sample.copyAttributes);

    sample.samples.push(newSubSample);
    newSubSample.startGPS();
    sample.save();

    await ref.current.closeOpened();
    toast.success('Copied!', { color: 'tertiary' });
  };

  const isDisabled = !!sample.metadata.synced_on;

  const { areaSurveyListSortedByTime } = appModel.attrs;
  const isTraining = !!sample.metadata.training;
  const isEditing = sample.metadata.saved;

  const previousSurvey = getPreviousSurvey();

  const isValid = !sample.validateRemote();

  return (
    <Page id="precise-area-count-edit">
      <Header
        survey={sample.getSurvey()}
        onSubmit={onSubmit}
        isTraining={isTraining}
        isEditing={isEditing}
        isDisabled={isDisabled}
        isValid={isValid}
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
        deleteSingleSample={deleteSingleSample}
        navigateToOccurrence={navigateToOccurrence}
        cloneSubSample={cloneSubSample}
      />
    </Page>
  );
};

export default observer(HomeController);
