import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonList,
  IonItem,
  IonItemSliding,
  IonButton,
  IonIcon,
  IonLabel,
  IonContent,
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
} from 'ionicons/icons';
import { observer } from 'mobx-react';
import config from 'config';
import MenuAttrItem from 'Components/MenuAttrItem';
import CountdownClock from './components/CountdownClock';
import './styles.scss';

const speciesNameSort = (occ1, occ2) => {
  const foundInName1 = occ1.attrs.taxon.found_in_name;
  const foundInName2 = occ2.attrs.taxon.found_in_name;
  const taxon1 = occ1.attrs.taxon[foundInName1];
  const taxon2 = occ2.attrs.taxon[foundInName2];
  return taxon1.localeCompare(taxon2);
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
  };

  getSpeciesAddButton = () => {
    const { sample, isDisabled } = this.props;
    if (isDisabled) {
      // placeholder
      return <div style={{ height: '44px' }} />;
    }

    return (
      <IonButton
        color="primary"
        id="add"
        onClick={() => {
          this.props.history.push(`/survey/area/${sample.cid}/edit/taxa`);
        }}
      >
        <IonIcon icon={addCircleOutline} slot="start" />
        <IonLabel>{t('Add')}</IonLabel>
      </IonButton>
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
            <span>{t('No species added')}</span>
          </IonItem>
        </IonList>
      );
    }

    const sort = areaSurveyListSortedByTime
      ? speciesOccAddedTimeSort
      : speciesNameSort;

    const occurrences = [...sample.occurrences].sort(sort);

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
          {occurrences.map(occ => (
            <IonItemSliding key={occ.cid}>
              <IonItem detail>
                <IonButton
                  class="area-count-edit-count"
                  onClick={() => !isDisabled && increaseCount(occ)}
                  fill="clear"
                >
                  {occ.attrs.count}
                </IonButton>
                <IonLabel onClick={() => navigateToOccurrence(occ)}>
                  {occ.attrs.taxon[occ.attrs.taxon.found_in_name]}
                </IonLabel>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption
                  color="danger"
                  onClick={() => deleteOccurrence(occ)}
                >
                  {t('Delete')}
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
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
      <IonContent id="area-count-edit">
        {isDisabled && (
          <div className="info-message">
            <p>
              {t(
                'This record has been submitted and cannot be edited within this App.'
              )}
            </p>

            <IonButton href={`${config.site_url}`}>
              <IonIcon icon={open} slot="end" />
              <IonLabel>{t('eBMS website')}</IonLabel>
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
            <IonLabel>{t('Duration')}</IonLabel>
            <CountdownClock isPaused={isPaused} countdown={countdown} />
          </IonItem>

          {this.getSpeciesAddButton()}
        </IonList>

        {this.getSpeciesList()}
      </IonContent>
    );
  }
}

export default AreaCount;
