import { createRef, useState } from 'react';
import { observer } from 'mobx-react';
import { useAlert, string as StringHelp } from '@flumens';
import { IonList } from '@ionic/react';
import turf from '@turf/distance';
import appModel from 'models/app';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import EditModal from './EditModal';
import Entry from './Entry';

/**
 * Sort the past locations placing favourites to the top.
 */

const byFavouriteAndDistance = (
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

const HistoricalLocations = ({ onSelect, position }: Props) => {
  const [editLocation, setEditLocation] = useState<Location>(null);

  const showDeletePopup = useShowDeletePopup();

  const deleteLocation = (locationId: LocationID) => {
    const onDelete = () => appModel.removeLocation(locationId);
    showDeletePopup(onDelete);
  };

  const locations = appModel.data.locations || [];

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

  const edit = (locationId: LocationID) => {
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

  const getEntry = ([location, distance]: any) => (
    <Entry
      key={location.id}
      distance={distance}
      location={location}
      onDelete={deleteLocation}
      onSelect={selectLocation}
      onEdit={edit}
    />
  );

  const getTrackWithDistance = (track: any) => {
    if (!track?.latitude) return [track, 0];

    const { latitude, longitude } = track || {};

    const from = [longitude, latitude]; // turf long, lat first
    const to = [...position].reverse();
    const distance = turf(from, to, { units: 'kilometers' });

    return [track, parseFloat(distance.toFixed(2))];
  };

  const entries = [...locations]
    .map(getTrackWithDistance)
    .sort(byFavouriteAndDistance)
    .map(getEntry);

  return (
    <>
      {editLocation && (
        <EditModal location={editLocation} onLocationSave={onSave} />
      )}

      <IonList className="mt-2 flex flex-col gap-2" ref={listRef}>
        {entries.length ? (
          entries
        ) : (
          <InfoBackgroundMessage>
            You have no previous tracks.
          </InfoBackgroundMessage>
        )}
      </IonList>
    </>
  );
};

export default observer(HistoricalLocations);
