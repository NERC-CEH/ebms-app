import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { device, Button, VirtualList } from '@flumens';
import {
  IonList,
  IonItem,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import SpeciesList from 'common/models/speciesList';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

// https://stackoverflow.com/questions/47112393/getting-the-iphone-x-safe-area-using-javascript
const rawSafeAreaTop =
  getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
const SAFE_AREA_TOP = parseInt(rawSafeAreaTop.replace('px', ''), 10);
const LIST_PADDING = 80 + SAFE_AREA_TOP;
const LIST_ITEM_HEIGHT = 75 + 10; // 10px for padding

const Item = ({
  index,
  data: { lists, onInstall },
  ...itemProps
}: {
  index: number;
  data: { lists: SpeciesList[]; onInstall: any };
}) => {
  const list: SpeciesList = lists[index];

  const handleInstallClick = () => onInstall(list);

  return (
    <IonItem
      key={list.id}
      style={(itemProps as any).style}
      className="max-h-[73px] rounded-md border border-solid border-neutral-300 [--min-height:73px]"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-1 font-bold">{list.data.title}</h2>
          {list.data.description && (
            <p className="line-clamp-1 text-sm opacity-70">
              {list.data.description}
            </p>
          )}
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
  onInstall: (list: SpeciesList) => void;
  onRefresh: () => void;
  lists: SpeciesList[];
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
            itemCount={lists.length}
            itemSize={() => LIST_ITEM_HEIGHT}
            itemData={listsMemo}
            Item={Item}
            topPadding={LIST_PADDING}
            bottomPadding={LIST_ITEM_HEIGHT / 2}
            // onScroll={onScroll}
          />
        </IonList>
      )}
    </>
  );
};

export default observer(AllLists);
