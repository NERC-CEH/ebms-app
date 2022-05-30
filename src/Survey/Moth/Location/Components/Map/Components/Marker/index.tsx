import { FC } from 'react';
import L from 'leaflet';
import { Marker as LeafletMarker, Popup } from 'react-leaflet';
import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import MothTrap from 'common/models/location';
import { Trans as T } from 'react-i18next';
import clsx from 'clsx';
import './styles.scss';

interface Props {
  mothTrap: MothTrap;
  onSelect: (point: MothTrap) => void;
  isSelected: boolean;
  isDisabled?: boolean;
}

const Marker: FC<Props> = ({ mothTrap, onSelect, isSelected, isDisabled }) => {
  if (!mothTrap.attrs.location?.latitude) return null;

  const { latitude, longitude, name } = mothTrap.attrs?.location || {};

  const getIcon = () =>
    L.divIcon({
      className: clsx(`my-custom-pin`, isSelected && 'selected'),
      html: `<span />`,
    });

  const onSelectWrap = () => onSelect(mothTrap);

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
          <IonButton onClick={onSelectWrap}>
            <T>Select</T>
          </IonButton>
        )}
      </Popup>
    </LeafletMarker>
  );
};

export default Marker;
