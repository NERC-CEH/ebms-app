import { FC } from 'react';
import { observer } from 'mobx-react';
import {
  pinOutline,
  arrowForwardOutline,
  checkboxOutline,
} from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { useAlert } from '@flumens';
import {
  IonLabel,
  IonIcon,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import mothTrapIcon from 'common/images/moth-inside-icon.svg';
import MothTrap from 'common/models/location';
import OnlineStatus from './OnlineStatus';
import './styles.scss';

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

const MothTrapEntry: FC<Props> = ({
  mothTrap,
  distance,
  updateRecord,
  isSelected,
  deleteTrap,
  onUpload,
}) => {
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
    <IonItemSliding>
      <IonItem
        className="moth-trap"
        onClick={onClick}
        routerLink={link}
        detail={false}
        disabled={isUploading || isSelected}
      >
        <div className="info">
          <div className="avatar">
            <IonIcon icon={mothTrapIcon} slot="start" />
          </div>

          <div className="label">
            <h4>{label}</h4>

            {location?.latitude && (
              <IonLabel>
                <IonIcon icon={pinOutline} />
                {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
              </IonLabel>
            )}
          </div>

          {!isDraft && !isSelected && distance && (
            <div className="right-slot">
              <IonIcon icon={arrowForwardOutline} />
              <span>{distance} km</span>
            </div>
          )}

          {!isDraft && isSelected && (
            <div className="right-slot selected">
              <IonIcon icon={checkboxOutline} />
            </div>
          )}

          {isDraft && (
            <div className="draft">
              <OnlineStatus location={mothTrap} onUpload={onUploadWrap} />
            </div>
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
