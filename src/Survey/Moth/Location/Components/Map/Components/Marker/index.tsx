import { FC } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { locationOutline } from 'ionicons/icons';
import L from 'leaflet';
import { Trans as T } from 'react-i18next';
import { Marker as LeafletMarker, Popup } from 'react-leaflet';
import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import MothTrap from 'common/models/location';
import './styles.scss';

interface Props {
  mothTrap: MothTrap;
  onSelect: (point: MothTrap) => void;
  isSelected: boolean;
  isDisabled?: boolean;
}

const Marker: FC<Props> = ({ mothTrap, onSelect, isSelected, isDisabled }) => {
  if (!mothTrap.attrs.location?.latitude) return null;

  const isDraft = !mothTrap?.id;

  const {
    latitude,
    longitude,
    name = 'Draft',
  } = mothTrap.attrs?.location || {};

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

        {!isDraft && !isSelected && !isDisabled && (
          <IonButton onClick={onSelectWrap}>
            <T>Select</T>
          </IonButton>
        )}
      </Popup>
    </LeafletMarker>
  );
};

export default observer(Marker);
