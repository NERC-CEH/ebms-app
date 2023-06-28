import { FC, useState, useContext } from 'react';
import { observer } from 'mobx-react';
import { addOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { Page, Main, useToast } from '@flumens';
import {
  IonList,
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonBadge,
  IonIcon,
  IonButton,
  NavContext,
} from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import userModel from 'models/user';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Map from './components/Map';
import Survey from './components/Survey';
import './styles.scss';

async function uploadAllSamples(toast: any, savedSamples: any, t: any) {
  console.log('Settings:Menu:Controller: sending all samples.');

  if (!userModel.isLoggedIn()) {
    toast.warn('Please log in first to upload the records.');
    return;
  }

  try {
    const affectedRecordsCount = await savedSamples.remoteSaveAll();
    toast.success(
      t('Uploading {{count}} record', { count: affectedRecordsCount }),
      { skipTranslation: true }
    );
  } catch (e: any) {
    toast.error(e);
  }
}

function byCreateTime(occ1: Occurrence, occ2: Occurrence) {
  const date1 = new Date(occ1.metadata.createdOn);
  const date2 = new Date(occ2.metadata.createdOn);
  return date2.getTime() - date1.getTime();
}

type Props = {
  savedSamples: any;
};

const UserSurveyComponent: FC<Props> = ({ savedSamples }) => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const { t } = useTranslation();

  const [segment, setSegment] = useState('pending');

  const onSegmentClick = (e: any) => setSegment(e.detail.value);

  const getSamplesList = (uploaded?: boolean) => {
    const uploadedSamples = (sample: Sample) =>
      uploaded ? sample.metadata.syncedOn : !sample.metadata.syncedOn;
    return savedSamples.filter(uploadedSamples).sort(byCreateTime);
  };

  const isFinished = (sample: Sample) => sample.metadata.saved;
  const hasManyPending = () => getSamplesList().filter(isFinished).length > 4;

  const getUploadedSurveys = () => {
    const surveys = getSamplesList(true);

    if (!surveys.length) {
      return (
        <IonList lines="full">
          <InfoBackgroundMessage>No uploaded surveys</InfoBackgroundMessage>
        </IonList>
      );
    }

    const getUploadedSurveyEntry = (sample: Sample) => (
      <Survey key={sample.cid} sample={sample} />
    );
    const surveysList = surveys.map(getUploadedSurveyEntry);

    return <IonList lines="full">{surveysList}</IonList>;
  };

  const getPendingSurveys = () => {
    const surveys = getSamplesList(false);

    if (!surveys.length) {
      return (
        <IonList lines="full">
          <InfoBackgroundMessage>
            No finished pending surveys.
            <br />
            <br />
            Press <IonIcon icon={addOutline} className="start-survey-icon" /> to
            add.
          </InfoBackgroundMessage>
        </IonList>
      );
    }

    const getSurveyEntry = (sample: Sample) => (
      <Survey
        key={sample.cid}
        sample={sample}
        hasManyPending={hasManyPending()}
      />
    );

    const surveysList = surveys.map(getSurveyEntry);

    const onUploadAll = () => {
      const isLoggedIn = userModel.isLoggedIn();
      if (!isLoggedIn) {
        navigate(`/user/login`);
        return null;
      }

      return uploadAllSamples(toast, savedSamples, t);
    };

    return (
      <>
        <IonList lines="full">
          {surveysList}

          <InfoBackgroundMessage name="showSurveysDeleteTip">
            To delete any surveys swipe it to the left.
          </InfoBackgroundMessage>
        </IonList>

        {hasManyPending() && (
          <IonButton
            expand="block"
            size="small"
            className="upload-all-button"
            onClick={onUploadAll}
          >
            <T>Upload All</T>
          </IonButton>
        )}
      </>
    );
  };

  const showingPending = segment === 'pending';
  const showingUploaded = segment === 'uploaded';
  const showingMap = segment === 'map';

  const pendingSurveys = getSamplesList(false);
  const uploadedSurveys = getSamplesList(true);

  return (
    <Page id="surveys-list">
      <Main className="ion-padding">
        <IonSegment onIonChange={onSegmentClick} value={segment}>
          <IonSegmentButton value="pending">
            <IonLabel className="ion-text-wrap">
              <T>Pending</T>
              {pendingSurveys.length ? (
                <IonBadge color="warning" slot="end">
                  {pendingSurveys.length}
                </IonBadge>
              ) : null}
            </IonLabel>
          </IonSegmentButton>

          <IonSegmentButton value="uploaded">
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

          <IonSegmentButton value="map">
            <IonLabel className="ion-text-wrap">
              <T>Map</T>
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {showingPending && getPendingSurveys()}
        {showingUploaded && getUploadedSurveys()}

        {showingMap && (
          <Map savedSamples={savedSamples} showingMap={showingMap} />
        )}
      </Main>
    </Page>
  );
};

export default observer(UserSurveyComponent);
