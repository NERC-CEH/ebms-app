import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { InfoBackgroundMessage, date as DateHelp } from '@flumens';
import { IonItemDivider, IonLabel, IonList } from '@ionic/react';
import savedSamples from 'models/collections/samples';
import Sample, { bySurveyDate } from 'models/sample';
import VirtualList from '../../VirtualList';
import Survey from '../Survey';
import fetchRemoteSamples from './service';

// https://stackoverflow.com/questions/47112393/getting-the-iphone-x-safe-area-using-javascript
const rawSafeAreaTop =
  getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
const SAFE_AREA_TOP = parseInt(rawSafeAreaTop.replace('px', ''), 10);
const LIST_PADDING = 90 + SAFE_AREA_TOP;
const LIST_ITEM_HEIGHT = 75 + 10; // 10px for padding
const LIST_ITEM_DIVIDER_HEIGHT = 38;

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

const Uploaded: FC = () => {
  const uploaded = (sample: Sample) => sample.metadata.syncedOn;
  const savedUploadedSamples = savedSamples.filter(uploaded).sort(bySurveyDate);

  const fetchRemoteSamplesFirstTime = () => {
    (async () => {
      const remoteSamples = await fetchRemoteSamples();

      const notCached = (sample: Sample) => {
        const isSaved = !savedSamples.find(
          (savedSample: Sample) => savedSample.id === sample.id
        );
        return isSaved;
      };
      const uniqueRemoteSamples = remoteSamples.filter(notCached);

      savedSamples.push(...uniqueRemoteSamples);
    })();
  };
  useEffect(fetchRemoteSamplesFirstTime, []);

  if (!savedUploadedSamples.length) {
    return (
      <IonList>
        <InfoBackgroundMessage>No uploaded surveys</InfoBackgroundMessage>
      </IonList>
    );
  }

  return <IonList>{getSurveys(savedUploadedSamples)}</IonList>;
};

export default observer(Uploaded);
