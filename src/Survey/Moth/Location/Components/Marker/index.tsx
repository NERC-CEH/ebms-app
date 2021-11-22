import React, { FC } from 'react';
import L from 'leaflet';
import { Marker as LeafletMarker, Popup } from 'react-leaflet';
import { IonButton } from '@ionic/react';
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
          <p>
            <b>Location: </b>
          </p>
          <p>
            <b>Method: </b>
          </p>

          {!isCurrentlySelected && (
            <IonButton onClick={showPopup}>Select</IonButton>
          )}
        </div>
      </Popup>
    </LeafletMarker>
  );
};

export default Marker;
