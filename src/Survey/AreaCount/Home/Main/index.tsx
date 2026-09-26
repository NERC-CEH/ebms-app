import { useContext, useRef, type RefObject } from 'react';
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
  locateOutline,
  informationCircleOutline,
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
  timeFormat,
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
import GridRef from 'common/Components/PrettyLocation';
import { getSpeciesProfileImage } from 'common/data/profiles';
import Location from 'common/models/location';
import appModel, { SpeciesListSortOrder } from 'models/app';
import { Taxon } from 'models/occurrence';
import Sample from 'models/sample';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import PaintedLadyBehaviour from 'Survey/AreaCount/common/Components/PaintedLadyBehaviour';
import PaintedLadyDirection from 'Survey/AreaCount/common/Components/PaintedLadyDirection';
import PaintedLadyOther from 'Survey/AreaCount/common/Components/PaintedLadyOther';
import PaintedLadyWing from 'Survey/AreaCount/common/Components/PaintedLadyWing';
import { abundanceAttr, areaSizeAttr } from 'Survey/AreaCount/config';
import IncrementalButton from 'Survey/common/IncrementalButton';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import UploadedRecordInfoMessage from 'Survey/common/UploadedRecordInfoMessage';
import {
  speciesOccAddedTimeSort,
  speciesOccUpdatedTimeSort,
  speciesNameSort,
  speciesCount,
  getDefaultTaxonCount,
  SpeciesSummary,
} from 'Survey/common/taxonSortFunctions';
import getSurveyValueKey from 'Survey/common/translationKeys';
import CountdownClock from './CountdownClock';
import './styles.scss';

const OCCURRENCE_THRESHOLD = 2;

const showCopyTip = (alert: ReturnType<typeof useAlert>) => {
  if (!appModel.data.showCopyHelpTip) return;

  alert({
    header: 'area.tipCopyAttributes',
    cssClass: 'copy-attributes-alert',
    message: (
      <T i18nKey="area.copyListEntry">
        To copy a list entry swipe it to the right and press
        <div className="alert-icon-wrapper">
          <IonIcon color="light" icon={copyOutline} />
        </div>
        icon.
      </T>
    ),
    buttons: [
      {
        text: 'common.okGotIt',
        role: 'cancel',
        cssClass: 'primary',
      },
    ],
  });

  appModel.data.showCopyHelpTip = false;
  appModel.save();
};

const byTime = (sp1: Sample, sp2: Sample) => {
  const date1 = new Date(sp1.createdAt);
  const date2 = new Date(sp2.createdAt);
  return date2.getTime() - date1.getTime();
};

type SpeciesCounts = Record<number, SpeciesSummary>;

const buildSpeciesCount = (agg: SpeciesCounts, smp: Sample) => {
  const taxon = toJS(smp.occurrences[0]?.data.taxon);
  if (!taxon) return agg;

  const id = taxon.preferredId || taxon.warehouseId;

  if (!agg[id])
    agg[id] = getDefaultTaxonCount(taxon, smp.createdAt, smp.updatedAt);

  if ((agg[id].updatedAt || 0) < smp.updatedAt)
    agg[id].updatedAt = smp.updatedAt;

  agg[id].count += smp.occurrences[0].data[abundanceAttr.id] ?? 1;
  agg[id].isGeolocating = agg[id].isGeolocating || smp.gps.isRunning();

  agg[id].hasLocationMissing =
    agg[id].hasLocationMissing || smp.gps.hasNoLocationAndNotLocating();

  return agg;
};

type Props = {
  sample: Sample;
  site?: Location;
  previousSurvey?: Sample;
  deleteSpecies: (taxon: Taxon, isShallow: boolean) => void;
  copyPreviousSurveyTaxonList: () => void;
  navigateToSpeciesOccurrences: (taxon: Taxon) => void;
  onToggleSpeciesSort: () => void;
  toggleTimer: (sample: Sample) => void;
  speciesListSortOrder: SpeciesListSortOrder;
  hasLongSections: boolean;
  increaseCount: (taxon: Taxon, isShallow?: boolean, is5x?: boolean) => void;
  navigateToOccurrence: (smp: Sample) => void;
  deleteSingleSample: (smp: Sample) => void;
  isDisabled?: boolean;
  cloneSubSample: (
    smp: Sample,
    ref?: RefObject<HTMLIonItemSlidingElement | null>
  ) => void;
};

const AreaCount = ({
  sample,
  site,
  previousSurvey,
  deleteSpecies,
  hasLongSections,
  navigateToSpeciesOccurrences,
  onToggleSpeciesSort,
  toggleTimer,
  speciesListSortOrder,
  increaseCount,
  isDisabled,
  copyPreviousSurveyTaxonList,
  navigateToOccurrence,
  deleteSingleSample,
  cloneSubSample,
}: Props) => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const alert = useAlert();
  const ref = useRef<HTMLIonItemSlidingElement>(null);

  const showCopyOptions = () => {
    alert({
      header: 'common.copySpecies',
      message: 'common.sureWantCopy',
      buttons: [
        { text: 'common.cancel' },
        {
          text: 'common.copy',
          role: 'destructive',
          handler: copyPreviousSurveyTaxonList,
        },
      ],
    });
  };

  const getSpeciesAddButton = () => {
    if (isDisabled) return <div style={{ height: '44px' }} />;

    if (sample.isSingleSpeciesSurvey()) {
      const { taxon } = sample.samples[0]?.occurrences[0]?.data || {};

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
          common.add
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
        common.addSpecies
      </Button>
    );
  };

  const getSpeciesEntry = ([, species]: [string, SpeciesSummary]) => {
    const isSpeciesDisabled = !species.count || species.isDisabled;
    const { taxon } = species;

    const isShallow = !species.count;
    const increaseCountWrap = () => increaseCount(taxon, isShallow);
    const increase5xCountWrap = () => increaseCount(taxon, isShallow, true);

    const navigateToSpeciesOccurrencesWrap = () =>
      !isSpeciesDisabled && navigateToSpeciesOccurrences(taxon);

    const deleteSpeciesWrap = () => deleteSpecies(taxon, isShallow);

    let detailIcon;
    if (species.hasLocationMissing && !isDisabled) {
      detailIcon = warningOutline;
    } else if (species.isGeolocating) {
      detailIcon = locateOutline;
    }

    return (
      <IonItemSliding key={species.taxon.warehouseId}>
        <IonItem
          detail={!!detailIcon}
          detailIcon={detailIcon}
          onClick={navigateToSpeciesOccurrencesWrap}
          className={species.isGeolocating ? 'geolocating' : undefined}
        >
          <IncrementalButton
            onClick={increaseCountWrap}
            onLongClick={increase5xCountWrap}
            value={species.count}
            disabled={isDisabled}
          />
          <div className="min-h-11 my-1 ml-3 flex items-center gap-3 overflow-hidden">
            <div className="list-avatar border-neutral-200 border size-9!">
              {getSpeciesProfileImage(taxon)}
            </div>

            <TaxonPrettyName {...taxon} />
          </div>
        </IonItem>

        {!isDisabled && !sample.isSingleSpeciesSurvey() && (
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={deleteSpeciesWrap}>
              <T>common.delete</T>
            </IonItemOption>
          </IonItemOptions>
        )}
      </IonItemSliding>
    );
  };

  const getSpeciesList = () => {
    const hasNoSpecies =
      !sample.samples.length &&
      !sample.occurrences.length &&
      !sample.shallowSpeciesList.length;
    if (hasNoSpecies)
      return (
        <IonList lines="full">
          <InfoBackgroundMessage>common.noSpeciesAdded</InfoBackgroundMessage>
        </IonList>
      );

    const speciesCounts = [...sample.samples].reduce(buildSpeciesCount, {});

    const getShallowEntry = (shallowEntry: Taxon) => {
      const shallowEntryId =
        shallowEntry.preferredId || shallowEntry.warehouseId;

      if (speciesCounts[shallowEntryId]) {
        speciesCounts[shallowEntryId].createdAt = 0;
        return null;
      }

      return getDefaultTaxonCount(shallowEntry, 0);
    };

    const shallowCounts = sample.shallowSpeciesList
      .map(getShallowEntry)
      .filter(shallowEntry => !!shallowEntry);

    const counts = Object.assign(
      {} as Record<string, SpeciesSummary>,
      speciesCounts,
      shallowCounts
    );

    let sort = speciesNameSort;
    if (speciesListSortOrder === 'lastAdded') sort = speciesOccAddedTimeSort;
    if (speciesListSortOrder === 'lastEdited') sort = speciesOccUpdatedTimeSort;

    if (isDisabled) {
      sort = speciesCount;
    }

    const speciesList = Object.entries(counts).sort(sort).map(getSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

    const allowSorting = !!count && !isDisabled;

    // For remote-fetched records don't have sub-sample layer, only occurrences, so this is a temporary workaround.
    const occSpeciesList = sample.occurrences
      .flatMap(occ => {
        const { taxon } = occ.data;
        if (!taxon) return [];

        return [
          [
            occ.id,
            {
              ...getDefaultTaxonCount(taxon),
              count: 1,
              isDisabled: true,
            },
          ] as [string, SpeciesSummary],
        ];
      })
      .map(getSpeciesEntry);

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
                <T>common.count</T>
              </div>
              <div className="flex w-full justify-between">
                <div>
                  <T>common.species</T>
                </div>
                <div>{count}</div>
              </div>
            </div>

            {speciesList}
            {occSpeciesList}
          </div>
        </IonList>
      </>
    );
  };

  const getSingleSpeciesCountList = () => {
    // For remote-fetched records don't have sub-sample layer, only occurrences, so this is a temporary workaround.
    if (sample.occurrences.length)
      return (
        <div className="m-2 flex w-full justify-between rounded-md border-b-[0.5px] border-solid border-neutral-300 bg-white px-4 py-3">
          <div>{sample.occurrences[0].getPrettyName()}</div>
          {sample.occurrences.length}
        </div>
      );

    const getOccurrence = (smp: Sample) => {
      const occ = smp.occurrences[0];
      const prettyTime = new Date(occ.data.timeOfSighting!)
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
      } = occ.data;

      const count = occ.data[abundanceAttr.id];

      let location;
      if (smp.gps.hasNoLocationAndNotLocating()) {
        if (!isDisabled)
          location = <IonIcon icon={warningOutline} color="danger" />;
      } else if (smp.gps.isRunning()) {
        location = <IonSpinner />;
      } else if (smp.data.location && !behaviour && !wing?.length) {
        location = <GridRef sample={smp} />;
      }

      const navigateToOccurrenceWithSample = () => navigateToOccurrence(smp);

      const deleteSubSample = () => deleteSingleSample(smp);

      const cloneSubSampleWrap = () => cloneSubSample(smp, ref);

      const speciesStage = stage || dragonflyStage;

      return (
        <IonItemSliding key={occ.cid} ref={ref}>
          <IonItemOptions side="start" className="copy-slider">
            <IonItemOption color="tertiary" onClick={cloneSubSampleWrap}>
              <IonIcon icon={copyOutline} />
            </IonItemOption>
          </IonItemOptions>

          <IonItem detail={false} onClick={navigateToOccurrenceWithSample}>
            <div className="flex w-full items-center justify-start gap-4 py-1 pl-4">
              <div className="shrink-0">{prettyTime}</div>
              <div className="flex w-full flex-wrap justify-start gap-x-3 gap-y-1 align-middle">
                {count! > 1 && <Badge skipTranslation>{count}</Badge>}
                {speciesStage && (
                  <Badge skipTranslation>
                    <T i18nKey={getSurveyValueKey(speciesStage) as never} />
                  </Badge>
                )}
                <PaintedLadyWing wings={wing || []} />
                <PaintedLadyBehaviour behaviour={behaviour || ''} />
                <PaintedLadyDirection direction={String(direction || '')} />
                <PaintedLadyOther
                  text={nectarSource || mating || eggLaying || ''}
                />
              </div>
              {location && <div className="shrink-0">{location}</div>}
            </div>
          </IonItem>

          {!isDisabled && (
            <IonItemOptions side="end">
              <IonItemOption color="danger" onClick={deleteSubSample}>
                <T>common.delete</T>
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
        <InfoBackgroundMessage skipTranslation>
          <T
            i18nKey="area.noSpeciesRecords"
            values={{ prettySpeciesName }}
            components={{ species: <b /> }}
          />
        </InfoBackgroundMessage>
      );
    }

    return (
      <IonList id="list" lines="full">
        <div className="rounded-list">
          <div className="list-divider">
            <div style={{ maxWidth: 'fit-content' }}>{prettySpeciesName}</div>
            <div>{count}</div>
          </div>

          {speciesList}
        </div>
      </IonList>
    );
  };

  const showAreaWarningNote = () => {
    if (sample.metadata.saved && !sample.isDisabled) {
      return (
        <>
          <InfoMessage inline>area.pleaseCheckIf</InfoMessage>

          {hasLongSections && (
            <InfoMessage inline skipTranslation>
              <T i18nKey="area.longSections">
                We have noticed that your survey has <b>long sections</b>.
                Please make sure it is a correct <b>location</b>!
              </T>
            </InfoMessage>
          )}
        </>
      );
    }

    return null;
  };

  const showCopySpeciesTip = () => {
    if (!appModel.data.showCopySpeciesTip || !previousSurvey) {
      return null;
    }

    const hasSpeciesInOccurrence = previousSurvey.occurrences.length;
    if (!hasSpeciesInOccurrence) {
      return null;
    }

    alert({
      header: 'area.tipAddingSpecies',
      message: 'area.canBulkCopy',
      buttons: [
        {
          text: 'common.okGotIt',
          role: 'cancel',
          cssClass: 'primary',
        },
      ],
    });

    appModel.data.showCopySpeciesTip = false;

    return null;
  };

  const toggleTimerWrap = () => toggleTimer(sample);

  const getTimerButton = () => {
    const { surveyStartTime, surveyEndTime } = sample.data;
    if (isDisabled || surveyEndTime) {
      const formattedStartTime = surveyStartTime?.includes('T')
        ? timeFormat.format(new Date(surveyStartTime))
        : surveyStartTime; // from remote

      return (
        <IonItem className="menu-attr-item" detailIcon={flagOutline} detail>
          <IonIcon icon={timeOutline} slot="start" mode="md" />
          <IonLabel>
            <T>area.duration</T>
          </IonLabel>
          <IonLabel slot="end">
            {formattedStartTime} – {surveyEndTime}
          </IonLabel>
        </IonItem>
      );
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
          <T>area.duration</T>
        </IonLabel>
        <CountdownClock isPaused={isTimerPaused} countdown={timerEndTime} />
      </IonItem>
    );
  };

  const area = sample.data[areaSizeAttr.id];
  let areaPretty = <IonIcon icon={warningOutline} color="danger" />;
  if (Number.isFinite(area) || sample.gps.isRunning()) {
    areaPretty = (
      <div className="flex flex-col overflow-hidden">
        <div>{area ? `${area} m²` : ''}</div>
        <div className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap">
          {site?.data.name || sample.data.locationName}
        </div>
      </div>
    );
  }

  const speciesList = sample.isSingleSpeciesSurvey()
    ? getSingleSpeciesCountList()
    : getSpeciesList();

  return (
    <Main id="precise-area-count-edit" className="pb-ion-s-10">
      {isDisabled && <UploadedRecordInfoMessage sample={sample} />}

      <IonList lines="full">
        <h3 className="list-title">
          <T>common.details</T>
        </h3>
        <div className="rounded-list">
          {isDisabled && (
            <IonItem className="menu-attr-item [--inner-padding-end:5px]">
              <IonIcon icon={informationCircleOutline} slot="start" mode="md" />
              <IonLabel>
                <T>area.recordId</T>
              </IonLabel>
              <IonLabel slot="end">{sample.id}</IonLabel>
            </IonItem>
          )}
          <MenuAttrItem
            routerLink={`${match.url}/area`}
            icon={mapOutline}
            label="common.area"
            value={areaPretty}
            skipValueTranslation
          />

          {showAreaWarningNote()}

          {showCopySpeciesTip()}

          {getTimerButton()}

          <MenuAttrItem
            routerLink={`${match.url}/details`}
            icon={clipboardOutline}
            label="area.additionalDetails"
          />
        </div>

        {getSpeciesAddButton()}
      </IonList>

      {speciesList}
    </Main>
  );
};

export default observer(AreaCount);
