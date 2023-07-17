import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { MapRef } from 'react-map-gl';
import {
  Main,
  MapContainer,
  MapDraw,
  useAlert,
  useCenterMapToCurrentLocation,
  CircleMarker,
} from '@flumens';
import config from 'common/config';
import Sample from 'models/sample';
import GPS from 'helpers/GPS';
import Favourites from './Favourites';
import Records from './Records';

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
};

const AreaAttr = ({
  sample,
  setLocation,
  isGPSTracking,
  isDisabled,
}: Props) => {
  const mapRef = useRef<MapRef>(null);
  const { location } = sample.attrs;

  const [mapCenter, saveMapCenter] = useState<any>([1, 1]);
  const updateMapCentre = ({ viewState }: any) =>
    saveMapCenter([viewState.latitude, viewState.longitude]);

  const [showPastLocations, setShowPastLocations] = useState(false);

  const shouldDeleteShape = useDeletePropt();

  const hasLocation =
    sample.attrs.location?.latitude || sample.attrs.location?.longitude;

  const endPointLocation = sample.attrs.location?.shape?.coordinates?.length
    ? sample.attrs.location?.shape?.coordinates?.slice()
    : null;

  const finishPosition =
    endPointLocation &&
    endPointLocation[endPointLocation.length - 1].slice().reverse();

  const startPosition =
    endPointLocation && endPointLocation[0].slice().reverse();

  const isFinished = sample.metadata.saved || sample.isTimerFinished();
  const isShapePolyline = sample.attrs.location?.shape?.type === 'LineString';
  const showStartMarker = isShapePolyline && hasLocation;
  const showLastMarker = isShapePolyline && endPointLocation;

  const centerToLastTrackPoint = () => {
    if (isFinished) return;

    const DEFAULT_LOCATED_ZOOM = 12;

    if (!Number.isFinite(location?.longitude)) return;

    const currentZoom = mapRef.current?.getZoom();

    const zoom =
      currentZoom! > DEFAULT_LOCATED_ZOOM ? currentZoom : DEFAULT_LOCATED_ZOOM;

    mapRef.current?.flyTo({
      center: [location!.longitude, location!.latitude],
      zoom,
      speed: 2,
    });
  };
  useEffect(centerToLastTrackPoint, [
    isFinished,
    location?.latitude,
    location?.longitude,
  ]);

  const startingPointMarker = showStartMarker && (
    <CircleMarker
      id="start"
      latitude={startPosition[0]}
      longitude={startPosition[1]}
      paint={{
        'circle-color': 'white',
        'circle-opacity': 1,
        'circle-stroke-color': 'white',
      }}
    />
  );

  const finishPointMarker = showLastMarker && isFinished && (
    <CircleMarker
      id="finish"
      latitude={finishPosition[0]}
      longitude={finishPosition[1]}
      paint={{
        'circle-color': 'black',
        'circle-stroke-color': 'white',
      }}
    />
  );

  const currentPointMarker = showLastMarker && !isFinished && (
    <CircleMarker
      id="finish"
      latitude={finishPosition[0]}
      longitude={finishPosition[1]}
      paint={{
        'circle-color': '#df9100',
        'circle-opacity': 1,
        'circle-stroke-color': '#df9100',
      }}
    />
  );

  const onShapeChange = async (shape: any) => {
    if (!shape) {
      const shouldDelete = await shouldDeleteShape();
      if (!shouldDelete) return false;
    }

    setLocation(shape);
    return true;
  };

  const toggleFavourites = () => setShowPastLocations(!showPastLocations);

  const { isLocating, centerMapToCurrentLocation } =
    useCenterMapToCurrentLocation(GPS);

  return (
    <Main className={`${isGPSTracking ? 'GPStracking' : ''}`}>
      <MapContainer
        ref={mapRef}
        accessToken={config.map.mapboxApiKey}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
        maxPitch={0}
        initialViewState={location}
        onMoveEnd={updateMapCentre}
      >
        {!isDisabled && <Favourites.Control onClick={toggleFavourites} />}

        <MapContainer.Control.Geolocate
          isLocating={isLocating}
          onClick={centerMapToCurrentLocation}
        />

        <MapDraw shape={location?.shape} onChange={onShapeChange}>
          {!isDisabled && <MapDraw.Control line polygon />}

          <MapDraw.Context.Consumer>
            {({ isEditing }: any) => {
              if (isEditing) return null;
              return (
                <>
                  <MapContainer.Marker {...location} />
                  {startingPointMarker}
                  {finishPointMarker}
                  {currentPointMarker}
                </>
              );
            }}
          </MapDraw.Context.Consumer>
        </MapDraw>

        <Records sample={sample} />
      </MapContainer>

      <Favourites
        isOpen={showPastLocations}
        sample={sample}
        currentLocation={mapCenter}
        onClose={() => setShowPastLocations(false)}
      />
    </Main>
  );
};

export default observer(AreaAttr);
