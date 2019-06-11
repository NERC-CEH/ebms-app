import React from 'react';
import {
  IonContent,
  IonList,
  IonItem,
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { observer } from 'mobx-react';
import alert from 'common/helpers/alert';
import PropTypes from 'prop-types';
import './styles.scss';

function deleteSurvey(sample) {
  alert({
    header: t('Delete'),
    message: t('Are you sure you want to delete this survey?'),
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Delete'),
        cssClass: 'secondary',
        handler: () => {
          sample.destroy();
        },
      },
    ],
  });
}

@observer
class Component extends React.Component {
  propTypes = {
    savedSamples: PropTypes.object.isRequired,
  };

  state = {
    segment: 'surveys',
  };

  onSegmentClick = e => {
    this.setState({ segment: e.detail.value });
  };

  getSavedSamplesList() {
    const { savedSamples } = this.props;

    if (!savedSamples.models.length) {
      return (
        <IonList lines="full">
          <IonItem className="empty">
            <span>{t('No finished surveys')}</span>
          </IonItem>
        </IonList>
      );
    }

    return (
      <IonList>
        {savedSamples.models
          .filter(sample => sample.metadata.saved)
          .map(sample => {
            const date = new Date(sample.metadata.created_on);
            const prettyDate = date.toLocaleDateString();
            const speciesCount = sample.occurrences.models.length;
            return (
              <IonItemSliding key={sample.cid}>
                <IonItem>
                  <b> 
                    {' '}
                    {prettyDate}
                  </b>
                  <IonLabel slot="end">
                    {`${t('species')}: ${speciesCount}`}
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption
                    color="danger"
                    onClick={() => deleteSurvey(sample)}
                  >
                    {t('Delete')}
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            );
          })}
      </IonList>
    );
  }

  render() {
    const { segment } = this.state;
    const savedSamplesList = this.getSavedSamplesList();

    const showingSurveys = segment === 'surveys';
    const showingReports = segment === 'reports';
    return (
      <>
        <IonContent id="user-report" class="ion-padding">
          <IonSegment onIonChange={this.onSegmentClick} value={segment}>
            <IonSegmentButton value="surveys" checked={showingSurveys}>
              <IonLabel>{t('Surveys')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="reports" checked={showingReports} disabled>
              <IonLabel>{t('Reports')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {showingSurveys && savedSamplesList}
          {showingReports && (
            <IonList>
              <small>TODO: add report</small>
            </IonList>
          )}
        </IonContent>
      </>
    );
  }
}

export default Component;
