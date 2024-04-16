import { useContext, useRef } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import {
  mapOutline,
  timeOutline,
  pauseOutline,
  playOutline,
  clipboardOutline,
  filterOutline,
  warningOutline,
  flagOutline,
  copyOutline,
  addCircleOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import {
  Main,
  MenuAttrItem,
  useAlert,
  InfoMessage,
  Button,
  Badge,
} from '@flumens';
import {
  IonList,
  IonItem,
  IonItemSliding,
  IonButton,
  IonIcon,
  IonLabel,
  IonItemOptions,
  IonItemOption,
  NavContext,
  IonSpinner,
} from '@ionic/react';
import GridRef from 'common/Components/GridRefValue';
import appModel from 'models/app';
import { Taxon } from 'models/occurrence';
import Sample, { AreaCountLocation } from 'models/sample';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import PaintedLadyBehaviour from 'Survey/AreaCount/common/Components/PaintedLadyBehaviour';
import PaintedLadyDirection from 'Survey/AreaCount/common/Components/PaintedLadyDirection';
import PaintedLadyOther from 'Survey/AreaCount/common/Components/PaintedLadyOther';
import PaintedLadyWing from 'Survey/AreaCount/common/Components/PaintedLadyWing';
import IncrementalButton from 'Survey/common/IncrementalButton';
import UploadedRecordInfoMessage from 'Survey/common/UploadedRecordInfoMessage';
import {
  speciesOccAddedTimeSort,
  speciesNameSort,
  speciesCount,
} from 'Survey/common/taxonSortFunctions';
import CountdownClock from '../components/CountdownClock';
import './styles.scss';

const OCCURRENCE_THRESHOLD = 2;

const showCopyTip = (alert: any) => {
  if (!appModel.attrs.showCopyHelpTip) return;

  alert({
    header: 'Tip: Copy attributes',
    cssClass: 'copy-attributes-alert',
    message: (
      <T>
        To copy a list entry swipe it to the right and press
        <div className="alert-icon-wrapper">
          <IonIcon color="light" icon={copyOutline} />
        </div>
        icon.
      </T>
    ),
    buttons: [
      {
        text: 'OK, got it',
        role: 'cancel',
        cssClass: 'primary',
      },
    ],
  });
  // eslint-disable-next-line no-param-reassign
  appModel.attrs.showCopyHelpTip = false;
  appModel.save();
};

const byTime = (sp1: Sample, sp2: Sample) => {
  const date1 = new Date(sp1.metadata.createdOn);
  const date2 = new Date(sp2.metadata.createdOn);
  return date2.getTime() - date1.getTime();
};

const getDefaultTaxonCount = (taxon: any, createdOn?: any) => {
  return {
    count: 0,
    taxon,
    createdOn,
  };
};

const buildSpeciesCount = (agg: any, smp: Sample) => {
  const taxon = toJS(smp.occurrences[0]?.attrs.taxon);
  if (!taxon) return agg;

  const id = taxon.preferredId || taxon.warehouse_id;

  const createdOn = new Date(smp.metadata.createdOn).getTime();
  agg[id] = agg[id] || getDefaultTaxonCount(taxon, createdOn); // eslint-disable-line

  if (smp.isSurveyPreciseSingleSpecies() && smp.hasZeroAbundance()) {
    return agg;
  }

  agg[id].count++; // eslint-disable-line
  agg[id].isGeolocating = agg[id].isGeolocating || smp.isGPSRunning(); // eslint-disable-line
  // eslint-disable-next-line
  agg[id].hasLocationMissing =
    agg[id].hasLocationMissing || smp.hasLoctionMissingAndIsnotLocating(); // eslint-disable-line

  return agg;
};

type Props = {
  sample: Sample;
  previousSurvey: any;
  deleteSpecies: any;
  copyPreviousSurveyTaxonList: any;
  navigateToSpeciesOccurrences: any;
  onToggleSpeciesSort: any;
  toggleTimer: any;
  areaSurveyListSortedByTime: boolean;
  hasLongSections: boolean;
  increaseCount: any;
  navigateToOccurrence: (smp: Sample) => void;
  deleteSingleSample: (smp: Sample) => void;
  isDisabled?: boolean;
  cloneSubSample: (smp: Sample, ref?: any) => void;
};

const AreaCount = ({
  sample,
  previousSurvey,
  deleteSpecies,
  hasLongSections,
  navigateToSpeciesOccurrences,
  onToggleSpeciesSort,
  toggleTimer,
  areaSurveyListSortedByTime,
  increaseCount,
  isDisabled,
  copyPreviousSurveyTaxonList,
  navigateToOccurrence,
  deleteSingleSample,
  cloneSubSample,
}: Props) => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch<any>();
  const alert = useAlert();
  const ref = useRef();

  const showCopyOptions = () => {
    alert({
      header: 'Copy species',
      message: 'Are you sure want to copy previous survey species list?',
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Copy',
          cssClass: 'danger',
          handler: copyPreviousSurveyTaxonList,
        },
      ],
    });
  };

  const getSpeciesAddButton = () => {
    if (isDisabled) return <div style={{ height: '44px' }} />;

    if (sample.isPreciseSingleSpeciesSurvey()) {
      const { taxon } = sample.samples[0]?.occurrences[0]?.attrs || {};

      if (!taxon) return null;

      const increaseCountWrap = () => {
        increaseCount(taxon);

        const hasMoreThanTwoSpecies =
          sample.samples.length > OCCURRENCE_THRESHOLD;
        if (hasMoreThanTwoSpecies) {
          showCopyTip(alert);
        }
      };

      const increase5xCountWrap = () => increaseCount(taxon, undefined, true);

      return (
        <Button
          color="primary"
          className="mx-auto mb-5 mt-10"
          onPress={increaseCountWrap}
          onLongPress={increase5xCountWrap}
        >
          Add
        </Button>
      );
    }

    const navigateToSearch = () => navigate(`${match.url}/taxon`);
    const showCopyOptionsWrap = () => {
      if (sample.metadata.saved || sample.isSurveyPreciseSingleSpecies())
        return;

      showCopyOptions();
    };

    return (
      <Button
        color="primary"
        className="mx-auto mb-5 mt-10"
        onPress={navigateToSearch}
        onLongPress={showCopyOptionsWrap}
        prefix={<IonIcon src={addCircleOutline} className="size-5" />}
      >
        Add species
      </Button>
    );
  };

  const getSpeciesEntry = ([id, species]: any) => {
    const isSpeciesDisabled = !species.count;
    const { taxon } = species;

    const speciesName = taxon[taxon.found_in_name];

    const isShallow = !species.count;
    const increaseCountWrap = () => increaseCount(taxon, isShallow);
    const increase5xCountWrap = () => increaseCount(taxon, isShallow, true);

    const navigateToSpeciesOccurrencesWrap = () =>
      !isSpeciesDisabled && navigateToSpeciesOccurrences(taxon);

    const deleteSpeciesWrap = () => deleteSpecies(taxon, isShallow);

    let location;
    if (species.hasLocationMissing) {
      location = <IonIcon icon={warningOutline} color="danger" />;
    } else if (species.isGeolocating) {
      location = <IonSpinner />;
    }

    const hasZeroAbundance =
      sample.isSurveyPreciseSingleSpecies() && sample.hasZeroAbundance();

    return (
      <IonItemSliding key={id}>
        <IonItem
          detail={!isSpeciesDisabled && !hasZeroAbundance}
          onClick={navigateToSpeciesOccurrencesWrap}
        >
          <IncrementalButton
            onClick={increaseCountWrap}
            onLongClick={increase5xCountWrap}
            value={species.count}
            disabled={isDisabled}
          />
          <IonLabel className="title">{speciesName}</IonLabel>
          <IonLabel slot="end" className="location-spinner">
            {location}
          </IonLabel>
        </IonItem>

        {!isDisabled && !sample.isPreciseSingleSpeciesSurvey() && (
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={deleteSpeciesWrap}>
              <T>Delete</T>
            </IonItemOption>
          </IonItemOptions>
        )}
      </IonItemSliding>
    );
  };

  const getSpeciesList = () => {
    if (sample.isPreciseSingleSpeciesSurvey()) return null;

    if (!sample.samples.length && !sample.shallowSpeciesList.length) {
      return (
        <IonList lines="full">
          <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
        </IonList>
      );
    }

    const speciesCounts = [...sample.samples].reduce(buildSpeciesCount, {});

    const getShallowEntry = (shallowEntry: Taxon) => {
      const shallowEntryId =
        shallowEntry.preferredId || shallowEntry.warehouse_id;

      if (speciesCounts[shallowEntryId]) {
        speciesCounts[shallowEntryId].createdOn = 0;
        return null;
      }

      return getDefaultTaxonCount(shallowEntry, 0);
    };

    const notEmpty = (shallowEntry: any) => shallowEntry;

    const shallowCounts = sample.shallowSpeciesList
      .map(getShallowEntry)
      .filter(notEmpty);

    const counts = {
      ...speciesCounts,
      ...shallowCounts,
    };

    let sort = areaSurveyListSortedByTime
      ? speciesOccAddedTimeSort
      : speciesNameSort;

    if (isDisabled) {
      sort = speciesCount;
    }

    const speciesList = Object.entries(counts).sort(sort).map(getSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

    const allowSorting = !!count && !isDisabled;

    return (
      <>
        {allowSorting && (
          <div id="species-list-sort">
            <IonButton fill="clear" size="small" onClick={onToggleSpeciesSort}>
              <IonIcon icon={filterOutline} mode="md" />
            </IonButton>
          </div>
        )}

        <IonList id="list" lines="full">
          <div className="rounded-list">
            <div className="list-divider gap-6">
              <div>
                <T>Count</T>
              </div>
              <div className="flex w-full justify-between">
                <div>
                  <T>Species</T>
                </div>
                <div>{count}</div>
              </div>
            </div>

            {speciesList}
          </div>
        </IonList>
      </>
    );
  };

  const getSpeciesSingleCountList = () => {
    if (!sample.isPreciseSingleSpeciesSurvey()) return null;

    const getOccurrence = (smp: Sample) => {
      const occ = smp.occurrences[0];
      const prettyTime = new Date(smp.metadata.createdOn)
        .toLocaleTimeString()
        .replace(/(:\d{2}| [AP]M)$/, '');

      const {
        stage,
        behaviour,
        wing,
        nectarSource,
        mating,
        eggLaying,
        direction,
        dragonflyStage,
      } = occ.attrs;

      let location;
      if (smp.hasLoctionMissingAndIsnotLocating()) {
        location = <IonIcon icon={warningOutline} color="danger" />;
      } else if (smp.isGPSRunning()) {
        location = <IonSpinner />;
      } else if (smp.attrs.location && !behaviour && !wing?.length) {
        location = <GridRef sample={smp} />;
      }

      const navigateToOccurrenceWithSample = () => navigateToOccurrence(smp);

      const deleteSubSample = () => deleteSingleSample(smp);

      const cloneSubSampleWrap = () => cloneSubSample(smp, ref);

      const speciesStage = stage || dragonflyStage;
      return (
        <IonItemSliding key={smp.cid} ref={ref as any}>
          <IonItemOptions side="start" className="copy-slider">
            <IonItemOption color="tertiary" onClick={cloneSubSampleWrap}>
              <IonIcon icon={copyOutline} />
            </IonItemOption>
          </IonItemOptions>

          <IonItem detail={false} onClick={navigateToOccurrenceWithSample}>
            <div className="flex w-full items-center justify-start gap-4 py-1 pl-4">
              <div className="shrink-0">{prettyTime}</div>
              <div className="flex w-full flex-wrap justify-start gap-x-3 gap-y-1 align-middle ">
                {speciesStage && <Badge>{speciesStage}</Badge>}
                <PaintedLadyWing wings={wing} />
                <PaintedLadyBehaviour behaviour={behaviour} />
                <PaintedLadyDirection direction={direction} />
                <PaintedLadyOther text={nectarSource || mating || eggLaying} />
              </div>
              {location && <div className="shrink-0">{location}</div>}
            </div>
          </IonItem>

          {!isDisabled && (
            <IonItemOptions side="end">
              <IonItemOption color="danger" onClick={deleteSubSample}>
                <T>Delete</T>
              </IonItemOption>
            </IonItemOptions>
          )}
        </IonItemSliding>
      );
    };

    const speciesList = [...sample.samples].sort(byTime).map(getOccurrence);
    const count = speciesList.length > 1 ? speciesList.length : null;
    if (!speciesList.length) return null;

    const prettySpeciesName = sample.samples[0].occurrences[0].getTaxonName();

    const hasZeroAbundance =
      sample.samples.length === 1 && sample.samples[0].hasZeroAbundance();
    if (hasZeroAbundance) {
      return (
        <Main id="area-count-occurrence-edit">
          <IonList id="list" lines="full">
            <InfoBackgroundMessage>
              You don't have any <b>{{ prettySpeciesName } as any}</b> records
              in your list.
            </InfoBackgroundMessage>
          </IonList>
        </Main>
      );
    }

    return (
      <IonList id="list" lines="full">
        <div className="rounded-list">
          <div className="list-divider">
            <div style={{ maxWidth: 'fit-content' }}>{prettySpeciesName}</div>
            <div slot="end">{count}</div>
          </div>

          {speciesList}
        </div>
      </IonList>
    );
  };

  const showAreaWarningNote = () => {
    if (sample.metadata.saved && !sample.isDisabled()) {
      return (
        <>
          <InfoMessage inline>
            Please check if the recording area is correct before sending the
            record.
          </InfoMessage>

          {hasLongSections && (
            <InfoMessage inline>
              We have noticed that your survey has <b>long sections</b>. Please
              make sure it is a correct <b>location</b>!
            </InfoMessage>
          )}
        </>
      );
    }

    return null;
  };

  const showCopySpeciesTip = () => {
    if (!appModel.attrs.showCopySpeciesTip || !previousSurvey) {
      return null;
    }

    const hasSpeciesInOccurrence = previousSurvey.occurrences.length;
    if (!hasSpeciesInOccurrence) {
      return null;
    }

    alert({
      header: 'Tip: Adding Species',
      message:
        'You can bulk copy your previous species lists by long-pressing the Add Species button.',
      buttons: [
        {
          text: 'OK, got it',
          role: 'cancel',
          cssClass: 'primary',
        },
      ],
    });

    appModel.attrs.showCopySpeciesTip = false;

    return null;
  };

  const toggleTimerWrap = () => toggleTimer(sample);

  const getTimerButton = () => {
    if (isDisabled) {
      return null;
    }

    const timerEndTime = sample.getTimerEndTime();
    const isTimerPaused = sample.isTimerPaused();
    const isTimerFinished = sample.isTimerFinished();

    let detailIcon = pauseOutline;
    if (isTimerPaused) {
      detailIcon = playOutline;
    } else if (isTimerFinished) {
      detailIcon = flagOutline;
    }

    return (
      <IonItem
        detail={!isDisabled}
        detailIcon={detailIcon}
        onClick={toggleTimerWrap}
        disabled={isDisabled}
      >
        <IonIcon icon={timeOutline} slot="start" mode="md" />
        <IonLabel>
          <T>Duration</T>
        </IonLabel>
        <CountdownClock isPaused={isTimerPaused} countdown={timerEndTime} />
      </IonItem>
    );
  };

  const { area } = (sample.attrs.location as AreaCountLocation) || {};
  let areaPretty: any = <IonIcon icon={warningOutline} color="danger" />;
  if (Number.isFinite(area) || sample.isGPSRunning()) {
    areaPretty = (
      <div className="flex flex-col overflow-hidden">
        <div>{area ? `${area} m²` : ''}</div>
        <div className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
          {sample.attrs.site?.name || sample.attrs.location?.name}
        </div>
      </div>
    );
  }

  return (
    <Main id="precise-area-count-edit">
      {isDisabled && <UploadedRecordInfoMessage sample={sample} />}

      <IonList lines="full">
        <h3 className="list-title">
          <T>Details</T>
        </h3>
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${match.url}/area`}
            icon={mapOutline}
            label="Area"
            value={areaPretty}
            skipValueTranslation
          />

          {showAreaWarningNote()}

          {showCopySpeciesTip()}

          {getTimerButton()}

          <MenuAttrItem
            routerLink={`${match.url}/details`}
            icon={clipboardOutline}
            label="Additional Details"
          />
        </div>

        {getSpeciesAddButton()}
      </IonList>

      {getSpeciesList()}

      {getSpeciesSingleCountList()}
    </Main>
  );
};

export default observer(AreaCount);
