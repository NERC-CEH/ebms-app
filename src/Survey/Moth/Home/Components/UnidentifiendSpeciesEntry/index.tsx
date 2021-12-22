import React, { FC, useContext } from 'react';
import Occurrence from 'models/occurrence';
import {
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonSpinner,
  IonIcon,
  NavContext,
  IonButton,
} from '@ionic/react';
import { alert } from '@apps';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import mothIcon from 'common/images/moth.svg';
import './styles.scss';

function deleteOccurrence(occ: typeof Occurrence) {
  alert({
    header: 'Delete',
    skipTranslation: true,
    message: 'Are you sure you want to remove this entry from your survey?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'Delete',
        cssClass: 'danger',
        handler: () => occ.destroy(),
      },
    ],
  });
}

interface Props {
  occ: typeof Occurrence;
  isDisabled: boolean;
  isUnidentifiedSpeciesLengthMoreThanFive: boolean;
  onIdentify: any;
}

const UnidentifiedSpeciesEntry: FC<Props> = ({
  occ,
  isDisabled,
  isUnidentifiedSpeciesLengthMoreThanFive,
  onIdentify,
}) => {
  const { navigate } = useContext(NavContext);
  const { url } = useRouteMatch();
  const [hasSpeciesPhoto] = occ.media;
  const identifying = hasSpeciesPhoto?.identification?.identifying;
  const speciesNeverBeenIdentified = !hasSpeciesPhoto?.attrs?.species;
  const speciesName = occ.getTaxonName();

  const getProfilePhoto = () => {
    const photo = hasSpeciesPhoto ? (
      <img src={hasSpeciesPhoto.getURL()} />
    ) : (
      <IonIcon icon={mothIcon} />
    );

    return <div className="profile-photo">{photo}</div>;
  };

  const deleteOccurrenceWrap = () => deleteOccurrence(occ);

  const navigateToSpeciesOccurrence = () =>
    !identifying && navigate(`${url}/occ/${occ.cid}`);

  const onIdentifyOccurrence = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    return onIdentify(occ);
  };

  const buttonStyles = isUnidentifiedSpeciesLengthMoreThanFive
    ? 'outline'
    : 'solid';

  return (
    <IonItemSliding
      className="species-list-item unknown"
      disabled={identifying}
      key={occ.cid}
    >
      <IonItem detail={!identifying} onClick={navigateToSpeciesOccurrence}>
        {getProfilePhoto()}

        {!identifying && (
          <div>
            <IonLabel>{speciesName}</IonLabel>

            {!hasSpeciesPhoto && (
              <IonLabel className="warning-message">
                <T>Please add a photo</T>
              </IonLabel>
            )}
          </div>
        )}

        {hasSpeciesPhoto && !identifying && speciesNeverBeenIdentified && (
          <IonButton
            slot="end"
            fill={buttonStyles}
            onClick={onIdentifyOccurrence}
          >
            <T>IDENTIFY</T>
          </IonButton>
        )}

        {identifying && (
          <>
            <IonLabel slot="end">
              <T>Identifying...</T>
            </IonLabel>
            <IonSpinner slot="end" className="identifying" />
          </>
        )}
      </IonItem>

      {!isDisabled && (
        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={deleteOccurrenceWrap}>
            Delete
          </IonItemOption>
        </IonItemOptions>
      )}
    </IonItemSliding>
  );
};

export default observer(UnidentifiedSpeciesEntry);
