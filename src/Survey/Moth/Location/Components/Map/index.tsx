import React, { FC, useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { NavContext } from '@ionic/react';
import Sample from 'models/sample';
import locationsCollection from 'models/collections/locations';
import MothTrap, { useValidateCheck } from 'models/location';
import BottomSheet from '../BottomSheet';
import Map from './Components/Map';
import 'leaflet.markercluster';
import './styles.scss';
import 'leaflet/dist/leaflet.css';

interface Props {
  sample: typeof Sample;
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

  const onLocationUpload = (location: MothTrap) => {
    const invalids = validateLocation(location);
    if (invalids) return;

    location.saveRemote();
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
