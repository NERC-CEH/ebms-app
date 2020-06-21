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
} from '@ionic/react';
import {
  map,
  time,
  pause,
  play,
  addCircleOutline,
  funnel,
  open,
  clipboard,
} from 'ionicons/icons';
import { observer } from 'mobx-react';
import config from 'config';
import Main from 'Lib/Main';
import LongPressButton from 'Lib/LongPressButton';
import MenuAttrItem from 'Lib/MenuAttrItem';
import { Trans as T } from 'react-i18next';
import alert from '@bit/flumens.apps.helpers.alert';
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
  static propTypes = {
    sample: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
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
        header: t('Copy species'),
        message: t('Are you sure want to copy previous survey species list?'),
        buttons: [
          t('Cancel'),
          {
            text: t('Copy'),
            cssClass: 'danger',
            handler: copyPreviousSurveyTaxonList,
          },
        ],
      });
    }

    return (
      <LongPressButton
        color="primary"
        id="add"
        onClick={() => {
          this.props.history.push(`/survey/area/${sample.cid}/edit/taxa`);
        }}
        onLongClick={() => selectOptions(this.props)}
      >
        <IonIcon icon={addCircleOutline} slot="start" />
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
          <IonItem className="empty">
            <span>
              <T>No species added</T>
            </span>
          </IonItem>
        </IonList>
      );
    }

    const sort = areaSurveyListSortedByTime
      ? speciesOccAddedTimeSort
      : speciesNameSort;

    const occurrences = [...sample.occurrences].sort(sort);

    const getSpeciesEntry = occ => {
      const isSpeciesDisabled = !occ.attrs.count;

      return (
        <IonItemSliding key={occ.cid}>
          <IonItem detail={!isSpeciesDisabled}>
            <IonButton
              class="area-count-edit-count"
              onClick={() => !isDisabled && increaseCount(occ)}
              fill="clear"
            >
              {occ.attrs.count}
            </IonButton>
            <IonLabel
              onClick={() => !isSpeciesDisabled && navigateToOccurrence(occ)}
            >
              {occ.attrs.taxon[occ.attrs.taxon.found_in_name]}
            </IonLabel>
          </IonItem>
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={() => deleteOccurrence(occ)}>
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
            <IonIcon icon={funnel} mode="md" />
          </IonButton>
        </div>

        <IonList id="list" lines="full">
          {speciesList}
        </IonList>
      </>
    );
  }

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
          <div className="info-message">
            <p>
              <T>
                This record has been submitted and cannot be edited within this
                App.
              </T>
            </p>

            <IonButton href={`${config.site_url}`}>
              <IonIcon icon={open} slot="end" />
              <IonLabel>
                <T>eBMS website</T>
              </IonLabel>
            </IonButton>
          </div>
        )}

        <IonList lines="full">
          <MenuAttrItem
            routerLink={`/survey/area/${sample.cid}/edit/area`}
            icon={map}
            iconMode="md"
            label="Area"
            value={areaPretty}
          />
          <IonItem
            detail={!isDisabled}
            detailIcon={isPaused ? play : pause}
            onClick={this.toggleTimer}
            disabled={isDisabled}
          >
            <IonIcon icon={time} slot="start" mode="md" />
            <IonLabel>
              <T>Duration</T>
            </IonLabel>
            <CountdownClock isPaused={isPaused} countdown={countdown} />
          </IonItem>
          <MenuAttrItem
            routerLink={`/survey/area/${sample.cid}/edit/details`}
            disabled={isDisabled}
            icon={clipboard}
            iconMode="md"
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
