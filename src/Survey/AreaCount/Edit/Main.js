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
import { observer } from 'mobx-react';
import Countdown, { zeroPad } from 'react-countdown-now';
import config from 'config';
import './styles.scss';

function CountdownRenderer({ minutes, seconds, completed }) {
  if (completed) {
    return t(`Time's up!`);
  }
  return (
    <span id="countdown" className={minutes < 3 ? 'warn' : ''}>
      {`${zeroPad(minutes)}:${zeroPad(seconds)}`}
    </span>
  );
}

CountdownRenderer.propTypes = {
  minutes: PropTypes.number.isRequired,
  seconds: PropTypes.number.isRequired,
  completed: PropTypes.bool.isRequired,
};

const speciesNameSort = (occ1, occ2) => {
  const taxon1 = occ1.get('taxon').scientific_name;
  const taxon2 = occ2.get('taxon').scientific_name;
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
    deleteOccurrence: PropTypes.func.isRequired,
    navigateToOccurrence: PropTypes.func.isRequired,
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
          <IonButton fill="clear" size="small" onClick={this.toggleSpeciesSort}>
            <IonIcon name="md-funnel" />
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
                  {occ.get('taxon').scientific_name}
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

  render() {
    const { sample } = this.props;

    const { area } = sample.get('location') || {};
    const areaPretty = area && `${area.toLocaleString()} m²`;

    const startTime = new Date(sample.get('surveyStartTime'));
    const countdown = startTime.getTime() + config.DEFAULT_SURVEY_TIME;

    return (
      <IonContent id="area-count-edit">
        <IonList lines="full">
          <IonItem href={`#survey/${sample.cid}/edit/area`} detail>
            <IonIcon name="map" slot="start" />
            <IonLabel>{t('Area')}</IonLabel>
            <IonLabel slot="end">{areaPretty}</IonLabel>
          </IonItem>
          <IonItem href={`#survey/${sample.cid}/edit/time`} detail>
            <IonIcon name="time" slot="start" />
            <IonLabel>{t('Duration')}</IonLabel>
            <IonLabel slot="end">
              <Countdown date={countdown} renderer={CountdownRenderer} />
            </IonLabel>
          </IonItem>

          <IonButton
            color="primary"
            id="add"
            href={`#survey/${sample.cid}/edit/taxa`}
          >
            <IonIcon name="add-circle-outline" slot="start" />
            <IonLabel>{t('Add')}</IonLabel>
          </IonButton>
        </IonList>

        {this.getSpeciesList(sample)}
      </IonContent>
    );
  }
}

export default AreaCount;
