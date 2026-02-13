import { observer } from 'mobx-react';
import { addCircleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Main,
  Button,
  useAlert,
  MenuAttrItem,
  getRelativeDate,
} from '@flumens';
import {
  IonList,
  IonIcon,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import Sample from 'models/sample';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import { Data, SubSmpData } from '../config';

function roundDate(date: number) {
  let roundedDate = date - (date % (24 * 60 * 60 * 1000)); // subtract amount of time since midnight
  roundedDate += new Date().getTimezoneOffset() * 60 * 1000; // add on the timezone offset
  return new Date(roundedDate);
}

const useDeleteTrapVisit = () => {
  const alert = useAlert();

  return async (subSample: Sample<SubSmpData>) => {
    const deleteWrap = () => subSample.destroy();

    await alert({
      header: 'Delete',
      message: 'Are you sure you want to remove this entry?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: deleteWrap },
      ],
    });
  };
};

type Props = {
  sample: Sample<Data>;
  onAddTrapVisit: () => void;
};

const HomeMain = ({ sample, onAddTrapVisit }: Props) => {
  const { url } = useRouteMatch();

  const deleteTrapVisit = useDeleteTrapVisit();

  const { isDisabled } = sample;

  const trapVisits: Sample<SubSmpData>[] = sample.samples || [];

  // build flat array with date dividers and trap visits
  type DateDivider = {
    type: 'divider';
    date: string;
    count: number;
  };

  type TrapVisitItem = {
    type: 'visit';
    visit: Sample<SubSmpData>;
  };

  type ListItem = DateDivider | TrapVisitItem;

  const listItems: ListItem[] = [];

  const groupedByDate = new Map<string, Sample<SubSmpData>[]>();

  [...trapVisits]
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    )
    .forEach(trapVisit => {
      const date = roundDate(
        new Date(trapVisit.data.date).getTime()
      ).toString();

      if (date === 'Invalid Date') return;

      const visits = groupedByDate.get(date) || [];
      visits.push(trapVisit);
      groupedByDate.set(date, visits);
    });

  groupedByDate.forEach((visits, date) => {
    listItems.push({ type: 'divider', date, count: visits.length });
    visits.forEach(visit => {
      listItems.push({ type: 'visit', visit });
    });
  });

  const getListItem = (item: ListItem) => {
    if (item.type === 'divider') {
      return (
        <div
          key={item.date}
          className="flex justify-between items-center rounded-md text-primary-900 font-semibold px-3 bg-primary-800/10"
        >
          <div>{getRelativeDate(item.date)}</div>
          {item.count > 1 && <div>{item.count}</div>}
        </div>
      );
    }

    const { visit: trapVisit } = item;

    const occCount = trapVisit.occurrences?.length || 0;
    const trapName = trapVisit.data.location?.name || 'Trap visit';

    return (
      <IonItemSliding
        key={trapVisit.cid}
        className="rounded-md overflow-hidden"
      >
        <IonItem
          routerLink={`${url}/traps/${trapVisit.cid}`}
          detail={!isDisabled}
          className="[--border-style:none]"
        >
          <div className="flex gap-2 justify-between items-center w-full py-3">
            <div className="line-clamp-2">{trapName}</div>
            <div>{occCount} species</div>
          </div>
        </IonItem>

        {!isDisabled && (
          <IonItemOptions side="end">
            <IonItemOption
              color="danger"
              onClick={() => deleteTrapVisit(trapVisit)}
            >
              <T>Delete</T>
            </IonItemOption>
          </IonItemOptions>
        )}
      </IonItemSliding>
    );
  };

  return (
    <Main className="ion-padding">
      <IonList lines="full">
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${url}/details`}
            label="Survey details"
            disabled={isDisabled}
          />
        </div>
      </IonList>

      <Button
        color="primary"
        className="mx-auto mt-10"
        onPress={onAddTrapVisit}
        isDisabled={isDisabled}
        prefix={<IonIcon src={addCircleOutline} className="size-5" />}
      >
        Add trap visit
      </Button>

      {trapVisits.length === 0 && (
        <InfoBackgroundMessage>No trap visits added</InfoBackgroundMessage>
      )}

      {trapVisits.length > 0 && (
        <div className="flex flex-col gap-3 m-2 mt-10">
          {listItems.map(getListItem)}
        </div>
      )}
    </Main>
  );
};

export default observer(HomeMain);
