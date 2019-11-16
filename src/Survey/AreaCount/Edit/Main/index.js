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
} from 'ionicons/icons';
import { observer } from 'mobx-react';
import config from 'config';
import CountdownClock from './components/CountdownClock';
import './styles.scss';

const speciesNameSort = (occ1, occ2) => {
  const foundInName1 = occ1.get('taxon').found_in_name;
  const foundInName2 = occ2.get('taxon').found_in_name;
  const taxon1 = occ1.get('taxon')[foundInName1];
  const taxon2 = occ2.get('taxon')[foundInName2];
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
  };

  getSpeciesList(sample) {
    if (!sample.occurrences.models.length) {
      return (
        <IonList id="list" lines="full">
          <IonItem className="empty">
            <span>{t('No species added')}</span>
          </IonItem>
        </IonList>
      );
    }
    const {
      deleteOccurrence,
      navigateToOccurrence,
      areaSurveyListSortedByTime,
      increaseCount,
    } = this.props;

    const sort = areaSurveyListSortedByTime
      ? speciesOccAddedTimeSort
      : speciesNameSort;

    const occurrences = [...sample.occurrences.models].sort(sort);

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
                  onClick={() => increaseCount(occ)}
                  fill="clear"
                >
                  {occ.get('count')}
                </IonButton>
                <IonLabel onClick={() => navigateToOccurrence(occ)}>
                  {occ.get('taxon')[occ.get('taxon').found_in_name]}
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
    const { sample } = this.props;

    const { area } = sample.get('location') || {};
    const areaPretty = area && `${area.toLocaleString()} m²`;

    const startTime = new Date(sample.get('surveyStartTime'));
    const countdown =
      startTime.getTime() +
      config.DEFAULT_SURVEY_TIME +
      sample.metadata.pausedTime;
    const isPaused = !!sample.timerPausedTime.time;

    return (
      <IonContent id="area-count-edit">
        <IonList lines="full">
          <IonItem routerLink={`/survey/area/${sample.cid}/edit/area`} detail>
            <IonIcon icon={map} slot="start" mode="md" />
            <IonLabel>{t('Area')}</IonLabel>
            <IonLabel slot="end">{areaPretty}</IonLabel>
          </IonItem>
          <IonItem
            detail
            detailIcon={isPaused ? play : pause}
            onClick={this.toggleTimer}
          >
            <IonIcon icon={time} slot="start" mode="md" />
            <IonLabel>{t('Duration')}</IonLabel>
            <CountdownClock isPaused={isPaused} countdown={countdown} />
          </IonItem>

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
        </IonList>

        {this.getSpeciesList(sample)}
      </IonContent>
    );
  }
}

export default AreaCount;
