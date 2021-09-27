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
} from '@ionic/react';
import {
  mapOutline,
  timeOutline,
  pauseOutline,
  playOutline,
  addOutline,
  filterOutline,
  openOutline,
  clipboardOutline,
  informationCircle,
} from 'ionicons/icons';
import { observer } from 'mobx-react';
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

const speciesNameSort = (occ1, occ2) => {
  const taxon1 = occ1.attrs.taxon;
  const taxonName1 = taxon1[taxon1.found_in_name];

  const taxon2 = occ2.attrs.taxon;
  const taxonName2 = taxon2[taxon2.found_in_name];

  return taxonName1.localeCompare(taxonName2);
};

const speciesOccAddedTimeSort = (occ1, occ2) => {
  const date1 = new Date(occ1.metadata.updated_on);
  const date2 = new Date(occ2.metadata.updated_on);
  return date2.getTime() - date1.getTime();
};

@observer
class AreaCount extends Component {
  static contextType = NavContext;

  static propTypes = {
    sample: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
    previousSurvey: PropTypes.object,
    deleteOccurrence: PropTypes.func.isRequired,
    navigateToOccurrence: PropTypes.func.isRequired,
    onToggleSpeciesSort: PropTypes.func.isRequired,
    toggleTimer: PropTypes.func.isRequired,
    areaSurveyListSortedByTime: PropTypes.bool.isRequired,
    increaseCount: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    copyPreviousSurveyTaxonList: PropTypes.func.isRequired,
  };

  getSpeciesAddButton = () => {
    const { sample, isDisabled, copyPreviousSurveyTaxonList } = this.props;

    if (isDisabled) {
      // placeholder
      return <div style={{ height: '44px' }} />;
    }

    function selectOptions() {
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
    }

    const showOptions = () => selectOptions(this.props);
    const navigateToTaxa = () =>
      this.context.navigate(`/survey/area/${sample.cid}/edit/taxa`);

    return (
      <LongPressButton
        color="primary"
        id="add"
        onClick={navigateToTaxa}
        onLongClick={showOptions}
      >
        <IonIcon icon={addOutline} slot="start" />
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </LongPressButton>
    );
  };

  getSpeciesList() {
    const {
      sample,
      deleteOccurrence,
      navigateToOccurrence,
      areaSurveyListSortedByTime,
      increaseCount,
      isDisabled,
    } = this.props;

    if (!sample.occurrences.length) {
      return (
        <IonList id="list" lines="full">
          <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
        </IonList>
      );
    }

    const sort = areaSurveyListSortedByTime
      ? speciesOccAddedTimeSort
      : speciesNameSort;

    const occurrences = [...sample.occurrences].sort(sort);

    const getSpeciesEntry = occ => {
      const isSpeciesDisabled = !occ.attrs.count;

      const deleteOccurrenceWrap = () => deleteOccurrence(occ);
      const increaseCountWrap = () => !isDisabled && increaseCount(occ);
      const navigateToOccurrenceWrap = () => {
        return !isSpeciesDisabled && navigateToOccurrence(occ);
      };
      return (
        <IonItemSliding key={occ.cid}>
          <IonItem detail={!isSpeciesDisabled}>
            <IonButton
              class="area-count-edit-count"
              onClick={increaseCountWrap}
              fill="clear"
            >
              {occ.attrs.count}
            </IonButton>
            <IonLabel onClick={navigateToOccurrenceWrap}>
              {occ.attrs.taxon[occ.attrs.taxon.found_in_name]}
            </IonLabel>
          </IonItem>
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={deleteOccurrenceWrap}>
              <T>Delete</T>
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    };

    const speciesList = occurrences.map(getSpeciesEntry);

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

    if (sample.metadata.saved) {
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

  render() {
    const { sample, isDisabled } = this.props;

    const { area } = sample.attrs.location || {};
    const areaPretty = area && `${area.toLocaleString()} m²`;

    const startTime = new Date(sample.attrs.surveyStartTime);
    const countdown =
      startTime.getTime() +
      config.DEFAULT_SURVEY_TIME +
      sample.metadata.pausedTime;
    const isPaused = !!sample.timerPausedTime.time;

    return (
      <Main id="area-count-edit">
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
                <IonIcon icon={openOutline} slot="end" />
                <IonLabel>
                  <T>eBMS website</T>
                </IonLabel>
              </IonButton>
            </InfoMessage>
          </>
        )}

        <IonList lines="full">
          <MenuAttrItem
            routerLink={`/survey/area/${sample.cid}/edit/area`}
            icon={mapOutline}
            label="Area"
            value={areaPretty}
          />

          {this.showAreaWarningNote()}

          {this.showCopySpeciesTip()}

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

          <MenuAttrItem
            routerLink={`/survey/area/${sample.cid}/edit/details`}
            disabled={isDisabled}
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

export default AreaCount;
