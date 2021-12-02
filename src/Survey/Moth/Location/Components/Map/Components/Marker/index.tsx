import React, { FC } from 'react';
import L from 'leaflet';
import { Marker as LeafletMarker, Popup } from 'react-leaflet';
import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import { MothTrap } from 'common/types';
import clsx from 'clsx';
import './styles.scss';

interface Props {
  point: MothTrap;
  onSelect: (point: MothTrap) => void;
  isSelected: boolean;
  isDisabled?: boolean;
}

const Marker: FC<Props> = ({ point, onSelect, isSelected, isDisabled }) => {
  const { latitude, longitude, name } = point;

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
            <IonLabel>{name}</IonLabel>
          </div>
        </div>

        {!isSelected && !isDisabled && (
          <IonButton onClick={onSelectWrap}>Select</IonButton>
        )}
      </Popup>
    </LeafletMarker>
  );
};

export default Marker;
