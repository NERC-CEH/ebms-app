import React, { FC } from 'react';
import L from 'leaflet';
import { Marker as LeafletMarker, Popup } from 'react-leaflet';
import { IonButton } from '@ionic/react';
import { Point } from 'common/types';
import './styles.scss';

interface Props {
  point: Point;
}

const Marker: FC<Props> = ({ point }) => {
  const { latitude, longitude } = point;

  const getIcon = () =>
    L.divIcon({
      className: 'my-custom-pin',
      html: `<span />`,
    });

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

          <IonButton>Select</IonButton>
        </div>
      </Popup>
    </LeafletMarker>
  );
};

export default Marker;
