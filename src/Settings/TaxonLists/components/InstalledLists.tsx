import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Badge, Button, getRelativeDate, useAlert } from '@flumens';
import {
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import TaxonList from 'common/models/taxonList';
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
  lists: TaxonList[];
  onReinstall: (list: TaxonList) => void;
  onDelete: (list: TaxonList) => void;
};

const InstalledLists = ({ lists, onReinstall, onDelete }: Props) => {
  const showDeletePopup = useShowDeletePopup();

  if (!lists.length) {
    return (
      <InfoBackgroundMessage className="mt-20">
        No species lists installed.
        <br />
        <br />
        Browse the "Nearby" or "All Lists" tabs to install species lists for
        offline use.
      </InfoBackgroundMessage>
    );
  }

  const getListItem = (list: TaxonList) => {
    const handleRefresh = () => onReinstall(list);
    const handleDelete = () => showDeletePopup(() => onDelete(list));

    return (
      <IonItemSliding
        key={list.cid}
        className="mb-2 rounded-md border border-solid border-neutral-300"
      >
        <IonItem className="max-h-19.25 [--min-height:77px] [--inner-padding-end:5px]">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="min-w-0 flex-1 overflow-hidden">
              <h2 className="line-clamp-1 font-bold mt-0!">
                {list.data.title || list.data.description}
              </h2>

              <div className="flex gap-2">
                <Badge size="small">{`${list.getSize()}`} species</Badge>
                <Badge size="small">{getRelativeDate(list.updatedAt)}</Badge>
                {list.data.type !== 'list' && (
                  <Badge size="small">
                    {list.data.type.replaceAll('_', ' ')}
                  </Badge>
                )}
              </div>
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
    <IonList className="full mt-20!" lines="none">
      {lists.map(getListItem)}
    </IonList>
  );
};

export default observer(InstalledLists);
