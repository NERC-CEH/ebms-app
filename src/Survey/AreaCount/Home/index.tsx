import {
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import { toJS, observable } from 'mobx';
import { observer } from 'mobx-react';
import type { Feature, Point } from 'geojson';
import { useTranslation } from 'react-i18next';
import { useLocation, useRouteMatch } from 'react-router';
import {
  Page,
  useAlert,
  useToast,
  useSample,
  useRemoteSample,
  Checkbox,
  CheckboxOption,
  useOnBackButton,
  timeFormat,
} from '@flumens';
import { NavContext } from '@ionic/react';
import distance from '@turf/distance';
import speciesGroups, { SpeciesGroup } from 'common/data/groups';
import locations from 'common/models/collections/locations';
import appModel from 'models/app';
import samplesCollection from 'models/collections/samples';
import {
  Taxon,
  doesShallowTaxonMatch,
  type Data as OccurrenceData,
} from 'models/occurrence';
import Sample, { useValidateCheck } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import { abundanceAttr } from 'Survey/AreaCount/config';
import useExitConfirmation from 'Survey/common/useExitConfirmation';
import { useDeleteConfirmation } from '../Occurrence/Species';
import Header from './Header';
import Main from './Main';

const METERS_THRESHOLD = 200;

const SESSION_STARTED_AT = Date.now();
const promptedCounts = new WeakSet<Sample>();

const DUMMY_ARRAY_OF_FIVE = [1, 2, 3, 4, 5];

type SpeciesGroupWithDisabled = SpeciesGroup & { disabled: boolean };

const getSpeciesGroupList = (sample: Sample): SpeciesGroupWithDisabled[] => {
  // get unique species groups from sample occurrences
  const groupIds: number[] = [];
  sample.samples.forEach(smp => {
    const taxonGroupId = smp.occurrences[0]?.data.taxon?.taxonGroupId;
    const spGroupValue = Object.values(speciesGroups).find(
      group => group.id === taxonGroupId || group.listId === taxonGroupId // for backward compatibility, some old samples might have listId stored
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
    const spGroups = sample.data?.speciesGroups?.length
      ? sample.data?.speciesGroups
      : appModel.data.speciesGroups;

    const isUniqueGroup = uniqueGroupIds.includes(group.id);
    const isDuplicate = spGroups.includes(group.id);
    if (isUniqueGroup && !isDuplicate) return true;

    return spGroups.includes(group.id);
  };

  const byDisabledProperty = (
    groupA: SpeciesGroupWithDisabled,
    groupB: SpeciesGroupWithDisabled
  ) => {
    if (!!groupB?.disabled < !!groupA?.disabled) return -1;
    if (!!groupB?.disabled > !!groupA?.disabled) return 1;
    return 0;
  };

  return Object.values(speciesGroups)
    .filter(existingSpeciesGroupsInSample)
    .map(addDisableProperty)
    .sort(byDisabledProperty);
};

const useDeleteSpeciesPrompt = () => {
  const alert = useAlert();
  const { t } = useTranslation();

  function showDeleteSpeciesPrompt(taxon: Taxon) {
    const prompt = (resolve: (confirmed: boolean) => void) => {
      const name = taxon.scientificName;
      alert({
        header: t('common.delete'),
        skipTranslation: true,
        message: t('common.confirmDeleteTaxon', {
          taxon: name,
        }),
        buttons: [
          {
            text: t('common.cancel'),
            role: 'cancel',
          },
          {
            text: t('common.delete'),
            role: 'destructive',
            handler: () => resolve(true),
          },
        ],
      });
    };

    return new Promise<boolean>(prompt);
  }

  return showDeleteSpeciesPrompt;
};

function toggleTimer(sample: Sample) {
  if (sample.isTimerFinished()) return;

  if (sample.timerPausedTime.time) {
    const pausedTime =
      Date.now() - new Date(sample.timerPausedTime.time).getTime();
    sample.metadata.pausedTime! += pausedTime;
    sample.timerPausedTime.time = null;
    delete sample.metadata.timerPausedAt;
    sample.notifications.start();
    sample.save();
    return;
  }

  sample.timerPausedTime.time = new Date();
  sample.metadata.timerPausedAt = sample.timerPausedTime.time.toISOString();
  sample.notifications.stop();
  sample.save();
}

function byCreateTime(model1: Sample, model2: Sample) {
  const date1 = new Date(model1.createdAt);
  const date2 = new Date(model2.createdAt);
  return date2.getTime() - date1.getTime();
}

function useShowSpeciesGroupList(sample?: Sample) {
  const alert = useAlert();

  const showSpeciesGroupList = (spGroups: SpeciesGroupWithDisabled[]) => {
    if (!sample) return;

    const groupList = spGroups.map(g => `${g.id}`);

    // eslint-disable-next-line consistent-return
    return new Promise<null | number[]>(resolve => {
      const options: CheckboxOption[] = spGroups.map(
        ({ id, prefix, label, disabled }) => ({
          value: `${id}`,
          prefix,
          label,
          isDisabled: disabled,
        })
      );

      alert({
        header: 'area.whichSpeciesGroups',
        cssClass: 'speciesGroupAlert',
        message: (
          <Checkbox
            className="px-3"
            onChange={(newValue: string[]) =>
              groupList.splice(0, groupList.length, ...newValue)
            }
            options={options}
            defaultValue={groupList}
          />
        ),

        buttons: [
          { text: 'common.cancel', role: 'cancel', handler: resolve },
          {
            text: 'common.confirm',
            handler: () => resolve(groupList.map(g => Number.parseInt(g, 10))),
          },
        ],
      });
    });
  };

  return showSpeciesGroupList;
}

function useNewSurveyPrompt(sample?: Sample) {
  const alert = useAlert();

  const newSurveyPrompt = (onContinue: () => Promise<void>) => {
    if (!sample || !appModel.data.showContinueSurveyPrompt) return;

    if (
      sample.isDisabled ||
      sample.metadata.saved ||
      promptedCounts.has(sample) ||
      sample.getTimerEndTime() < SESSION_STARTED_AT || // Restored counts that expired before this app session must not prompt.
      !sample.isTimerFinished() ||
      sample.validateRemote()
    )
      return;

    promptedCounts.add(sample);

    alert({
      header: 'area.timeSUp',
      backdropDismiss: false,
      message: 'area.continueSurvey',
      buttons: [
        { text: 'common.cancel', role: 'cancel' },
        { text: 'area.startSurvey', handler: onContinue },
      ],
    });
  };

  return newSurveyPrompt;
}

const HomeController = () => {
  const { t } = useTranslation();

  const { navigate, goBack } = useContext(NavContext);
  const match = useRouteMatch();
  const { pathname } = useLocation();
  const showDeleteSpeciesPrompt = useDeleteSpeciesPrompt();
  const toast = useToast();

  const [hasLongSections, setHasLongSections] = useState(false);

  let { sample } = useSample<Sample>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const newSurveyPrompt = useNewSurveyPrompt(sample);

  const site = sample && locations.idMap.get(sample.data.locationId!);

  const promptSpeciesGroupList = useShowSpeciesGroupList(sample);

  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();
  const confirmDelete = useDeleteConfirmation();
  const confirmExit = useExitConfirmation();

  const onExit = async (setIsLeaving?: Dispatch<SetStateAction<boolean>>) => {
    if (!sample?.isTimerFinished() && !sample?.isDisabled) {
      const shouldExit = await confirmExit();
      if (!shouldExit) {
        setIsLeaving?.(false);
        return;
      }
    }
    goBack();
  };

  useOnBackButton(onExit);

  const processDraft = async (continueSurvey = false) => {
    if (!sample) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    const checkSpeciesGroups = !sample.isSingleSpeciesSurvey();
    if (checkSpeciesGroups) {
      const newSpeciesGroups = getSpeciesGroupList(sample);
      sample.data.speciesGroups = newSpeciesGroups.map(({ id }) => id); // doing it here because if disabled prompt won't run
      sample.save();

      const showSpeciesGroupPrompt =
        newSpeciesGroups.length > 1 &&
        !newSpeciesGroups.every(({ disabled }) => disabled);
      if (showSpeciesGroupPrompt) {
        const newGroups = await promptSpeciesGroupList(newSpeciesGroups);
        if (!newGroups) return;

        sample.data.speciesGroups = newGroups;
        sample.save();
      }
    }

    const survey = sample.getSurvey();
    appModel.data[`draftId:${survey.name}`] = '';
    sample.metadata.saved = true;

    // in case the automatic survey end time hasn't been set after the timeout
    if (!sample.data.surveyEndTime)
      sample.data.surveyEndTime = timeFormat.format(new Date());

    sample.cleanUp();
    await sample.save();
    await appModel.save();

    if (continueSurvey) {
      navigate(`/survey/${survey.name}`, 'root', 'replace');
      return;
    }

    navigate('/home/user-surveys', 'root');
  };

  const newSurveyPromptTimer = () => {
    const timerEndTime = sample?.getTimerEndTime();
    const isTimerPaused = sample?.isTimerPaused();
    if (
      !Number.isFinite(timerEndTime) ||
      isTimerPaused ||
      pathname !== match.url
    )
      return undefined;

    // isTimerFinished uses a strict comparison, so check just after expiry.
    const delay = Math.max(0, timerEndTime! - Date.now() + 100);
    const timeout = setTimeout(
      () => newSurveyPrompt(() => processDraft(true)),
      delay
    );

    return () => clearTimeout(timeout);
  };

  useEffect(newSurveyPromptTimer, [pathname, match.url, newSurveyPrompt]);

  const calculateIfHasLongSections = () => {
    if (!sample) return;

    const shape = sample.data.location?.shape;
    if (shape?.type !== 'LineString' || !shape.coordinates.length) return;
    if (!sample.metadata.saved) return;

    const shapeCoords = [...shape.coordinates];

    for (let index = 1; index < shapeCoords.length; index++) {
      const coords = shapeCoords[index];

      const previousPoint: Feature<Point> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: shapeCoords[index - 1],
        },
      };

      const currentPoint: Feature<Point> = {
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
    sample?.data.location?.shape?.coordinates,
  ]);

  if (!sample) return null;

  const isLocationLocked = () =>
    sample.locks.isLocked('all', 'smp', 'location');

  const processSubmission = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);

    navigate('/home/user-surveys', 'root');
  };

  const onSubmit = async () => {
    if (!sample.metadata.saved) {
      await processDraft();
      return;
    }

    await processSubmission();
  };

  const navigateToSpeciesOccurrences = (taxon: Taxon) => {
    const { warehouseId, preferredId } = taxon;
    const taxonId = preferredId || warehouseId;

    navigate(`${match.url}/speciesOccurrences/${taxonId}`);
  };

  const toggleSpeciesSort = () => {
    toast.success(appModel.cycleSpeciesListSortOrder(), {
      color: 'light',
      position: 'bottom',
      duration: 1000,
    });
  };

  const getPreviousSurvey = () => {
    const sortedSavedSamples = [...samplesCollection]
      .sort(byCreateTime)
      .filter(smp => smp.isStored) // don't need remote since can be incomplete
      .reverse();
    const matchingSampleId = (s: Sample) => s.cid === sample.cid;

    const currentSampleIndex = sortedSavedSamples.findIndex(matchingSampleId);

    const isFirstSurvey = !currentSampleIndex;
    if (isFirstSurvey) return undefined;

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
      toast.warn('common.sorryNoPrevious');
      return;
    }

    const getSpeciesId = (s: Sample) =>
      s.occurrences[0].data.taxon.preferredId ||
      s.occurrences[0].data.taxon.warehouseId;
    const existingSpeciesIds = sample.samples.map(getSpeciesId);

    const uniqueSpeciesIds = new Set<number>();
    const getNewSpeciesOnly = ({ warehouseId, preferredId }: Taxon) => {
      const speciesID = preferredId || warehouseId;

      if (uniqueSpeciesIds.has(speciesID)) return false;
      uniqueSpeciesIds.add(speciesID);
      return !existingSpeciesIds.includes(speciesID);
    };

    const getTaxon = (s: Sample) => toJS(s.occurrences[0].data.taxon);
    const newSpeciesList = previousSurvey.samples
      .map(getTaxon)
      .filter(getNewSpeciesOnly);

    // copy but retain old observable ref
    sample.shallowSpeciesList.splice(
      0,
      sample.shallowSpeciesList.length,
      ...newSpeciesList
    );

    const speciesNameSort = (sp1: Taxon, sp2: Taxon) =>
      (sp1[sp1.foundInName!] || '').localeCompare(sp2[sp2.foundInName!] || '');

    sample.shallowSpeciesList.sort(speciesNameSort);

    if (!newSpeciesList.length) {
      toast.warn('common.sorryNoSpecies');
    } else {
      toast.success(
        t('common.haveSuccessfullyCopied', {
          speciesCount: newSpeciesList.length,
        })
      );
    }
  };

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

  const deleteSpecies = (taxon: Taxon, isShallow: boolean) => {
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

  const increaseCount = (
    taxon: Taxon,
    _isShallow?: boolean,
    is5x?: boolean
  ) => {
    if (sample.isSurveyPreciseSingleSpecies() && sample.hasZeroAbundance()) {
      const [occ] = sample.samples[0].occurrences;
      occ.data.zeroAbundance = false;
      occ.data[abundanceAttr.id] = is5x ? DUMMY_ARRAY_OF_FIVE.length : 1;

      // update the timestamp to when the first observation is actually recorded,
      // not when the species was selected at the start of the count
      occ.data.timeOfSighting = new Date().toISOString();

      if (!sample.isTimerFinished()) sample.samples[0].gps.start();

      sample.save();
      return;
    }

    if (sample.isDisabled) return;

    const survey = sample.getSurvey();

    const addOneCount = () => {
      const newSubSample = survey.smp!.create!({ taxon, parent: sample });
      sample.samples.push(newSubSample);

      if (!sample.isTimerFinished() && !isLocationLocked())
        newSubSample.gps.start();
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
      s.occurrences[0].data.taxon.warehouseId === taxon.warehouseId;

    const isLastSampleDeleted = ![...sample.samples].filter(byTaxonId).length;

    if (!isLastSampleDeleted && !sample.isSingleSpeciesSurvey()) return;

    if (isLastSampleDeleted) {
      const survey = sample.getSurvey();

      const newSubSample = survey.smp!.create!({
        taxon,
        zeroAbundance: true,
        parent: sample,
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

  const cloneSubSample = async (
    copiedSubSample: Sample,
    ref?: RefObject<HTMLIonItemSlidingElement | null>
  ) => {
    sample.copyAttributes = {}; // clean previous copy
    sample.save();

    sample.copyAttributes = toJS(copiedSubSample.occurrences[0].data);

    const taxon = { ...copiedSubSample.occurrences[0].data.taxon };

    const survey = sample.getSurvey();
    const newSubSample = survey.smp!.create!({ taxon, parent: sample });

    sample.copyAttributes.timeOfSighting = new Date().toISOString();

    newSubSample.occurrences[0].data = observable(
      sample.copyAttributes
    ) as OccurrenceData;

    sample.samples.push(newSubSample);
    if (!isLocationLocked()) newSubSample.gps.start();
    sample.save();

    await ref?.current?.closeOpened();
    toast.success('area.copied', { color: 'tertiary' });
  };

  const isDisabled = !!sample.syncedAt;

  const { speciesListSortOrder } = appModel.data;

  const previousSurvey = getPreviousSurvey();

  const navigateToGroup = () => navigate(`${match.url}/details/group`);

  return (
    <Page id="precise-area-count-edit">
      <Header
        sample={sample}
        onSubmit={onSubmit}
        onGroupClick={navigateToGroup}
        isDisabled={isDisabled}
        onLeave={!sample.isTimerFinished() ? onExit : undefined}
      />
      <Main
        sample={sample}
        site={site}
        previousSurvey={previousSurvey}
        deleteSpecies={deleteSpecies}
        increaseCount={increaseCount}
        toggleTimer={toggleTimer}
        hasLongSections={hasLongSections}
        navigateToSpeciesOccurrences={navigateToSpeciesOccurrences}
        speciesListSortOrder={speciesListSortOrder}
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
