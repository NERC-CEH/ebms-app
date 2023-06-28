import { FC, useContext, useState } from 'react';
import { observer } from 'mobx-react';
// eslint-disable-next-line
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import { device, useToast } from '@flumens';
import { NavContext } from '@ionic/react';
import locationsCollection from 'models/collections/locations';
import MothTrap, { useValidateCheck } from 'models/location';
import Sample from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import BottomSheet from '../BottomSheet';
import Map from './Components/Map';
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

  const onLocationSelect = (point: MothTrap) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = point;
    sample.save();

    goBack();
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
        sample={sample}
        isFetchingTraps={isFetchingTraps}
        mothTraps={mothTraps}
        onLocationSelect={onLocationSelect}
        onMovedCoords={setMapCurrentCenter}
        isDisabled={isDisabled}
      />

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
