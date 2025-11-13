import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Button, useAlert } from '@flumens';
import {
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import SpeciesList from 'common/models/speciesList';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

function useShowDeletePopup() {
  const alert = useAlert();

  const showDeletePopup = (onDelete: any) =>
    alert({
      header: 'Delete',
      message: 'Are you sure you want to delete the list?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: onDelete,
        },
      ],
    });

  return showDeletePopup;
}

type Props = {
  lists: SpeciesList[];
  onReinstall: (list: SpeciesList) => void;
  onDelete: (list: SpeciesList) => void;
};

const InstalledLists = ({ lists, onReinstall, onDelete }: Props) => {
  const showDeletePopup = useShowDeletePopup();

  if (!lists.length) {
    return (
      <InfoBackgroundMessage className="mt-20">
        <T>No species lists installed</T>
        <br />
        <br />
        <T>
          Browse the "Nearby" or "All Lists" tabs to install species lists for
          offline use.
        </T>
      </InfoBackgroundMessage>
    );
  }

  const getListItem = (list: SpeciesList) => {
    const handleRefresh = () => onReinstall(list);
    const handleDelete = () => showDeletePopup(() => onDelete(list));

    return (
      <IonItemSliding
        key={list.cid}
        className="mb-2 rounded-md border border-solid border-neutral-300"
      >
        <IonItem className="max-h-[73px] [--min-height:73px]">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 font-bold">
                {list.data.title || list.data.description}
              </h2>
              <p className="line-clamp-1 text-sm opacity-70">
                {list.getSize()} species
              </p>
            </div>

            <Button
              fill="outline"
              className="mx-1 shrink-0 px-3 py-1 text-sm"
              onPress={handleRefresh}
            >
              Refresh
            </Button>
          </div>
        </IonItem>

        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={handleDelete}>
            <T>Delete</T>
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    );
  };

  return (
    <IonList className="full mt-20" lines="none">
      {lists.map(getListItem)}
    </IonList>
  );
};

export default observer(InstalledLists);
