import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import InfiniteLoader from 'react-window-infinite-loader';
import { InfoBackgroundMessage, date as DateHelp, device } from '@flumens';
import {
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/react';
import samplesCollection, {
  samplesCollectionById,
} from 'models/collections/samples';
import Sample, { bySurveyDate } from 'models/sample';
import userModel from 'models/user';
import VirtualList from '../../VirtualList';
import Survey from '../Survey';
import fetchRemoteSamples from './service';
import './styles.scss';

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

const PAGE_SIZE = 50;

const cachedSurveysIds = new Set();

let cachedPages = 0;
let reachedBottom = false;
let isRefreshEnabled = true;

const canFetch = () => userModel.isLoggedIn() && device.isOnline;

const Uploaded: FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const uploaded = (sample: Sample) => sample.metadata.syncedOn;
  const uploadedSurveys = samplesCollection.filter(uploaded).sort(bySurveyDate);

  const surveys = canFetch()
    ? uploadedSurveys.slice(0, cachedPages * PAGE_SIZE) // use a window of local+cached surveys + buffer of 1 for loading extra page
    : uploadedSurveys;

  const fetchSurveys = async (from: number) => {
    if (!canFetch()) return;

    setIsLoading(true);
    try {
      const remoteSamples = await fetchRemoteSamples(from);
      if (remoteSamples.length < PAGE_SIZE) {
        reachedBottom = true;
      }
      const notCached = (sample: Sample) =>
        !samplesCollectionById.has(sample.cid);
      const uniqueRemoteSamples = remoteSamples.filter(notCached);

      samplesCollection.push(...uniqueRemoteSamples);
      cachedPages++;
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const fetchRemoteSamplesFirstTime = () => {
    if (cachedPages) return; // if the view revisited
    fetchSurveys(0);
  };
  useEffect(fetchRemoteSamplesFirstTime, []);

  const dates: any = [];
  const dateIndices: any = [];

  const groupedSurveys: any = [];
  let counter: any = {};

  const extraxtDates: (
    value: any,
    index: number,
    array: any[]
  ) => void = survey => {
    const date = roundDate(new Date(survey.attrs.date).getTime()).toString();
    if (!dates.includes(date) && date !== 'Invalid Date') {
      dates.push(date);
      dateIndices.push(groupedSurveys.length);
      counter = { date, count: 0 };
      groupedSurveys.push(counter);
    }

    counter.count += 1;
    groupedSurveys.push(survey);
  };
  [...surveys].forEach(extraxtDates);

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
    if (!sample)
      return (
        <IonItem detail={false} {...itemProps} className="survey-list-loader">
          <div>
            <IonSpinner />
          </div>
        </IonItem>
      );

    return <Survey key={sample.cid} sample={sample} {...itemProps} />;
  };

  const buffer = reachedBottom || !canFetch() ? 0 : 1; // extra one for spinner
  const itemCount = surveys.length + dateIndices.length + buffer;

  const getItemSize = (index: number) =>
    dateIndices.includes(index) ? LIST_ITEM_DIVIDER_HEIGHT : LIST_ITEM_HEIGHT;

  useEffect(() => {
    isRefreshEnabled = true;
  }, []);

  const onScroll = ({ scrollDirection, scrollOffset }: any) => {
    isRefreshEnabled = scrollDirection === 'backward' && scrollOffset < 80;
  };

  const loadMoreItems = (from: number, to: number) => {
    if (cachedPages * PAGE_SIZE < to && !isLoading) {
      fetchSurveys(cachedPages * PAGE_SIZE);
    }
  };

  const isItemLoaded = (index: any) => {
    if (dateIndices.includes(index)) return true;
    const sample = groupedSurveys[index];
    return !!sample;
  };

  if (!surveys.length && !isLoading) {
    return (
      <IonList>
        <InfoBackgroundMessage>No uploaded surveys</InfoBackgroundMessage>
      </IonList>
    );
  }

  const onListRefreshPull = async (e: any) => {
    if (!isRefreshEnabled) {
      e?.detail?.complete();
      return;
    }

    cachedPages = 0;
    reachedBottom = false;

    cachedSurveysIds.clear();
    fetchRemoteSamplesFirstTime();

    e?.detail?.complete(); // refresh pull update
  };

  return (
    <>
      <IonRefresher
        slot="fixed"
        onIonRefresh={onListRefreshPull}
        style={{ top: LIST_PADDING / 2 }}
      >
        <IonRefresherContent />
      </IonRefresher>

      <IonList>
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMoreItems}
        >
          {({ onItemsRendered, ref }: any) => (
            <VirtualList
              ref={ref}
              onItemsRendered={onItemsRendered}
              itemCount={itemCount}
              itemSize={getItemSize}
              Item={Item}
              topPadding={LIST_PADDING}
              bottomPadding={LIST_ITEM_HEIGHT / 2}
              onScroll={onScroll}
            />
          )}
        </InfiniteLoader>
      </IonList>
    </>
  );
};

export default observer(Uploaded);
