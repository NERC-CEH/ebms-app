import { useState } from 'react';
import { wifiOutline } from 'ionicons/icons';
import { ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { IonIcon, IonSpinner } from '@ionic/react';
import GeolocateButton from 'common/Components/GeolocateButton';
import config from 'common/config';
import countries from 'common/config/countries';
import { device, InfoMessage, Main, MapContainer } from 'common/flumens';
import appModel from 'common/models/app';
import Location from 'models/location';
import Sites from './Sites';
import SitesPanel from './SitesPanel';

type Props = {
  isFetchingLocations: boolean;
  hasGroup?: boolean;
  userLocations: Location[];
  groupLocations?: Location[];
  onSelectSite?: (location?: Location) => void;
  selectedLocationId?: string;
  site?: Location;
};

const MainSites = ({
  hasGroup = false,
  userLocations,
  groupLocations = [],
  onSelectSite,
  selectedLocationId,
  isFetchingLocations,
  site,
}: Props) => {
  let initialViewState;

  if (site) {
    initialViewState = {
      latitude: parseFloat(site.data.lat),
      longitude: parseFloat(site.data.lon),
      zoom: 15,
    };
  } else {
    const country = countries[appModel.data.country!];
    if (country?.zoom) {
      initialViewState = { ...country };
    }
  }

  const defaultCentroid = [
    initialViewState?.latitude || 51,
    initialViewState?.longitude || -1,
  ];
  const [currentMapCenter, setCurrentMapCenter] = useState(defaultCentroid);

  const updateMapCenter = ({ viewState }: ViewStateChangeEvent) =>
    setCurrentMapCenter([viewState.latitude, viewState.longitude]);

  return (
    <Main className="[--padding-bottom:0] [--padding-top:0]">
      {device.isOnline && (
        <MapContainer
          onReady={ref => ref.resize()}
          accessToken={config.map.mapboxApiKey}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
          maxPitch={0}
          initialViewState={initialViewState}
          onMoveEnd={updateMapCenter}
          maxZoom={19}
        >
          <GeolocateButton />

          <MapContainer.Control>
            {isFetchingLocations ? (
              <IonSpinner color="medium" className="mx-auto block" />
            ) : (
              <div />
            )}
          </MapContainer.Control>

          <Sites
            locations={[...userLocations, ...groupLocations]}
            onSelectSite={onSelectSite}
            selectedLocationId={selectedLocationId}
          />
        </MapContainer>
      )}

      {!device.isOnline && (
        <div className="absolute top-0 z-[99999] flex h-full w-full flex-col items-center bg-[#4a4a4a] p-6">
          <InfoMessage prefix={<IonIcon src={wifiOutline} />}>
            To see the map please connect to the internet.
          </InfoMessage>
        </div>
      )}

      <SitesPanel
        hasGroup={hasGroup}
        centroid={currentMapCenter}
        onSelectSite={onSelectSite}
        groupLocations={groupLocations}
        userLocations={userLocations}
        selectedLocationId={selectedLocationId}
      />
    </Main>
  );
};

export default MainSites;
