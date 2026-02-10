import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Main,
  MapContainer,
  MapDraw,
  useAlert,
  mapFlyToLocation,
  isValidLocation,
} from '@flumens';
import { IonSpinner } from '@ionic/react';
import GeolocateButton from 'common/Components/GeolocateButton';
import config from 'common/config';
import countries from 'common/config/countries';
import appModel from 'common/models/app';
import Location from 'models/location';
import Sample, { AreaCountLocation } from 'models/sample';
import FinishPointMarker from './FinishPointMarker';
import Records from './Records';
import Sites from './Sites';
import SitesPanel from './SitesPanel';
import StartingPointMarker from './StartingPointMarker';

const useDeletePrompt = () => {
  const alert = useAlert();

  return () =>
    new Promise((resolve: any) => {
      alert({
        header: 'Delete',
        message: 'Are you sure you want to delete your current track?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => resolve(true),
          },
        ],
      });
    });
};

type Props = {
  sample: Sample;
  setLocation: any;
  isGPSTracking: boolean;
  isDisabled?: boolean;
  onCreateSite: any;
  onSelectSite: (loc?: Location) => void;
  userLocations: Location[];
  groupLocations: Location[];
  isFetchingLocations?: boolean;
};

const AreaAttr = ({
  sample,
  setLocation,
  isGPSTracking,
  isDisabled,
  onCreateSite,
  onSelectSite,
  isFetchingLocations,
  groupLocations,
  userLocations,
}: Props) => {
  const location = (sample.data.location as AreaCountLocation) || {};

  let initialViewState;
  if (isValidLocation(location)) {
    initialViewState = { ...location };
  } else {
    const country = countries[appModel.data.country!];
    if (country?.zoom) {
      initialViewState = { ...country };
    }
  }

  const groupId = sample.data.group?.id;
  const hasGroup = !!groupId && !isDisabled;
  const [showSites, setShowSites] = useState(hasGroup);
  const toggleSites = () => setShowSites(!showSites);

  const shouldDeleteShape = useDeletePrompt();

  const isFinished =
    sample.isDisabled || sample.metadata.saved || sample.isTimerFinished();

  const onShapeChange = async (newShape: any) => {
    if (!newShape) {
      const shouldDelete = await shouldDeleteShape();
      if (!shouldDelete) return false;
    }

    setLocation(newShape);
    return true;
  };

  const [mapRef, setMapRef] = useState<any>();
  const flyToLocation = () => {
    const locationToFly = { ...location };
    if (isGPSTracking) delete locationToFly?.shape;
    mapFlyToLocation(mapRef, locationToFly as any);
  };
  useEffect(flyToLocation, [mapRef, location]);

  const selectedLocationId = sample.data.site?.id;

  return (
    <Main className="[--padding-bottom:0] [--padding-top:0]">
      <MapContainer
        onReady={ref => ref.resize() && setMapRef(ref)}
        accessToken={config.map.mapboxApiKey}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
        maxPitch={0}
        initialViewState={initialViewState}
        maxZoom={19}
      >
        {!isDisabled && <SitesPanel.Control onClick={toggleSites} />}

        <GeolocateButton />

        <MapDraw shape={location?.shape as any} onChange={onShapeChange}>
          {!isDisabled && !isGPSTracking && <MapDraw.Control line polygon />}

          <MapDraw.Context.Consumer>
            {({ isEditing }: any) =>
              !isEditing && (
                <>
                  <MapContainer.Marker {...location} />
                  <StartingPointMarker {...location} />
                  <FinishPointMarker {...location} active={!isFinished} />
                </>
              )
            }
          </MapDraw.Context.Consumer>
        </MapDraw>

        <MapContainer.Control>
          {isFetchingLocations ? (
            <IonSpinner color="medium" className="mx-auto block" />
          ) : (
            <div />
          )}
        </MapContainer.Control>

        <Records sample={sample} />
        {showSites && (
          <Sites
            locations={[...userLocations, ...groupLocations]}
            onSelectSite={onSelectSite}
          />
        )}
      </MapContainer>

      <SitesPanel
        isOpen={showSites}
        onClose={() => setShowSites(false)}
        onCreateSite={onCreateSite}
        onSelectSite={onSelectSite}
        groupLocations={groupLocations}
        userLocations={userLocations}
        selectedLocationId={selectedLocationId}
      />
    </Main>
  );
};

export default observer(AreaAttr);
