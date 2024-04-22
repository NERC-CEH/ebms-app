import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Badge, Button, useAlert } from '@flumens';
import {
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonSpinner,
  IonIcon,
  NavContext,
} from '@ionic/react';
import mothIcon from 'common/images/moth.svg';
import Media from 'models/media';
import Occurrence from 'models/occurrence';
import { useUserStatusCheck } from 'models/user';
import './styles.scss';

function useDeleteOccurrencePrompt(occ: Occurrence) {
  const alert = useAlert();

  const showPrompt = () => {
    alert({
      header: 'Delete',
      skipTranslation: true,
      message: 'Are you sure you want to remove this entry from your survey?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => occ.destroy(),
        },
      ],
    });
  };

  return showPrompt;
}

interface Props {
  occ: Occurrence;
  isDisabled: boolean;
  isUnidentifiedSpeciesLengthMoreThanFive: boolean;
  onIdentify: any;
}

const UnidentifiedSpeciesEntry = ({
  occ,
  isDisabled,
  isUnidentifiedSpeciesLengthMoreThanFive,
  onIdentify,
}: Props) => {
  const checkUserStatus = useUserStatusCheck();

  const { navigate } = useContext(NavContext);
  const { url } = useRouteMatch();
  const showDeleteOccurrencePrompt = useDeleteOccurrencePrompt(occ);

  const [hasSpeciesPhoto] = occ.media;
  const speciesName = occ.getTaxonName();

  const isIdentifying = (media: Media) => media?.identification?.identifying;
  const identifying = occ.media.some(isIdentifying);

  function canBeIdentified() {
    const hasSpeciesImageBeenIdentified = (media: Media) =>
      !media.attrs.species;

    return occ.media.some(hasSpeciesImageBeenIdentified);
  }

  const getProfilePhoto = () => {
    const photo = hasSpeciesPhoto ? (
      <img src={hasSpeciesPhoto.getURL()} />
    ) : (
      <IonIcon icon={mothIcon} />
    );

    return <div className="profile-photo">{photo}</div>;
  };

  const deleteOccurrenceWrap = () => showDeleteOccurrencePrompt();

  const navigateToSpeciesOccurrence = () =>
    !identifying && navigate(`${url}/occ/${occ.cid}`);

  const onIdentifyOccurrence = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return null;

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

        <div className="flex w-full items-center justify-between gap-2">
          <IonLabel>{speciesName}</IonLabel>
          {!identifying && (
            <div className="flex w-full items-center justify-between gap-2">
              {!hasSpeciesPhoto && (
                <Badge color="warning">Please add a photo</Badge>
              )}

              {hasSpeciesPhoto && !isDisabled && canBeIdentified() && (
                <Button
                  fill={buttonStyles}
                  onPress={onIdentifyOccurrence}
                  className="px-2 py-1 text-sm"
                  preventDefault
                >
                  Identify
                </Button>
              )}
            </div>
          )}

          {identifying && <IonSpinner className="mr-2 size-5" />}
        </div>
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
