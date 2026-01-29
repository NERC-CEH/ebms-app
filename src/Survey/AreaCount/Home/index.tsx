import { useContext, useEffect, useState } from 'react';
import { toJS, observable } from 'mobx';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Page,
  useAlert,
  useToast,
  useSample,
  useRemoteSample,
  Checkbox,
  CheckboxOption,
} from '@flumens';
import { NavContext } from '@ionic/react';
import distance from '@turf/distance';
import groups, { SpeciesGroup } from 'common/data/groups';
import appModel from 'models/app';
import samplesCollection from 'models/collections/samples';
import Occurrence, { Taxon, doesShallowTaxonMatch } from 'models/occurrence';
import Sample, { AreaCountLocation, useValidateCheck } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import { useDeleteConfirmation } from '../Occurrence/Species';
import Header from './Header';
import Main from './Main';

const METERS_THRESHOLD = 200;

const DUMMY_ARRAY_OF_FIVE = [1, 2, 3, 4, 5];

type SpeciesGroupWithDisabled = SpeciesGroup & { disabled: boolean };

const getSpeciesGroupList = (sample: Sample): SpeciesGroupWithDisabled[] => {
  // get unique species groups from sample occurrences
  const groupIds: number[] = [];
  sample.samples.forEach(smp => {
    const spGroupValue = Object.values(groups).find(
      group =>
        group.id === smp.occurrences[0].data.taxon.group ||
        group.listId === smp.occurrences[0].data.taxon.group // for backward compatibility, some old samples might have listId stored
    )?.id;
    if (!spGroupValue) return;

    groupIds.push(spGroupValue);
  });

  const uniqueGroupIds = Array.from(new Set(groupIds));

  const addDisableProperty = (value: SpeciesGroup) => ({
    ...value,
    disabled: uniqueGroupIds.includes(value.id),
  });

  const existingSpeciesGroupsInSample = (group: SpeciesGroup) => {
    const speciesGroups = sample.data?.speciesGroups?.length
      ? sample.data?.speciesGroups
      : appModel.data.speciesGroups;

    const isUniqueGroup = uniqueGroupIds.includes(group.id);
    const isDuplicate = speciesGroups.includes(group.id);
    if (isUniqueGroup && !isDuplicate) return true;

    return speciesGroups.includes(group.id);
  };

  const byDisabledProperty = (
    groupA: SpeciesGroupWithDisabled,
    groupB: SpeciesGroupWithDisabled
  ) => {
    if (!!groupB?.disabled < !!groupA?.disabled) return -1;
    if (!!groupB?.disabled > !!groupA?.disabled) return 1;
    return 0;
  };

  return Object.values(groups)
    .filter(existingSpeciesGroupsInSample)
    .map(addDisableProperty)
    .sort(byDisabledProperty);
};

const useDeleteSpeciesPrompt = () => {
  const alert = useAlert();
  const { t } = useTranslation();

  function showDeleteSpeciesPrompt(taxon: any) {
    const prompt = (resolve: any) => {
      const name = taxon.scientific_name;
      alert({
        header: t('Delete'),
        skipTranslation: true,
        message: t('Are you sure you want to delete {{taxon}} ?', {
          taxon: name,
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

/* eslint-disable no-param-reassign */
function toggleTimer(sample: Sample) {
  if (sample.isTimerFinished()) return;

  if (sample.timerPausedTime.time) {
    const pausedTime =
      Date.now() - new Date(sample.timerPausedTime.time).getTime();
    sample.metadata.pausedTime! += pausedTime;
    sample.timerPausedTime.time = null;
    sample.save();
    return;
  }
  sample.timerPausedTime.time = new Date();
}
/* eslint-enable no-param-reassign */

function byCreateTime(model1: Sample, model2: Sample) {
  const date1 = new Date(model1.createdAt);
  const date2 = new Date(model2.createdAt);
  return date2.getTime() - date1.getTime();
}

function useShowSpeciesGroupList(sample?: Sample) {
  const alert = useAlert();

  const showSpeciesGroupList = (speciesGroups: SpeciesGroupWithDisabled[]) => {
    if (!sample) return;

    const groupList = speciesGroups.map(g => `${g.id}`);

    // eslint-disable-next-line consistent-return
    return new Promise<null | number[]>(resolve => {
      const options: CheckboxOption[] = speciesGroups.map(
        ({ id, prefix, label, disabled }) => ({
          value: `${id}`,
          prefix,
          label,
          isDisabled: disabled,
        })
      );

      alert({
        header: 'Which species groups have you counted?',
        cssClass: 'speciesGroupAlert',
        message: (
          <Checkbox
            className="px-3"
            onChange={(newValue: any) =>
              groupList.splice(0, groupList.length, ...newValue)
            }
            options={options}
            defaultValue={groupList}
          />
        ),

        buttons: [
          { text: 'Cancel', role: 'cancel', handler: resolve },
          {
            text: 'Confirm',
            handler: () => resolve(groupList.map(g => Number.parseInt(g, 10))),
          },
        ],
      });
    });
  };

  return showSpeciesGroupList;
}

const HomeController = () => {
  const { t } = useTranslation();

  const { navigate } = useContext(NavContext);
  const match = useRouteMatch<any>();
  const showDeleteSpeciesPrompt = useDeleteSpeciesPrompt();
  const toast = useToast();

  const [hasLongSections, setHasLongSections] = useState(false);

  let { sample } = useSample<Sample>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const promptSpeciesGroupList = useShowSpeciesGroupList(sample);

  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();
  const confirmDelete = useDeleteConfirmation();

  const calculateIfHasLongSections = () => {
    if (!sample) return;

    if (!(sample.data.location as AreaCountLocation)?.shape?.coordinates.length)
      return;
    if (!sample.metadata.saved) return;

    const shapeCoords = [...(sample.data.location as any).shape.coordinates];

    for (let index = 1; index < shapeCoords.length; index++) {
      const coords = shapeCoords[index];

      const previousPoint: any = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: shapeCoords[index - 1],
        },
      };

      const currentPoint: any = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
      };

      const sectionDistance = Number(
        distance(previousPoint, currentPoint, {
          units: 'meters',
        }).toFixed(2)
      );

      if (sectionDistance > METERS_THRESHOLD) {
        setHasLongSections(true);
        return;
      }
    }

    setHasLongSections(false);
  };

  useEffect(calculateIfHasLongSections, [
    (sample?.data.location as AreaCountLocation)?.shape?.coordinates,
  ]);

  if (!sample) return null;

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

    const checkSpeciesGroups = !sample.isPreciseSingleSpeciesSurvey();
    if (checkSpeciesGroups) {
      const speciesGroups = getSpeciesGroupList(sample);
      sample.data.speciesGroups = speciesGroups.map(({ id }) => id); // doing it here because if disabled prompt won't run
      sample.save();

      const showSpeciesGroupPrompt =
        speciesGroups.length > 1 &&
        !speciesGroups.every(({ disabled }) => disabled);
      if (showSpeciesGroupPrompt) {
        const newGroups = await promptSpeciesGroupList(speciesGroups);
        if (!newGroups) return;

        sample.data.speciesGroups = newGroups;
        sample.save();
      }
    }

    appModel.setLocation(sample.data.location);

    await appModel.save();
    sample.metadata.saved = true;
    sample.data.surveyEndTime = new Date().toISOString();

    sample.cleanUp();
    sample.save();
    navigate('/home/user-surveys', 'root');
  };

  const onSubmit = async () => {
    if (!sample.metadata.saved) {
      await processDraft();
      return;
    }

    await processSubmission();
  };

  const navigateToSpeciesOccurrences = (taxon: any) => {
    const { warehouse_id: warehouseId, preferredId } = taxon;
    const taxonId = preferredId || warehouseId;

    navigate(`${match.url}/speciesOccurrences/${taxonId}`);
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

  const getPreviousSurvey = () => {
    const sortedSavedSamples = [...samplesCollection]
      .sort(byCreateTime)
      .reverse();
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
      s.occurrences[0].data.taxon.preferredId ||
      s.occurrences[0].data.taxon.warehouse_id;
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

    const getTaxon = (s: Sample) => toJS(s.occurrences[0].data.taxon);
    const newSpeciesList = previousSurvey.samples
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
        t('You have successfully copied {{speciesCount}} species.', {
          speciesCount: newSpeciesList.length,
        })
      );
    }
  };

  const deleteFromShallowList = (taxon: any) => {
    const withSamePreferredIdOrWarehouseId = (shallowEntry: Taxon) =>
      doesShallowTaxonMatch(shallowEntry, taxon);

    const taxonIndexInShallowList = sample.shallowSpeciesList.findIndex(
      withSamePreferredIdOrWarehouseId
    );

    const isNotInShallowList = taxonIndexInShallowList === -1;
    if (isNotInShallowList) return;

    sample.shallowSpeciesList.splice(taxonIndexInShallowList, 1);
  };

  const deleteSpecies = (taxon: any, isShallow: boolean) => {
    if (isShallow) {
      deleteFromShallowList(taxon);
      return;
    }

    const destroyWrap = () => {
      const matchingTaxon = (smp: Sample) => {
        const [occ] = smp.occurrences;

        return occ.doesTaxonMatch(taxon);
      };
      const subSamplesMatchingTaxon = sample.samples.filter(matchingTaxon);

      const destroy = (s: Sample) => {
        deleteFromShallowList(taxon);
        s.destroy();
      };

      subSamplesMatchingTaxon.forEach(destroy);
    };

    showDeleteSpeciesPrompt(taxon).then(destroyWrap);
  };

  const increaseCount = (taxon: any, _: boolean, is5x: boolean) => {
    if (sample.isSurveyPreciseSingleSpecies() && sample.hasZeroAbundance()) {
      sample.samples[0].occurrences[0].data.zero_abundance = null;
      sample.samples[0].startGPS();
      sample.save();
      return;
    }

    if (sample.isDisabled) return;

    const survey = sample.getSurvey();

    const addOneCount = () => {
      const newSubSample = survey.smp!.create!({ Sample, Occurrence, taxon });
      sample.samples.push(newSubSample);
      newSubSample.startGPS();
    };

    if (is5x) {
      DUMMY_ARRAY_OF_FIVE.forEach(addOneCount);
    } else {
      addOneCount();
    }

    sample.save();
  };

  const deleteSingleSample = async (smp: Sample) => {
    const shouldDelete = await confirmDelete();
    if (!shouldDelete) return;

    const taxon = { ...smp.occurrences[0].data.taxon };
    await smp.destroy();

    const byTaxonId = (s: Sample) =>
      s.occurrences[0].data.taxon.preferredId === taxon.preferredId ||
      s.occurrences[0].data.taxon.warehouse_id === taxon.warehouse_id;

    const isLastSampleDeleted = ![...sample.samples].filter(byTaxonId).length;

    if (!isLastSampleDeleted && !sample.isPreciseSingleSpeciesSurvey()) return;

    if (isLastSampleDeleted) {
      const survey = sample.getSurvey();

      const newSubSample = survey.smp!.create!({
        Sample,
        Occurrence,
        taxon,
        zeroAbundance: 't',
      });
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
    sample.copyAttributes = {}; // clean previous copy
    sample.save();

    sample.copyAttributes = toJS(copiedSubSample.occurrences[0].data);

    const taxon = { ...copiedSubSample.occurrences[0].data.taxon };

    const survey = sample.getSurvey();
    const newSubSample = survey.smp!.create!({ Sample, Occurrence, taxon });

    (sample.copyAttributes as any).timeOfSighting = new Date().toISOString();

    newSubSample.occurrences[0].data = observable(sample.copyAttributes) as any;

    sample.samples.push(newSubSample);
    newSubSample.startGPS();
    sample.save();

    await ref.current.closeOpened();
    toast.success('Copied!', { color: 'tertiary' });
  };

  const isDisabled = !!sample.syncedAt;

  const { areaSurveyListSortedByTime } = appModel.data;

  const previousSurvey = getPreviousSurvey();

  const navigateToGroup = () =>
    !isDisabled && navigate(`${match.url}/details/group`);

  return (
    <Page id="precise-area-count-edit">
      <Header
        sample={sample}
        onSubmit={onSubmit}
        onGroupClick={navigateToGroup}
      />
      <Main
        sample={sample}
        previousSurvey={previousSurvey}
        deleteSpecies={deleteSpecies}
        increaseCount={increaseCount}
        toggleTimer={toggleTimer}
        hasLongSections={hasLongSections}
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
