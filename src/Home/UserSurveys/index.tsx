import { FC, useState, useContext } from 'react';
import { observer } from 'mobx-react';
import { addOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { Page, Main, useToast, date as DateHelp } from '@flumens';
import {
  IonList,
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonBadge,
  IonIcon,
  IonButton,
  NavContext,
  IonItemDivider,
  IonHeader,
  IonToolbar,
} from '@ionic/react';
import savedSamples from 'models/collections/samples';
import Sample from 'models/sample';
import userModel from 'models/user';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import VirtualList from './VirtualList';
import Map from './components/Map';
import Survey from './components/Survey';
import './styles.scss';

async function uploadAllSamples(toast: any, t: any) {
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

// https://stackoverflow.com/questions/47112393/getting-the-iphone-x-safe-area-using-javascript
const rawSafeAreaTop =
  getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
const SAFE_AREA_TOP = parseInt(rawSafeAreaTop.replace('px', ''), 10);
const LIST_PADDING = 90 + SAFE_AREA_TOP;
const LIST_ITEM_HEIGHT = 75 + 10; // 10px for padding
const LIST_ITEM_DIVIDER_HEIGHT = 38;

function bySurveyDate(sample1: Sample, sample2: Sample) {
  const date1 = new Date(sample1.attrs.date);
  const moveToTop = !date1 || date1.toString() === 'Invalid Date';
  if (moveToTop) return -1;

  const date2 = new Date(sample2.attrs.date);
  return date2.getTime() - date1.getTime();
}

function roundDate(date: number) {
  let roundedDate = date - (date % (24 * 60 * 60 * 1000)); // subtract amount of time since midnight
  roundedDate += new Date().getTimezoneOffset() * 60 * 1000; // add on the timezone offset
  return new Date(roundedDate);
}

const getSurveys = (surveys: Sample[], showUploadAll?: boolean) => {
  const dates: any = [];
  const dateIndices: any = [];

  const groupedSurveys: any = [];
  let counter: any = {};

  [...surveys].forEach(survey => {
    const date = roundDate(new Date(survey.attrs.date).getTime()).toString();
    if (!dates.includes(date) && date !== 'Invalid Date') {
      dates.push(date);
      dateIndices.push(groupedSurveys.length);
      counter = { date, count: 0 };
      groupedSurveys.push(counter);
    }

    counter.count += 1;
    groupedSurveys.push(survey);
  });

  // eslint-disable-next-line react/no-unstable-nested-components
  const Item: FC<{ index: number }> = ({ index, ...itemProps }) => {
    if (dateIndices.includes(index)) {
      const { date, count } = groupedSurveys[index];
      return (
        <IonItemDivider key={date} style={(itemProps as any).style} mode="ios">
          <IonLabel>{DateHelp.print(date, true)}</IonLabel>
          {count > 1 && <IonLabel slot="end">{count}</IonLabel>}
        </IonItemDivider>
      );
    }

    const sample = groupedSurveys[index];

    return (
      <Survey
        key={sample.cid}
        sample={sample}
        uploadIsPrimary={!showUploadAll}
        {...itemProps}
      />
    );
  };

  const itemCount = surveys.length + dateIndices.length;

  const getItemSize = (index: number) =>
    dateIndices.includes(index) ? LIST_ITEM_DIVIDER_HEIGHT : LIST_ITEM_HEIGHT;

  return (
    <VirtualList
      itemCount={itemCount}
      itemSize={getItemSize}
      Item={Item}
      topPadding={LIST_PADDING}
      bottomPadding={LIST_ITEM_HEIGHT / 2}
    />
  );
};

const UserSurveyComponent: FC = () => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const { t } = useTranslation();

  const [segment, setSegment] = useState('pending');

  const onSegmentClick = (e: any) => setSegment(e.detail.value);
  const getSamplesList = (uploaded?: boolean) => {
    const byUploadStatus = (sample: Sample) =>
      uploaded ? sample.metadata.syncedOn : !sample.metadata.syncedOn;

    return savedSamples.filter(byUploadStatus).sort(bySurveyDate);
  };

  const onUploadAll = () => {
    const isLoggedIn = userModel.isLoggedIn();
    if (!isLoggedIn) {
      navigate(`/user/login`);
      return null;
    }

    return uploadAllSamples(toast, t);
  };

  const isFinished = (sample: Sample) => sample.metadata.saved;
  const hasManyPending = () => getSamplesList().filter(isFinished).length > 4;

  const getUploadedSurveys = () => {
    const surveys = getSamplesList(true);

    if (!surveys.length) {
      return (
        <IonList>
          <InfoBackgroundMessage>No uploaded surveys</InfoBackgroundMessage>
        </IonList>
      );
    }

    return <IonList>{getSurveys(surveys)}</IonList>;
  };

  const getPendingSurveys = () => {
    const surveys = getSamplesList(false);

    if (!surveys.length) {
      return (
        <IonList>
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

    const showUploadAll = hasManyPending();

    return (
      <IonList>
        {getSurveys(surveys, showUploadAll)}

        {showUploadAll && (
          <IonButton
            expand="block"
            size="small"
            className="upload-all-button"
            onClick={onUploadAll}
          >
            Upload All
          </IonButton>
        )}
      </IonList>
    );
  };

  const showingPending = segment === 'pending';
  const showingUploaded = segment === 'uploaded';
  const showingMap = segment === 'map';

  // const pendingSurveys = getSamplesList(false);
  // const uploadedSurveys = getSamplesList(true);

  const getPendingSurveysCount = () => {
    const pendingSurveys = getSamplesList();

    if (!pendingSurveys.length) {
      return null;
    }

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
        {showingPending && getPendingSurveys()}

        {showingUploaded && getUploadedSurveys()}

        {showingMap && <Map />}
      </Main>
    </Page>
  );
};

export default observer(UserSurveyComponent);
