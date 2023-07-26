import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import { Page, Main } from '@flumens';
import {
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonBadge,
  IonHeader,
  IonToolbar,
} from '@ionic/react';
import samplesCollection from 'models/collections/samples';
import Sample, { bySurveyDate } from 'models/sample';
import Map from './components/Map';
import PendingSurveys from './components/Pending';
import UploadedSurveys from './components/Uploaded';
import './styles.scss';

const UserSurveyComponent: FC = () => {
  const [segment, setSegment] = useState('pending');
  const match = useRouteMatch<{ id?: string }>();

  useEffect(() => {
    match.params?.id && setSegment(match.params?.id);
  }, [match.params?.id]);

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);

    const basePath = match.path.split('/:id?')[0];
    const path = `${basePath}/${newSegment}`;
    window.history.replaceState(null, '', path); // https://stackoverflow.com/questions/57101831/react-router-how-do-i-update-the-url-without-causing-a-navigation-reload
  };

  const showingPending = segment === 'pending';
  const showingUploaded = segment === 'uploaded';
  const showingMap = segment === 'map';

  const getPendingSurveysCount = () => {
    const notUploaded = (sample: Sample) => !sample.metadata.syncedOn;
    const pendingSurveys = samplesCollection
      .filter(notUploaded)
      .sort(bySurveyDate);

    if (!pendingSurveys.length) return null;

    return (
      <IonBadge color="warning" slot="end">
        {pendingSurveys.length}
      </IonBadge>
    );
  };

  return (
    <Page id="home-user-surveys">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonSegment onIonChange={onSegmentClick} value={segment}>
            <IonSegmentButton value="pending">
              <IonLabel className="ion-text-wrap">
                <T>Pending</T>
                {getPendingSurveysCount()}
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="uploaded">
              <IonLabel className="ion-text-wrap">
                <T>Uploaded</T>
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="map">
              <IonLabel className="ion-text-wrap">
                <T>Map</T>
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <Main>
        {showingPending && <PendingSurveys />}

        {showingUploaded && <UploadedSurveys />}

        {showingMap && <Map />}
      </Main>
    </Page>
  );
};

export default observer(UserSurveyComponent);
