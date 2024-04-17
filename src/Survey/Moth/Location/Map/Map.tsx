import { observer } from 'mobx-react';
import { wifiOutline } from 'ionicons/icons';
import { device, InfoMessage, MapContainer } from '@flumens';
import { IonIcon } from '@ionic/react';
import GeolocateButton from 'common/Components/GeolocateButton';
import config from 'common/config';
import countries from 'common/config/countries';
import appModel from 'models/app';

interface Props {
  location?: any;
  onMovedCoords: any;
  children: any;
}

const Map = ({ location, onMovedCoords, children }: Props) => {
  let initialViewState;

  if (Number.isFinite(location?.latitude)) {
    initialViewState = { ...location, zoom: 12 };
  } else {
    const country = countries[appModel.attrs.country!];
    if (country?.zoom) {
      initialViewState = { ...country };
    }
  }

  const updateMapCentre = ({ viewState }: any) =>
    onMovedCoords([viewState.latitude, viewState.longitude]);

  if (!device.isOnline) {
    return (
      <div className="absolute top-0 z-[99999] flex h-full w-full flex-col items-center bg-[#4a4a4a] p-6">
        <InfoMessage prefix={<IonIcon src={wifiOutline} />}>
          To see the map please connect to the internet.
        </InfoMessage>
      </div>
    );
  }

  return (
    <MapContainer
      accessToken={config.map.mapboxApiKey}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
      maxPitch={0}
      initialViewState={initialViewState}
      onMoveEnd={updateMapCentre}
    >
      <GeolocateButton />

      {children}
    </MapContainer>
  );
};

export default observer(Map);
