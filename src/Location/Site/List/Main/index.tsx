import { IonSpinner } from '@ionic/react';
import GeolocateButton from 'common/Components/GeolocateButton';
import config from 'common/config';
import countries from 'common/config/countries';
import { Main, MapContainer } from 'common/flumens';
import appModel from 'common/models/app';
import Location from 'models/location';
import Sites from './Sites';
import SitesPanel from './SitesPanel';

type Props = {
  isFetchingLocations: boolean;
  hasGroup: boolean;
  userLocations: Location[];
  groupLocations: Location[];
  onSelectSite?: (location?: Location) => void;
  selectedLocationId?: string;
  site?: Location;
};

const MainSites = ({
  hasGroup,
  userLocations,
  groupLocations,
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

  return (
    <Main className="[--padding-bottom:0] [--padding-top:0]">
      <MapContainer
        onReady={ref => ref.resize()}
        accessToken={config.map.mapboxApiKey}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
        maxPitch={0}
        initialViewState={initialViewState}
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
        />
      </MapContainer>

      <SitesPanel
        isOpen
        hasGroup={hasGroup}
        onSelectSite={onSelectSite}
        groupLocations={groupLocations}
        userLocations={userLocations}
        selectedLocationId={selectedLocationId}
      />
    </Main>
  );
};

export default MainSites;
