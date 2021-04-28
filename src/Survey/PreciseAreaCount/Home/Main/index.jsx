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
} from '@ionic/react';
import { withRouter } from 'react-router';
import {
  mapOutline,
  timeOutline,
  pauseOutline,
  playOutline,
  addOutline,
  openOutline,
  clipboardOutline,
  filterOutline,
  warningOutline,
  informationCircle,
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
    const { isDisabled, match } = this.props;

    if (isDisabled) {
      // placeholder
      return <div style={{ height: '44px' }} />;
    }

    const navigateToSearch = () => this.context.navigate(`${match.url}/taxon`);

    return (
      <LongPressButton
        color="primary"
        id="add"
        onClick={navigateToSearch}
        onLongClick={this.showCopyOptions}
      >
        <IonIcon icon={addOutline} slot="start" />
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </LongPressButton>
    );
  };

  getSpeciesEntry = ([id, species]) => {
    const {
      deleteSpecies,
      navigateToSpeciesOccurrences,
      increaseCount,
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

    return (
      <IonItemSliding key={id}>
        <IonItem
          detail={!isSpeciesDisabled}
          onClick={navigateToSpeciesOccurrencesWrap}
        >
          <div className="precise-area-count-edit-count">
            <IonButton onClick={increaseCountWrap} fill="clear">
              {species.count}
            </IonButton>
          </div>
          <IonLabel>{speciesName}</IonLabel>
          <IonLabel slot="end" className="location-spinner">
            {location}
          </IonLabel>
        </IonItem>
        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={deleteSpeciesWrap}>
            <T>Delete</T>
          </IonItemOption>
        </IonItemOptions>
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

    return (
      <>
        <div id="species-list-sort">
          <IonButton
            fill="clear"
            size="small"
            onClick={this.props.onToggleSpeciesSort}
          >
            <IonIcon icon={filterOutline} mode="md" />
          </IonButton>
        </div>

        <IonList id="list" lines="full">
          {speciesList}
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

    const startTime = new Date(sample.attrs.surveyStartTime);
    const countdown =
      startTime.getTime() +
      config.DEFAULT_SURVEY_TIME +
      sample.metadata.pausedTime;
    const isPaused = !!sample.timerPausedTime.time;

    return (
      <IonItem
        detail={!isDisabled}
        detailIcon={isPaused ? playOutline : pauseOutline}
        onClick={this.toggleTimer}
        disabled={isDisabled}
      >
        <IonIcon icon={timeOutline} slot="start" mode="md" />
        <IonLabel>
          <T>Duration</T>
        </IonLabel>
        <CountdownClock isPaused={isPaused} countdown={countdown} />
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
            <InfoMessage icon={informationCircle}>
              This record has been submitted and cannot be edited within this
              App.
            </InfoMessage>

            <IonButton
              href={`${config.backend.url}`}
              expand="block"
              fill="outline"
              size="small"
              className="website-link"
            >
              <IonIcon icon={openOutline} slot="end" />
              <IonLabel>
                <T>eBMS website</T>
              </IonLabel>
            </IonButton>
          </>
        )}

        <IonList lines="full">
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

          {this.getSpeciesAddButton()}
        </IonList>

        {this.getSpeciesList()}
      </Main>
    );
  }
}

export default withRouter(AreaCount);
