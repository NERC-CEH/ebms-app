import { FC, useState } from 'react';
import { observer } from 'mobx-react';
// eslint-disable-next-line
import { MapContainer } from '@flumens';
import { IonSpinner } from '@ionic/react';
import { Locations } from 'models/collections/locations';
import MothTrap from 'models/location';
import Sample from 'models/sample';
import BottomSheet from '../BottomSheet';
import Map from './Map';
import Traps from './Traps';
import './styles.scss';

interface Props {
  sample: Sample;
  isFetchingTraps: boolean | null;
  isDisabled?: boolean;
  locations: Locations;
  onLocationSelect: any;
  onLocationDelete: any;
  onLocationUpload: any;
}

const MapComponent: FC<Props> = ({
  sample,
  locations,
  isFetchingTraps,
  isDisabled,
  onLocationSelect,
  onLocationDelete,
  onLocationUpload,
}) => {
  // dynamic center when the user moves the map manually
  const [currentMapCenter, setMapCurrentCenter] = useState([51, -1]);

  const onLocationMapSelect = (point: any) => {
    const byId = (trap: MothTrap) => trap.id === point.properties.id;
    const newTrap = locations.find(byId);
    if (!newTrap) return;

    onLocationSelect(newTrap);
  };

  return (
    <>
      <Map
        location={sample.attrs.location?.attrs?.location}
        onMovedCoords={setMapCurrentCenter}
      >
        <Traps
          onSelect={onLocationMapSelect}
          mothTraps={locations}
          sample={sample}
        />
        <MapContainer.Control>
          {!isFetchingTraps ? <IonSpinner /> : <div />}
        </MapContainer.Control>
      </Map>

      {!isDisabled && (
        <BottomSheet
          mothTraps={locations}
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
