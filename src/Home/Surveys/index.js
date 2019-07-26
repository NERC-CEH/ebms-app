import React from 'react';
import {
  IonContent,
  IonList,
  IonItem,
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonBadge,
} from '@ionic/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Survey from './components/Survey';
import './styles.scss';

function byCreateTime(occ1, occ2) {
  const date1 = new Date(occ1.metadata.created_on);
  const date2 = new Date(occ2.metadata.created_on);
  return date2.getTime() - date1.getTime();
}

function getPendingSurveys(surveys) {
  if (!surveys.length) {
    return (
      <IonList lines="full">
        <IonItem className="empty">
          <span>{t('No finished pending surveys')}</span>
        </IonItem>
      </IonList>
    );
  }

  return (
    <IonList>
      {surveys.map(sample => (
        <Survey key={sample.cid} sample={sample} />
      ))}
    </IonList>
  );
}

function getUploadedSurveys(surveys) {
  if (!surveys.length) {
    return (
      <IonList lines="full">
        <IonItem className="empty">
          <span>{t('No uploaded surveys')}</span>
        </IonItem>
      </IonList>
    );
  }

  return (
    <IonList>
      {surveys.map(sample => (
        <Survey key={sample.cid} sample={sample} />
      ))}
    </IonList>
  );
}

@observer
class Component extends React.Component {
  static propTypes = {
    savedSamples: PropTypes.object.isRequired,
  };

  state = {
    segment: 'pending',
  };

  onSegmentClick = e => {
    this.setState({ segment: e.detail.value });
  };

  getSamplesList(uploaded) {
    const { savedSamples } = this.props;

    return savedSamples.models
      .filter(sample =>
        sample.metadata.saved && uploaded
          ? !sample.metadata.synced_on
          : sample.metadata.synced_on
      )
      .sort(byCreateTime);
  }

  render() {
    const { segment } = this.state;

    const showingPending = segment === 'pending';
    const showingUploaded = segment === 'uploaded';

    const pendingSurveys = this.getSamplesList(true);
    const uploadedSurveys = this.getSamplesList();

    return (
      <>
        <IonContent id="user-report" class="ion-padding">
          <IonSegment onIonChange={this.onSegmentClick} value={segment}>
            <IonSegmentButton value="pending" checked={showingPending}>
              <IonLabel>
                {t('Pending')}
                {pendingSurveys.length ? (
                  <IonBadge color="danger" slot="end">
                    {pendingSurveys.length}
                  </IonBadge>
                ) : null}
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="uploaded" checked={showingUploaded}>
              <IonLabel>
                {t('Uploaded')}
                {uploadedSurveys.length ? (
                  <IonBadge color="light" slot="end">
                    {uploadedSurveys.length}
                  </IonBadge>
                ) : null}
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {showingPending && getPendingSurveys(pendingSurveys)}
          {showingUploaded && getUploadedSurveys(uploadedSurveys)}
        </IonContent>
      </>
    );
  }
}

export default Component;
