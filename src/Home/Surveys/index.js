import React from 'react';
import {
  IonList,
  IonItem,
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonBadge,
  IonIcon,
} from '@ionic/react';
import Main from 'Lib/Main';
import Page from 'Lib/Page';
import InfoBackgroundMessage from 'Lib/InfoBackgroundMessage';
import { Trans as T } from 'react-i18next';
import { add } from 'ionicons/icons';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Survey from './components/Survey';
import Map from './components/Map';
import './styles.scss';

function byCreateTime(occ1, occ2) {
  const date1 = new Date(occ1.metadata.created_on);
  const date2 = new Date(occ2.metadata.created_on);
  return date2.getTime() - date1.getTime();
}

function getPendingSurveys(surveys) {
  const finishedSurvey = surveys.find(sample => sample.metadata.saved);

  if (!surveys.length) {
    return (
      <IonList lines="full">
        <IonItem className="info-background-message">
          <span>
            <T>
              No finished pending surveys.
              <br />
              <br />
              Press <IonIcon icon={add} /> to add.
            </T>
          </span>
        </IonItem>
      </IonList>
    );
  }

  const surveysList = surveys.map(sample => (
    <Survey key={sample.cid} sample={sample} />
  ));

  if (finishedSurvey) {
    return (
      <IonList lines="full">
        {surveysList}

        <InfoBackgroundMessage name="showSurveyUploadTip">
          Please do not forget to upload any pending surveys!
        </InfoBackgroundMessage>
      </IonList>
    );
  }

  return (
    <IonList lines="full">
      {surveysList}

      <InfoBackgroundMessage name="showSurveysDeleteTip">
        To delete any surveys swipe it to the left.
      </InfoBackgroundMessage>
    </IonList>
  );
}

function getUploadedSurveys(surveys) {
  if (!surveys.length) {
    return (
      <IonList lines="full">
        <InfoBackgroundMessage>
          <T>No uploaded surveys</T>
        </InfoBackgroundMessage>
      </IonList>
    );
  }

  const surveysList = surveys.map(sample => (
    <Survey key={sample.cid} sample={sample} />
  ));

  return <IonList lines="full">{surveysList}</IonList>;
}

@observer
class Component extends React.Component {
  static propTypes = {
    savedSamples: PropTypes.array.isRequired,
  };

  state = {
    segment: 'pending',
  };

  onSegmentClick = e => {
    this.setState({ segment: e.detail.value });
  };

  getSamplesList(uploaded) {
    const { savedSamples } = this.props;

    return savedSamples
      .filter(sample =>
        uploaded ? sample.metadata.synced_on : !sample.metadata.synced_on
      )
      .sort(byCreateTime);
  }

  render() {
    const { savedSamples } = this.props;
    const { segment } = this.state;

    const showingPending = segment === 'pending';
    const showingUploaded = segment === 'uploaded';
    const showingMap = segment === 'map';

    const pendingSurveys = this.getSamplesList();
    const uploadedSurveys = this.getSamplesList(true);

    return (
      <Page id="surveys-list">
        <Main class="ion-padding">
          <IonSegment
            onIonChange={this.onSegmentClick}
            value={segment}
            mode="ios"
          >
            <IonSegmentButton
              value="pending"
              checked={showingPending}
              mode="ios"
            >
              <IonLabel className="ion-text-wrap" mode="ios">
                {t('Pending')}
                {pendingSurveys.length ? (
                  <IonBadge color="danger" slot="end" mode="ios">
                    {pendingSurveys.length}
                  </IonBadge>
                ) : null}
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton
              value="uploaded"
              checked={showingUploaded}
              mode="ios"
            >
              <IonLabel className="ion-text-wrap" mode="ios">
                {t('Uploaded')}
                {uploadedSurveys.length ? (
                  <IonBadge
                    class="ion-badge-custom-color"
                    color="light"
                    slot="end"
                    mode="ios"
                  >
                    {uploadedSurveys.length}
                  </IonBadge>
                ) : null}
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="map" checked={showingMap} mode="ios">
              <IonLabel className="ion-text-wrap" mode="ios">
                {t('Map')}
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {showingPending && getPendingSurveys(pendingSurveys)}
          {showingUploaded && getUploadedSurveys(uploadedSurveys)}
          {/* have to keep mounted because can't detect a mount to fit map bounds */}
          {<Map savedSamples={savedSamples} showingMap={showingMap} />}
        </Main>
      </Page>
    );
  }
}

export default Component;
