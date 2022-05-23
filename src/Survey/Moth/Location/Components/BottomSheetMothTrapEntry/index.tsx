import React, { FC } from 'react';
import {
  IonLabel,
  IonIcon,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { alert } from '@apps';
import {
  pinOutline,
  arrowForwardOutline,
  checkboxOutline,
} from 'ionicons/icons';
import MothTrap from 'common/models/location';
import { observer } from 'mobx-react';
import { Trans as T, useTranslation } from 'react-i18next';
import OnlineStatus from './OnlineStatus';
import './styles.scss';

function useDeleteTrapPrompt(onDelete: any) {
  const { t } = useTranslation();

  const showPrompt = () =>
    alert({
      header: t('Delete'),
      message: t('Are you sure you want to delete this moth trap?'),
      buttons: [
        {
          text: t('Cancel'),
          role: 'cancel',
          cssClass: 'primary',
        },
        {
          text: t('Delete'),
          cssClass: 'secondary',
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
        className="box-container"
        onClick={onClick}
        routerLink={link}
        detail={false}
        disabled={isUploading || isSelected}
      >
        <div className="box">
          <div className="icon">
            <IonIcon icon={pinOutline} slot="start" />
          </div>

          <div className="label">
            <h4>{label}</h4>

            {location?.latitude && (
              <IonLabel position="stacked" mode="ios">
                <IonLabel>
                  <T>Lat</T>: {location.latitude.toFixed(3)}, <T>Long</T>:{' '}
                  {location.longitude.toFixed(3)}
                </IonLabel>
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
