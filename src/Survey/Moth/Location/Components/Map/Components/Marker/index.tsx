import React, { FC } from 'react';
import L from 'leaflet';
import { Marker as LeafletMarker, Popup } from 'react-leaflet';
import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import { locationOutline, eyeOutline } from 'ionicons/icons';
import { Point } from 'common/types';
import clsx from 'clsx';
import './styles.scss';

interface Props {
  point: Point;
  onSelect: (point: Point) => void;
  isSelected: boolean;
}

const Marker: FC<Props> = ({ point, onSelect, isSelected }) => {
  const { latitude, longitude } = point;

  const getIcon = () =>
    L.divIcon({
      className: clsx(`my-custom-pin`, isSelected && 'selected'),
      html: `<span />`,
    });

  const onSelectWrap = () => onSelect(point);

  return (
    <LeafletMarker icon={getIcon()} position={[latitude, longitude]}>
      <Popup>
        <div>
          <IonIcon icon={locationOutline} />
          <div>
            <IonLabel>{point.name}</IonLabel>
          </div>
        </div>
        <div>
          <IonIcon icon={eyeOutline} />
          <div>
            <IonLabel>LED light</IonLabel>
          </div>
        </div>

        {!isSelected && <IonButton onClick={onSelectWrap}>Select</IonButton>}
      </Popup>
    </LeafletMarker>
  );
};

export default Marker;
