import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import { withRouter } from 'react-router';
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
import config from 'config';
import {
  Main,
  MenuAttrItem,
  MenuNoteItem,
  LongPressButton,
  alert,
  InfoMessage,
} from '@apps';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import { Trans as T } from 'react-i18next';
import CountdownClock from './components/CountdownClock';
import './styles.scss';

const speciesNameSort = ([, sp1], [, sp2]) => {
  const taxon1 = sp1.taxon;
  const taxonName1 = taxon1[taxon1.found_in_name];

  const taxon2 = sp2.taxon;
  const taxonName2 = taxon2[taxon2.found_in_name];

  return taxonName1.localeCompare(taxonName2);
};

const speciesOccAddedTimeSort = ([, sp1], [, sp2]) => {
  const date1 = new Date(sp1.updatedOn);
  const date2 = new Date(sp2.updatedOn);
  return date2.getTime() - date1.getTime();
};

const getDefaultTaxonCount = taxon => ({ count: 0, taxon });

const buildSpeciesCount = (agg, smp) => {
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

@observer
class AreaCount extends Component {
  static contextType = NavContext;

  static propTypes = {
    sample: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
    previousSurvey: PropTypes.object,
    deleteSpecies: PropTypes.func.isRequired,
    navigateToSpeciesOccurrences: PropTypes.func.isRequired,
    onToggleSpeciesSort: PropTypes.func.isRequired,
    toggleTimer: PropTypes.func.isRequired,
    areaSurveyListSortedByTime: PropTypes.bool.isRequired,
    increaseCount: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    copyPreviousSurveyTaxonList: PropTypes.func.isRequired,
  };

  showCopyOptions = () => {
    const { copyPreviousSurveyTaxonList } = this.props;

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

  getSpeciesAddButton = () => {
    const { isDisabled, match, sample } = this.props;

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

    const navigateToSearch = () => this.context.navigate(`${match.url}/taxon`);
    const showCopyOptionsWrap = () =>
      !sample.isSurveyPreciseSingleSpecies() && this.showCopyOptions();

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

  getSpeciesEntry = ([id, species]) => {
    const {
      sample,
      deleteSpecies,
      navigateToSpeciesOccurrences,
      increaseCount,
      isDisabled,
    } = this.props;

    const isSpeciesDisabled = !species.count;
    const { taxon } = species;

    const speciesName = taxon[taxon.found_in_name];

    const isShallow = !species.count;
    const increaseCountWrap = e => {
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

  getSpeciesList() {
    const { sample, areaSurveyListSortedByTime } = this.props;

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

    const speciesList = Object.entries(counts)
      .sort(sort)
      .map(this.getSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

    return (
      <>
        {count && (
          <div id="species-list-sort">
            <IonButton
              fill="clear"
              size="small"
              onClick={this.props.onToggleSpeciesSort}
            >
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
  }

  showAreaWarningNote = () => {
    const { sample } = this.props;

    if (sample.metadata.saved && !sample.isDisabled()) {
      return (
        <MenuNoteItem color="medium">
          Please check if the recording area is correct before sending the
          record.
        </MenuNoteItem>
      );
    }

    return null;
  };

  showCopySpeciesTip = () => {
    const { appModel, previousSurvey } = this.props;

    if (!appModel.attrs.showCopySpeciesTip || !previousSurvey) {
      return;
    }

    const hasSpeciesInOccurrence = previousSurvey.occurrences.length;
    if (!hasSpeciesInOccurrence) {
      return;
    }

    alert({
      header: t('Tip: Adding Species'),
      message: (
        <T>
          You can bulk copy your previous species lists by long-pressing the Add
          Species button.
        </T>
      ),
      buttons: [
        {
          text: t('OK, got it'),
          role: 'cancel',
          cssClass: 'primary',
        },
      ],
    });

    appModel.attrs.showCopySpeciesTip = false;
    appModel.save();
  };

  toggleTimer = () => this.props.toggleTimer(this.props.sample);

  getTimerButton = () => {
    const { sample, isDisabled } = this.props;

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
        onClick={this.toggleTimer}
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

  render() {
    const { sample, isDisabled, match } = this.props;

    const { area } = sample.attrs.location || {};
    let areaPretty = <IonIcon icon={warningOutline} color="danger" />;
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

            {this.showAreaWarningNote()}

            {this.showCopySpeciesTip()}

            {this.getTimerButton()}

            <MenuAttrItem
              routerLink={`${match.url}/details`}
              icon={clipboardOutline}
              label="Additional Details"
            />
          </div>

          {this.getSpeciesAddButton()}
        </IonList>

        {this.getSpeciesList()}
      </Main>
    );
  }
}

export default withRouter(AreaCount);
