import { starOutline } from 'ionicons/icons';
import { MapContainer } from '@flumens';
import { IonIcon } from '@ionic/react';
import './styles.scss';

type Props = { onClick: any };

const FavouritesButton = ({ onClick }: Props) => {
  return (
    <MapContainer.Control>
      <button
        onClick={onClick}
        className="map-control-favourites"
        aria-label="Favourites"
      >
        <IonIcon slot="icon-only" icon={starOutline} className="size-6" />
      </button>
    </MapContainer.Control>
  );
};

export default FavouritesButton;
