import React, { FC } from 'react';
import L from 'leaflet';
import { Marker as LeafletMarker, Popup } from 'react-leaflet';
import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import { locationOutline, eyeOutline } from 'ionicons/icons';
import { Point } from 'common/types';
import './styles.scss';

interface Props {
  point: Point;
  updateRecord: (point: Point) => void;
  isCurrentlySelected: boolean;
}

const Marker: FC<Props> = ({ point, updateRecord, isCurrentlySelected }) => {
  const { latitude, longitude } = point;

  const selectedMarker = isCurrentlySelected ? 'selected' : '';

  const getIcon = () =>
    L.divIcon({
      className: `my-custom-pin ${selectedMarker}`,
      html: `<span />`,
    });

  const showPopup = () => {
    updateRecord(point);
  };

  return (
    <LeafletMarker icon={getIcon()} position={[latitude, longitude]}>
      <Popup>
        <div>
          <IonIcon icon={locationOutline} />
          <div>
            <IonLabel>Wallingford</IonLabel>
          </div>
        </div>
        <div>
          <IonIcon icon={eyeOutline} />
          <div>
            <IonLabel>LED light</IonLabel>
          </div>
        </div>

        {!isCurrentlySelected && (
          <IonButton onClick={showPopup}>Select</IonButton>
        )}
      </Popup>
    </LeafletMarker>
  );
};

export default Marker;
