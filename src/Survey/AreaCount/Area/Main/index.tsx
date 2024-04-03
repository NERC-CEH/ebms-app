import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { MapRef } from 'react-map-gl';
import {
  Main,
  MapContainer,
  MapDraw,
  useAlert,
  mapFlyToLocation,
} from '@flumens';
import { IonSpinner } from '@ionic/react';
import GeolocateButton from 'common/Components/GeolocateButton';
import config from 'common/config';
import Sample, { AreaCountLocation } from 'models/sample';
import Favourites from './Favourites';
import FinishPointMarker from './FinishPointMarker';
import Records from './Records';
import StartingPointMarker from './StartingPointMarker';

const useDeletePropt = () => {
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
  onSelectHistoricalLocation: any;
  onCreateProjectLocation: any;
  onSelectProjectLocation: any;
  isFetchingLocations?: boolean;
};

const AreaAttr = ({
  sample,
  setLocation,
  isGPSTracking,
  isDisabled,
  onSelectHistoricalLocation,
  onCreateProjectLocation,
  onSelectProjectLocation,
  isFetchingLocations,
}: Props) => {
  // eslint-disable-next-line prefer-destructuring
  const location = sample.attrs.location as AreaCountLocation;

  const [mapCenter, saveMapCenter] = useState<any>([1, 1]);
  const updateMapCentre = ({ viewState }: any) =>
    saveMapCenter([viewState.latitude, viewState.longitude]);

  const projectId = sample.attrs.project?.id;
  const hasProject = !!projectId && !isDisabled;
  const [showPastLocations, setShowPastLocations] = useState(hasProject);
  const toggleFavourites = () => setShowPastLocations(!showPastLocations);

  const shouldDeleteShape = useDeletePropt();

  const isFinished =
    sample.isDisabled() || sample.metadata.saved || sample.isTimerFinished();

  const onShapeChange = async (newShape: any) => {
    if (!newShape) {
      const shouldDelete = await shouldDeleteShape();
      if (!shouldDelete) return false;
    }

    setLocation(newShape);
    return true;
  };

  const [mapRef, setMapRef] = useState<MapRef>();
  const flyToLocation = () => {
    const locationToFly = { ...location };
    if (isGPSTracking) delete locationToFly?.shape;
    mapFlyToLocation(mapRef, locationToFly as any);
  };
  useEffect(flyToLocation, [mapRef, location]);

  const selectedLocationId = sample.attrs.site?.id;

  return (
    <Main>
      <MapContainer
        onReady={setMapRef}
        accessToken={config.map.mapboxApiKey}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
        maxPitch={0}
        initialViewState={location}
        onMoveEnd={updateMapCentre}
        maxZoom={19}
      >
        {!isDisabled && <Favourites.Control onClick={toggleFavourites} />}

        <GeolocateButton />

        <MapDraw shape={location?.shape as any} onChange={onShapeChange}>
          {!isDisabled && !isGPSTracking && <MapDraw.Control line polygon />}

          <MapDraw.Context.Consumer>
            {({ isEditing }: any) =>
              !isEditing && (
                <>
                  <MapContainer.Marker {...location!} />
                  <StartingPointMarker {...location!} />
                  <FinishPointMarker {...location!} active={!isFinished} />
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
      </MapContainer>

      <Favourites
        isOpen={showPastLocations}
        mapLocation={mapCenter}
        onClose={() => setShowPastLocations(false)}
        onSelectHistoricalLocation={onSelectHistoricalLocation}
        currentLocation={location}
        projectId={projectId}
        onCreateProjectLocation={onCreateProjectLocation}
        onSelectProjectLocation={onSelectProjectLocation}
        selectedLocationId={selectedLocationId}
      />
    </Main>
  );
};

export default observer(AreaAttr);
