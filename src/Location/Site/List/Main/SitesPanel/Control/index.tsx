import { starOutline } from 'ionicons/icons';
import { MapContainer } from '@flumens';
import { IonIcon } from '@ionic/react';
import './styles.scss';

type Props = { onClick: any };

const SitesButton = ({ onClick }: Props) => (
  <MapContainer.Control>
    <button onClick={onClick} className="map-control-sites" aria-label="Sites">
      <IonIcon slot="icon-only" icon={starOutline} className="size-6" />
    </button>
  </MapContainer.Control>
);

export default SitesButton;
