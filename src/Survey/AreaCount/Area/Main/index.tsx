import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import type { Position } from 'geojson';
import type { MapRef } from 'react-map-gl/mapbox';
import {
  Main,
  MapContainer,
  MapDraw,
  useAlert,
  mapFlyToLocation,
  mapFlyToShape,
  isValidLocation,
  type Location as MapLocation,
} from '@flumens';
import GeolocateButton from 'common/Components/GeolocateButton';
import config from 'common/config';
import countries from 'common/config/countries';
import appModel from 'common/models/app';
import locations from 'models/collections/locations';
import Sample from 'models/sample';
import type { Shape } from 'models/sample/GPSExt';
import FinishPointMarker from './FinishPointMarker';
import Records from './Records';
import SiteBoundary, { getShapeFromGeom } from './SiteBoundary';
import StartingPointMarker from './StartingPointMarker';

const useDeletePrompt = () => {
  const alert = useAlert();

  return () =>
    new Promise<boolean>(resolve => {
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
  setLocation: (shape: Shape | null) => void;
  isGPSTracking: boolean;
  isDisabled?: boolean;
};

const AreaAttr = ({
  sample,
  setLocation,
  isGPSTracking,
  isDisabled,
}: Props) => {
  const { location } = sample.data;

  // look up the selected site for boundary display
  const selectedSite = locations.idMap.get(sample.data.locationId || '');

  const siteBoundaryShape = getShapeFromGeom(
    selectedSite?.data.boundaryGeom ?? undefined
  );

  let initialViewState;
  if (isValidLocation(location)) {
    initialViewState = { ...location, zoom: 14 };
  } else if (siteBoundaryShape) {
    // zoom to site boundary centroid on init
    let firstCoord: Position;
    if (siteBoundaryShape.type === 'LineString') {
      [firstCoord] = siteBoundaryShape.coordinates;
    } else if (siteBoundaryShape.type === 'Polygon') {
      [[firstCoord]] = siteBoundaryShape.coordinates;
    } else {
      [[[firstCoord]]] = siteBoundaryShape.coordinates;
    }

    initialViewState = {
      longitude: firstCoord[0],
      latitude: firstCoord[1],
      zoom: 14,
    };
  } else {
    const country = countries[appModel.data.country!];
    if (country?.zoom) {
      initialViewState = { ...country };
    }
  }

  const shouldDeleteShape = useDeletePrompt();

  const isFinished =
    sample.isDisabled || sample.metadata.saved || sample.isTimerFinished();

  const onShapeChange = async (newShape: Shape | null) => {
    if (!newShape) {
      const shouldDelete = await shouldDeleteShape();
      if (!shouldDelete) return false;
    }

    setLocation(newShape);
    return true;
  };

  const [mapRef, setMapRef] = useState<MapRef>();
  const flyToLocation = () => {
    // if no trail walked yet, zoom to selected site boundary
    if (!location?.shape && siteBoundaryShape) {
      mapFlyToShape(mapRef, siteBoundaryShape);
      return;
    }

    const locationToFly = { ...location };
    if (isGPSTracking) delete locationToFly?.shape;
    mapFlyToLocation(mapRef, locationToFly as MapLocation);
  };
  useEffect(flyToLocation, [mapRef, location, selectedSite]);

  return (
    <Main className="pb-ion-0 pt-ion-0">
      <MapContainer
        onReady={ref => ref.resize() && setMapRef(ref)}
        accessToken={config.map.mapboxApiKey}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
        maxPitch={0}
        initialViewState={initialViewState}
        maxZoom={19}
      >
        <GeolocateButton />

        <SiteBoundary site={selectedSite} />

        <MapDraw shape={location?.shape} onChange={onShapeChange}>
          {!isDisabled && !isGPSTracking && <MapDraw.Control line polygon />}

          <MapDraw.Context.Consumer>
            {({ isEditing }) =>
              !isEditing &&
              location && (
                <>
                  <MapContainer.Marker {...location} />
                  <StartingPointMarker {...location} />
                  <FinishPointMarker {...location} active={!isFinished} />
                </>
              )
            }
          </MapDraw.Context.Consumer>
        </MapDraw>

        <Records sample={sample} />
      </MapContainer>
    </Main>
  );
};

export default observer(AreaAttr);
