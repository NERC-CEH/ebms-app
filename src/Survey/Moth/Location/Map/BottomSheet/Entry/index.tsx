import { observer } from 'mobx-react';
import clsx from 'clsx';
import {
  pinOutline,
  arrowForwardOutline,
  checkboxOutline,
} from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { useAlert } from '@flumens';
import {
  IonIcon,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import mothTrapIcon from 'common/images/moth-inside-icon.svg';
import MothTrap from 'common/models/location';
import OnlineStatus from './OnlineStatus';

function useDeleteTrapPrompt(onDelete: any) {
  const { t } = useTranslation();
  const alert = useAlert();

  const showPrompt = () =>
    alert({
      header: t('Delete'),
      message: t('Are you sure you want to delete this moth trap?'),
      buttons: [
        {
          text: t('Cancel'),
          role: 'cancel',
        },
        {
          text: t('Delete'),
          role: 'destructive',
          handler: onDelete,
        },
      ],
    });

  return showPrompt;
}

interface Props {
  mothTrap: MothTrap;
  updateRecord: (mothTrap: MothTrap) => void;
  deleteTrap: (mothTrap: MothTrap) => void;
  onUpload: (mothTrap: MothTrap) => void;
  distance: number;
  isSelected?: boolean;
}

const MothTrapEntry = ({
  mothTrap,
  distance,
  updateRecord,
  isSelected,
  deleteTrap,
  onUpload,
}: Props) => {
  const location = mothTrap.attrs?.location;
  const setLocation = () => updateRecord(mothTrap);
  const onDeleteWrap = () => deleteTrap(mothTrap);
  const onUploadWrap = () => onUpload(mothTrap);
  const showDeletePrompt = useDeleteTrapPrompt(onDeleteWrap);

  const isDraft = mothTrap.isDraft();
  const label = location?.name || <T>Draft</T>;

  const link = isDraft ? `/location/${mothTrap.cid}` : undefined;
  const onClick = !isDraft ? setLocation : undefined;

  const isUploading = mothTrap.remote.synchronising;

  return (
    <IonItemSliding className="rounded-md">
      <IonItem
        className={clsx(
          'flex h-16 [--inner-border-width:0] [--inner-padding-end:0] [--background:transparent]',
          isSelected ? 'bg-green-50' : 'bg-white'
        )}
        onClick={onClick}
        routerLink={!isUploading && !isSelected ? link : undefined}
        detail={false}
      >
        <div className="flex w-full items-center justify-start gap-4">
          <div className="m-1 flex items-center justify-center rounded-md bg-primary-300/20">
            <IonIcon icon={mothTrapIcon} className="size-7" />
          </div>

          <div className="flex w-full flex-col gap-1 py-1">
            <h4 className="line-clamp-2">{label}</h4>

            {location?.latitude && (
              <div className="text-xs">
                <IonIcon icon={pinOutline} />
                {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
              </div>
            )}
          </div>

          {!isDraft && !isSelected && !!distance && (
            <div className="flex flex-col items-end text-primary-700">
              <IonIcon icon={arrowForwardOutline} />
              <span className="whitespace-nowrap text-sm font-bold">
                {distance} km
              </span>
            </div>
          )}

          {!isDraft && isSelected && (
            <IonIcon icon={checkboxOutline} className="size-10 text-success" />
          )}

          {isDraft && (
            <OnlineStatus location={mothTrap} onUpload={onUploadWrap} />
          )}
        </div>
      </IonItem>

      {isDraft && (
        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={showDeletePrompt}>
            <T>Delete</T>
          </IonItemOption>
        </IonItemOptions>
      )}
    </IonItemSliding>
  );
};

export default observer(MothTrapEntry);
