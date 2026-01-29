import { useState } from 'react';
import { observer } from 'mobx-react';
import { MapContainer } from '@flumens';
import { IonSpinner } from '@ionic/react';
import MothTrap from 'models/location';
import Sample from 'models/sample';
import BottomSheet from './BottomSheet';
import Map from './Map';
import Traps from './Traps';
import './styles.scss';

type Props = {
  sample: Sample;
  isFetchingTraps: boolean | null;
  isDisabled?: boolean;
  mothTraps: MothTrap[];
  onLocationSelect: any;
  onLocationDelete: any;
  onLocationUpload: any;
  onLocationCreate: any;
};

const MapComponent = ({
  sample,
  mothTraps,
  isFetchingTraps,
  isDisabled,
  onLocationSelect,
  onLocationDelete,
  onLocationUpload,
  onLocationCreate,
}: Props) => {
  // dynamic center when the user moves the map manually
  const [currentMapCenter, setCurrentMapCenter] = useState([51, -1]);

  const onLocationMapSelect = (point: any) => {
    const byId = (trap: MothTrap) => trap.id === point.properties.id;
    const newTrap = mothTraps.find(byId);
    if (!newTrap) return;

    onLocationSelect(newTrap);
  };

  const location = sample.data.location as any;

  return (
    <>
      <Map
        latitude={parseFloat(location?.data?.lat)}
        longitude={parseFloat(location?.data?.lon)}
        onMovedCoords={setCurrentMapCenter}
      >
        <Traps
          onSelect={onLocationMapSelect}
          mothTraps={mothTraps}
          sample={sample}
        />
        <MapContainer.Control>
          {isFetchingTraps ? <IonSpinner /> : <div />}
        </MapContainer.Control>
      </Map>

      {!isDisabled && (
        <BottomSheet
          isFetchingTraps={!!isFetchingTraps}
          mothTraps={mothTraps}
          centroid={currentMapCenter}
          updateRecord={onLocationSelect}
          deleteTrap={onLocationDelete}
          uploadTrap={onLocationUpload}
          createTrap={onLocationCreate}
          sample={sample}
        />
      )}
    </>
  );
};

export default observer(MapComponent);
