import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { device, Button, VirtualList, ItemProps, Badge } from '@flumens';
import {
  IonList,
  IonItem,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import TaxonList from 'common/models/taxonList';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

// https://stackoverflow.com/questions/47112393/getting-the-iphone-x-safe-area-using-javascript
const rawSafeAreaTop =
  getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
const SAFE_AREA_TOP = parseInt(rawSafeAreaTop.replace('px', ''), 10);
const LIST_PADDING = 80 + SAFE_AREA_TOP;
const LIST_ITEM_HEIGHT = 73 + 10; // 10px for padding

type Data = {
  lists: TaxonList[];
  onInstall: (list: TaxonList) => void;
};

const Item = ({ index, style, data }: ItemProps<Data>) => {
  const lists: TaxonList[] = data.lists;
  const onInstall: any = data.onInstall;

  const list: TaxonList = lists[index];

  const handleInstallClick = () => onInstall(list);

  return (
    <IonItem
      key={list.id}
      style={style}
      className="max-h-[73px] rounded-md border border-solid border-neutral-300 [--min-height:73px] [--inner-padding-end:5px]"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="min-w-0 flex-1 overflow-hidden">
          <h2 className="line-clamp-1 font-bold mt-0.5">{list.data.title}</h2>
          <div className="flex gap-1">
            <Badge size="small">{`${list.getSize()}`} species</Badge>
            {list.data.type !== 'list' && (
              <Badge size="small">{list.data.type.replaceAll('_', ' ')}</Badge>
            )}
          </div>
        </div>

        <Button
          fill="outline"
          className="mx-1 shrink-0 px-3 py-1 text-sm"
          onPress={handleInstallClick}
        >
          Install
        </Button>
      </div>
    </IonItem>
  );
};

type Props = {
  onInstall: (list: TaxonList) => void;
  onRefresh: () => void;
  lists: TaxonList[];
};

const AllLists = ({ onInstall, lists, onRefresh }: Props) => {
  const listsMemo = useMemo(() => ({ lists, onInstall }), [lists, onInstall]);

  if (!device.isOnline) {
    return (
      <InfoBackgroundMessage className="mt-20">
        You need to be online to browse species lists.
        <br />
        <br />
        Please connect to the internet and try again.
      </InfoBackgroundMessage>
    );
  }

  const onListRefreshPull = (e: any) => {
    onRefresh();
    e?.detail?.complete(); // refresh pull update
  };

  return (
    <>
      <IonRefresher slot="fixed" onIonRefresh={onListRefreshPull}>
        <IonRefresherContent />
      </IonRefresher>

      {!lists.length && (
        <InfoBackgroundMessage className="mt-20">
          No species lists found.
        </InfoBackgroundMessage>
      )}

      {!!lists.length && (
        <IonList className="h-full">
          <VirtualList
            rowCount={lists.length}
            rowHeight={() => LIST_ITEM_HEIGHT}
            rowProps={listsMemo}
            Item={Item}
            topPadding={LIST_PADDING}
            bottomPadding={LIST_ITEM_HEIGHT / 2}
          />
        </IonList>
      )}
    </>
  );
};

export default observer(AllLists);
