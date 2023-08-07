import { FC, useContext, useState } from 'react';
import { observer } from 'mobx-react';
// eslint-disable-next-line
import { device, MapContainer, useToast } from '@flumens';
import { IonSpinner, NavContext } from '@ionic/react';
import locationsCollection from 'models/collections/locations';
import MothTrap, { useValidateCheck } from 'models/location';
import Sample from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import BottomSheet from '../BottomSheet';
import Map from './Map';
import Traps from './Traps';
import './styles.scss';

interface Props {
  sample: Sample;
  isFetchingTraps: boolean | null;
  isDisabled?: boolean;
  locations: typeof locationsCollection;
}

const MapComponent: FC<Props> = ({
  sample,
  locations: mothTraps,
  isFetchingTraps,
  isDisabled,
}) => {
  const { goBack } = useContext(NavContext);
  const validateLocation = useValidateCheck();
  const checkUserStatus = useUserStatusCheck();
  const toast = useToast();

  // dynamic center when the user moves the map manually
  const [currentMapCenter, setMapCurrentCenter] = useState([51, -1]);

  const onLocationSelect = (newTrap: MothTrap) => {
    if (isDisabled) return;

    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = newTrap;
    sample.save();

    goBack();
  };

  const onLocationMapSelect = (point: any) => {
    const byId = (trap: MothTrap) => trap.id === point.properties.id;
    const newTrap = mothTraps.find(byId);
    if (!newTrap) return;

    onLocationSelect(newTrap);
  };

  const onLocationDelete = (location: MothTrap) => {
    location.destroy();
  };

  const onLocationUpload = async (location: MothTrap) => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const invalids = validateLocation(location);
    if (invalids) return;

    location.saveRemote().catch(toast.error);
  };

  return (
    <>
      <Map
        location={sample.attrs.location?.attrs?.location}
        onMovedCoords={setMapCurrentCenter}
      >
        <Traps
          onSelect={onLocationMapSelect}
          mothTraps={mothTraps}
          sample={sample}
        />
        <MapContainer.Control>
          {!isFetchingTraps ? <IonSpinner /> : <div />}
        </MapContainer.Control>
      </Map>

      {!isDisabled && (
        <BottomSheet
          mothTraps={mothTraps}
          centroid={currentMapCenter}
          updateRecord={onLocationSelect}
          deleteTrap={onLocationDelete}
          uploadTrap={onLocationUpload}
          sample={sample}
        />
      )}
    </>
  );
};

export default observer(MapComponent);
