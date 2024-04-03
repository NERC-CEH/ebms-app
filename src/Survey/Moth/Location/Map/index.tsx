import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { MapContainer } from '@flumens';
import { IonSpinner } from '@ionic/react';
import MothTrap from 'models/location';
import Sample, { MothTrapLocation } from 'models/sample';
import BottomSheet from './BottomSheet';
import Map from './Map';
import Traps from './Traps';
import './styles.scss';

interface Props {
  sample: Sample;
  isFetchingTraps: boolean | null;
  isDisabled?: boolean;
  mothTraps: MothTrap[];
  onLocationSelect: any;
  onLocationDelete: any;
  onLocationUpload: any;
  onLocationCreate: any;
}

const MapComponent: FC<Props> = ({
  sample,
  mothTraps,
  isFetchingTraps,
  isDisabled,
  onLocationSelect,
  onLocationDelete,
  onLocationUpload,
  onLocationCreate,
}) => {
  // dynamic center when the user moves the map manually
  const [currentMapCenter, setMapCurrentCenter] = useState([51, -1]);

  const onLocationMapSelect = (point: any) => {
    const byId = (trap: MothTrap) => trap.id === point.properties.id;
    const newTrap = mothTraps.find(byId);
    if (!newTrap) return;

    onLocationSelect(newTrap);
  };

  const location = sample.attrs.location as MothTrapLocation | undefined;

  return (
    <>
      <Map
        location={location?.attrs.location}
        onMovedCoords={setMapCurrentCenter}
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
