import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
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
} from '@flumens';
import config from 'common/config';
import countries from 'common/config/countries';
import appModel from 'common/models/app';
import Sample from 'models/sample';

const ModelLocationMap = () => {
  const { sample, subSample } = useSample<Sample>();

  const model = subSample || sample;

  const location = model!.data.location || {};

  const [mapRef, setMapRef] = useState<any>();
  const flyToLocation = () => {
    mapFlyToLocation(mapRef, location as any);
  };
  useEffect(flyToLocation, [mapRef, location]);

  if (!model) return null;

  const setLocation = async (newLocation: any) => {
    if (!newLocation) return;
    if (model.isGPSRunning()) model.stopGPS();

    const locationWithoutGridRef = { ...newLocation };
    delete locationWithoutGridRef.gridref;

    model.data.location = { ...model.data.location, ...locationWithoutGridRef };
  };

  const onManuallyTypedLocationChange = (e: any) =>
    setLocation(textToLocation(e?.target?.value));

  const onMapClick = (e: any) => setLocation(mapEventToLocation(e));
  const onGPSClick = () => toggleGPS(model);

  // default view to the user's selected country
  let initialViewState;
  if (isValidLocation(location as any)) {
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
          location={location as any}
          onChange={onManuallyTypedLocationChange}
          useGridRef
        />
      </MapHeader>
      <Main className="[--padding-bottom:0] [--padding-top:0]">
        <MapContainer
          onReady={setMapRef}
          onClick={onMapClick}
          accessToken={config.map.mapboxApiKey}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
          maxPitch={0}
          initialViewState={initialViewState}
        >
          <MapContainer.Control.Geolocate
            isLocating={model.gps.locating}
            onClick={onGPSClick}
          />

          <MapContainer.Marker {...(location as any)} gridref={undefined} />
        </MapContainer>
      </Main>
    </Page>
  );
};

export default observer(ModelLocationMap);
