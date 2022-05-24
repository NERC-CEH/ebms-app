import { FC, useContext } from 'react';
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
  IonItemDivider,
} from '@ionic/react';
import { useRouteMatch } from 'react-router-dom';
import {
  mapOutline,
  timeOutline,
  pauseOutline,
  playOutline,
  clipboardOutline,
  filterOutline,
  warningOutline,
  informationCircle,
  flagOutline,
} from 'ionicons/icons';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import config from 'common/config';
import appModel from 'models/app';
import Sample from 'models/sample';
import {
  Main,
  MenuAttrItem,
  LongPressButton,
  useAlert,
  InfoMessage,
} from '@flumens';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import { Trans as T } from 'react-i18next';
import CountdownClock from './components/CountdownClock';
import './styles.scss';

const speciesNameSort = ([, sp1]: any, [, sp2]: any) => {
  const taxon1 = sp1.taxon;
  const taxonName1 = taxon1[taxon1.found_in_name];

  const taxon2 = sp2.taxon;
  const taxonName2 = taxon2[taxon2.found_in_name];

  return taxonName1.localeCompare(taxonName2);
};

const speciesOccAddedTimeSort = ([, sp1]: any, [, sp2]: any) => {
  const date1 = new Date(sp1.updatedOn);
  const date2 = new Date(sp2.updatedOn);
  return date2.getTime() - date1.getTime();
};

const getDefaultTaxonCount = (taxon: any) => ({ count: 0, taxon });

const buildSpeciesCount = (agg: any, smp: Sample) => {
  const taxon = toJS(smp.occurrences[0].attrs.taxon);
  const id = taxon.warehouse_id;

  agg[id] = agg[id] || getDefaultTaxonCount(taxon); // eslint-disable-line

  if (smp.isSurveyPreciseSingleSpecies() && smp.hasZeroAbundance()) {
    return agg;
  }

  agg[id].count++; // eslint-disable-line
  agg[id].isGeolocating = agg[id].isGeolocating || smp.isGPSRunning(); // eslint-disable-line
  // eslint-disable-next-line
  agg[id].hasLocationMissing =
    agg[id].hasLocationMissing || smp.hasLoctionMissingAndIsnotLocating(); // eslint-disable-line

  const wasCreatedBeforeCurrent =
    new Date(agg[id].updatedOn).getTime() -
    new Date(smp.metadata.updated_on).getTime();

  // eslint-disable-next-line
  agg[id].updatedOn = !wasCreatedBeforeCurrent
    ? agg[id].updatedOn
    : smp.metadata.updated_on;

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
  increaseCount: any;
  isDisabled?: boolean;
};

const AreaCount: FC<Props> = ({
  sample,
  previousSurvey,
  deleteSpecies,
  navigateToSpeciesOccurrences,
  onToggleSpeciesSort,
  toggleTimer,
  areaSurveyListSortedByTime,
  increaseCount,
  isDisabled,
  copyPreviousSurveyTaxonList,
}) => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch<any>();
  const alert = useAlert();

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
    if (isDisabled) {
      // placeholder
      return <div style={{ height: '44px' }} />;
    }

    const isSingleSpeciesSurvey =
      sample.metadata.survey === 'precise-single-species-area';
    const hasAlreadySpecies = !!sample.samples.length;
    if (isSingleSpeciesSurvey && hasAlreadySpecies) {
      return null;
    }

    const navigateToSearch = () => navigate(`${match.url}/taxon`);
    const showCopyOptionsWrap = () =>
      !sample.isSurveyPreciseSingleSpecies() && showCopyOptions();

    return (
      <LongPressButton
        color="primary"
        id="add"
        onClick={navigateToSearch}
        onLongClick={showCopyOptionsWrap}
      >
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </LongPressButton>
    );
  };

  const getSpeciesEntry = ([id, species]: any) => {
    const isSpeciesDisabled = !species.count;
    const { taxon } = species;

    const speciesName = taxon[taxon.found_in_name];

    const isShallow = !species.count;
    const increaseCountWrap = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      increaseCount(taxon, isShallow);
    };

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
          <IonButton
            className="precise-area-count-edit-count"
            onClick={increaseCountWrap}
            fill="clear"
          >
            {species.count}
            <div className="label-divider" />
          </IonButton>
          <IonLabel>{speciesName}</IonLabel>
          <IonLabel slot="end" className="location-spinner">
            {location}
          </IonLabel>
        </IonItem>
        {!isDisabled && (
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
    if (!sample.samples.length && !sample.shallowSpeciesList.length) {
      return (
        <IonList id="list" lines="full">
          <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
        </IonList>
      );
    }

    const speciesCounts = [...sample.samples].reduce(buildSpeciesCount, {});
    const shallowCounts = sample.shallowSpeciesList.map(getDefaultTaxonCount);

    const counts = {
      ...speciesCounts,
      ...shallowCounts,
    };

    const sort = areaSurveyListSortedByTime
      ? speciesOccAddedTimeSort
      : speciesNameSort;

    const speciesList = Object.entries(counts).sort(sort).map(getSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

    return (
      <>
        {count && (
          <div id="species-list-sort">
            <IonButton fill="clear" size="small" onClick={onToggleSpeciesSort}>
              <IonIcon icon={filterOutline} mode="md" />
            </IonButton>
          </div>
        )}

        <IonList id="list" lines="full">
          <div className="rounded">
            <IonItemDivider className="species-list-header">
              <IonLabel>Count</IonLabel>
              <IonLabel>Species</IonLabel>
              <IonLabel>{count}</IonLabel>
            </IonItemDivider>

            {speciesList}
          </div>
        </IonList>
      </>
    );
  };

  const showAreaWarningNote = () => {
    if (sample.metadata.saved && !sample.isDisabled()) {
      return (
        <InfoMessage color="medium">
          Please check if the recording area is correct before sending the
          record.
        </InfoMessage>
      );
    }

    return null;
  };

  const showCopySpeciesTip = () => {
    if (!appModel.attrs.showCopySpeciesTip || !previousSurvey) {
      return;
    }

    const hasSpeciesInOccurrence = previousSurvey.occurrences.length;
    if (!hasSpeciesInOccurrence) {
      return;
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

  const { area } = sample.attrs.location || {};
  let areaPretty: any = <IonIcon icon={warningOutline} color="danger" />;
  if (Number.isFinite(area) || sample.isGPSRunning()) {
    areaPretty = area ? `${area} m²` : '';
  }

  return (
    <Main id="precise-area-count-edit">
      {isDisabled && (
        <>
          <InfoMessage
            className="blue"
            icon={informationCircle}
            skipTranslation
          >
            <T>
              This record has been submitted and cannot be edited within this
              App.
            </T>
            <IonButton
              href={`${config.backend.url}`}
              expand="block"
              color="dark"
              fill="outline"
              size="small"
              className="website-link"
            >
              <T>eBMS website</T>
            </IonButton>
          </InfoMessage>
        </>
      )}

      <IonList lines="full">
        <IonItemDivider>
          <T>Details</T>
        </IonItemDivider>
        <div className="rounded">
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
    </Main>
  );
};

export default observer(AreaCount);
