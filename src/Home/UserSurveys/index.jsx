import React from 'react';
import {
  IonList,
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonBadge,
  IonIcon,
} from '@ionic/react';
import { Page, Main } from '@apps';
import userModel from 'userModel';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import { Trans as T } from 'react-i18next';
import { addOutline } from 'ionicons/icons';
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
        <InfoBackgroundMessage className="text-center">
          No finished pending surveys.
          <br />
          <br />
          Press <IonIcon icon={addOutline} /> to add.
        </InfoBackgroundMessage>
      </IonList>
    );
  }

  const surveysList = surveys.map(sample => (
    <Survey key={sample.cid} sample={sample} userModel={userModel} />
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
          <IonSegment onIonChange={this.onSegmentClick} value={segment}>
            <IonSegmentButton value="pending" checked={showingPending}>
              <IonLabel className="ion-text-wrap">
                <T>Pending</T>
                {pendingSurveys.length ? (
                  <IonBadge color="warning" slot="end">
                    {pendingSurveys.length}
                  </IonBadge>
                ) : null}
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="uploaded" checked={showingUploaded}>
              <IonLabel className="ion-text-wrap">
                <T>Uploaded</T>
                {uploadedSurveys.length ? (
                  <IonBadge
                    class="ion-badge-custom-color"
                    color="light"
                    slot="end"
                  >
                    {uploadedSurveys.length}
                  </IonBadge>
                ) : null}
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="map" checked={showingMap}>
              <IonLabel className="ion-text-wrap">
                <T>Map</T>
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {showingPending && getPendingSurveys(pendingSurveys)}
          {showingUploaded && getUploadedSurveys(uploadedSurveys)}
          {/* have to keep mounted because can't detect a mount to fit map bounds */}
          <Map savedSamples={savedSamples} showingMap={showingMap} />
        </Main>
      </Page>
    );
  }
}

export default Component;
