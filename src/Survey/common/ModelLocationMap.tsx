import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import type { MapMouseEvent, MapRef } from 'react-map-gl/mapbox';
import {
  MapContainer,
  MapHeader,
  Page,
  Main,
  textToLocation,
  mapEventToLocation,
  toggleGPS,
  mapFlyToLocation,
  useSample,
  isValidLocation,
  type Location,
} from '@flumens';
import type { InputCustomEvent } from '@ionic/react';
import config from 'common/config';
import countries from 'common/config/countries';
import appModel from 'common/models/app';
import Sample from 'models/sample';

const ModelLocationMap = () => {
  const { sample, subSample } = useSample<Sample>();
  const model = subSample || sample;

  const location: Partial<Location> = model!.data.location || {};

  const [mapRef, setMapRef] = useState<MapRef>();
  const flyToLocation = () => {
    mapFlyToLocation(mapRef, location as Location);
  };
  useEffect(flyToLocation, [mapRef, location]);

  if (!model) return null;

  const setLocation = async (newLocation: Location | null) => {
    if (!newLocation) return;
    if (model.isGPSRunning()) model.stopGPS();

    const locationWithoutGridRef = { ...newLocation };
    delete locationWithoutGridRef.gridref;

    model.data.location = { ...model.data.location, ...locationWithoutGridRef };
  };

  const onManuallyTypedLocationChange = (e: InputCustomEvent) =>
    setLocation(textToLocation(String(e.target.value || '')));

  const onMapClick = (e: MapMouseEvent) => setLocation(mapEventToLocation(e));
  const onGPSClick = () => toggleGPS(model);

  // default view to the user's selected country
  let initialViewState;
  if (isValidLocation(location as Location)) {
    initialViewState = { ...location };
  } else {
    const country = countries[appModel.data.country!];
    if (country?.zoom) {
      initialViewState = { ...country };
    }
  }

  return (
    <Page id="model-location">
      <MapHeader>
        <MapHeader.Location
          location={location as Location}
          onChange={onManuallyTypedLocationChange}
          useGridRef
        />
      </MapHeader>
      <Main>
        <MapContainer
          onReady={setMapRef}
          onClick={onMapClick}
          accessToken={config.map.mapboxApiKey}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
          maxPitch={0}
          initialViewState={initialViewState}
        >
          <MapContainer.Control.Geolocate
            isLocating={!!model.gps.locating}
            onClick={onGPSClick}
          />

          <MapContainer.Marker
            {...(location as Location)}
            gridref={undefined}
          />
        </MapContainer>
      </Main>
    </Page>
  );
};

export default observer(ModelLocationMap);
