import React, { FC } from 'react';
import L from 'leaflet';
import { Marker as LeafletMarker, Popup } from 'react-leaflet';
import { IonButton } from '@ionic/react';
import Sample from 'models/sample';
import { Point } from 'common/types';
import './styles.scss';

interface Props {
  sample: typeof Sample;
  point: Point;
  updateRecord: (point: Point) => void;
}

const Marker: FC<Props> = ({ point, updateRecord, sample }) => {
  const { latitude, longitude } = point;

  const hasLocationMatch =
    sample.attrs.location?.latitude === latitude &&
    sample.attrs.location?.longitude === longitude;
  const selectedMarker = hasLocationMatch ? 'selected' : '';

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

          {!hasLocationMatch && (
            <IonButton onClick={showPopup}>Select</IonButton>
          )}
        </div>
      </Popup>
    </LeafletMarker>
  );
};

export default Marker;
