import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Badge, Button, useAlert } from '@flumens';
import {
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import TaxonList from 'common/models/taxonList';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import RelativeDate from 'Components/RelativeDate';

function useShowDeletePopup() {
  const alert = useAlert();

  const showDeletePopup = (onDelete: () => void) =>
    alert({
      header: 'common.delete',
      message: 'lists.confirmDeleteList',
      buttons: [
        {
          text: 'common.cancel',
          role: 'cancel',
        },
        {
          text: 'common.delete',
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
      <InfoBackgroundMessage className="mt-20" skipTranslation>
        <T i18nKey="lists.noInstalled">
          No species lists installed.
          <br />
          <br />
          Browse the "Nearby" or "All Lists" tabs to install species lists for
          offline use.
        </T>
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
                <Badge size="small" skipTranslation>
                  {list.getSize()} <T>common.speciesLower</T>
                </Badge>
                <Badge size="small" skipTranslation>
                  <RelativeDate date={list.updatedAt} />
                </Badge>
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
              common.refresh
            </Button>
          </div>
        </IonItem>

        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={handleDelete}>
            <T>common.delete</T>
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
