import { FC, createRef, useState } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import {
  star,
  starOutline,
  resizeOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useAlert, string as StringHelp } from '@flumens';
import {
  IonList,
  IonItemOption,
  IonItem,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonIcon,
} from '@ionic/react';
import turf from '@turf/distance';
import appModel from 'models/app';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import EditModal from './EditModal';
import './styles.scss';

/**
 * Sort the past locations placing favourites to the top.
 */

const byFavoriteAndDistance = (
  [trackA, distanceA]: any,
  [trackB, distanceB]: any
) => {
  if (trackA.favourite === trackB.favourite) {
    return distanceA - distanceB;
  }
  if (trackA.favourite) {
    return -1;
  }

  return 1;
};

function useShowDeletePopup() {
  const alert = useAlert();

  const showDeletePopup = (onDelete: any) =>
    alert({
      header: 'Delete',
      message: 'Are you sure you want to delete the saved track?',
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

type Location = any;
type LocationID = any;

type Props = {
  onSelect?: any;
  position?: any;
};

const PastLocations: FC<Props> = ({ onSelect, position }) => {
  const [editLocation, setEditLocation] = useState<Location>(null);

  const showDeletePopup = useShowDeletePopup();

  const deleteLocation = (locationId: LocationID) => {
    const onDelete = () => appModel.removeLocation(locationId);
    showDeletePopup(onDelete);
  };

  const locations = appModel.attrs.locations || [];

  const listRef = createRef<any>();

  const selectLocation = (locationId: LocationID) => {
    if (!onSelect) return;

    const location = locations.find(loc => loc.id === locationId);
    const locationCopy = { ...location };
    delete locationCopy.id;
    delete locationCopy.favourite;
    delete locationCopy.date;
    onSelect(locationCopy);
  };

  const onEdit = (locationId: LocationID) => {
    listRef.current.closeSlidingItems();

    const location = locations.find(({ id }) => id === locationId);

    if (!location?.name) return;

    setEditLocation({ ...location });
  };

  const onSave = (name: string, favourite: boolean) => {
    if (!name) {
      setEditLocation(null);
      return;
    }

    const updatedLocation = { ...editLocation };
    updatedLocation.name = StringHelp.escape(name);
    updatedLocation.favourite = favourite;

    appModel.setLocation(updatedLocation);

    setEditLocation(null);
    listRef.current && listRef.current.closeSlidingItems();
  };

  const getPastLocations = () => {
    if (!locations.length)
      return (
        <InfoBackgroundMessage>
          You have no previous tracks.
        </InfoBackgroundMessage>
      );

    function getPastLocation([location, distance]: any) {
      const { id, name, favourite, area } = location;

      return (
        <IonItemSliding
          className={clsx('location', favourite && 'favourite')}
          key={id}
        >
          <IonItem
            detail
            detailIcon={favourite ? star : starOutline}
            onClick={() => selectLocation(id)}
          >
            <IonLabel className="details" position="stacked" mode="ios">
              <IonLabel slot="start">
                <strong>{name}</strong>
              </IonLabel>
              <IonLabel slot="start" className="location-raw">
                <IonIcon icon={resizeOutline} style={{ marginRight: '5px' }} />
                {area.toLocaleString()} m²
              </IonLabel>
            </IonLabel>

            <IonLabel slot="end" position="stacked" mode="ios">
              <div className="location-source">
                <span>{distance} km</span>
                <IonIcon icon={arrowForwardOutline} />
              </div>
            </IonLabel>
          </IonItem>

          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={() => deleteLocation(id)}>
              <T>Delete</T>
            </IonItemOption>
            <IonItemOption color="tertiary" onClick={() => onEdit(id)}>
              <T>Edit</T>
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    }

    const getTrackWithDistance = (track: any) => {
      if (!track?.latitude) return [track, 0];

      const { latitude, longitude } = track || {};

      const from = [longitude, latitude]; // turf long, lat first
      const to = [...position].reverse();
      const distance = turf(from, to, { units: 'kilometers' });

      return [track, parseFloat(distance.toFixed(2))];
    };

    const formattedLocations = [...locations]
      .map(getTrackWithDistance)
      .sort(byFavoriteAndDistance)
      .map(getPastLocation);

    return (
      <IonList id="user-locations" ref={listRef}>
        {formattedLocations}
      </IonList>
    );
  };

  return (
    <div className="past-locations">
      {editLocation && (
        <EditModal location={editLocation} onLocationSave={onSave} />
      )}

      {getPastLocations()}
    </div>
  );
};

export default observer(PastLocations);
