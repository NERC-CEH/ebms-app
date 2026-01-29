import { useContext } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import {
  pinOutline,
  arrowForwardOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { useAlert } from '@flumens';
import {
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  NavContext,
  IonItem,
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

type Props = {
  mothTrap: MothTrap;
  updateRecord: (mothTrap: MothTrap) => void;
  deleteTrap: (mothTrap: MothTrap) => void;
  onUpload: (mothTrap: MothTrap) => void;
  distance: number;
  isSelected?: boolean;
};

const MothTrapEntry = ({
  mothTrap,
  distance,
  updateRecord,
  isSelected,
  deleteTrap,
  onUpload,
}: Props) => {
  const { navigate } = useContext(NavContext);

  const location = mothTrap.data?.location;
  const setLocation = () => updateRecord(mothTrap);
  const onDeleteWrap = () => deleteTrap(mothTrap);
  const onUploadWrap = () => onUpload(mothTrap);
  const showDeletePrompt = useDeleteTrapPrompt(onDeleteWrap);

  const { isDraft } = mothTrap;
  const label = location?.name || <T>Draft</T>;

  const isUploading = mothTrap.isSynchronising;

  const onClick = () => {
    if (!isDraft) {
      setLocation();
      return;
    }

    if (!isUploading && !isSelected) navigate(`/location/${mothTrap.cid}`);
  };

  return (
    <IonItemSliding className="rounded-md">
      <IonItem
        className={clsx(
          'relative flex h-16 rounded-md border border-solid bg-white px-4 py-2 [--border-style:none] [--inner-padding-end:0] [--padding-start:0]',
          isSelected
            ? 'border-[var(--form-value-color)] text-[var(--form-value-color)]'
            : 'border-neutral-200'
        )}
        onClick={onClick}
      >
        <div
          className={clsx(
            'absolute left-0 top-0 h-full w-full opacity-0',
            'bg-[var(--form-value-color)]',
            isSelected && 'opacity-[2%]',
            'transition-[opacity] duration-150'
          )}
        />

        <div className="z-10 flex w-full items-center justify-start gap-4">
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
            <IonIcon icon={checkmarkOutline} className="size-10" />
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
