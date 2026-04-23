import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Main,
  MapContainer,
  MapHeader,
  isValidLocation,
  mapEventToLocation,
  mapFlyToLocation,
  textToLocation,
  Location,
} from '@flumens';
import GeolocateButton from 'common/Components/GeolocateButton';
import config from 'common/config';
import countries from 'common/config/countries';
import appModel from 'common/models/app';
import { useRecord } from '.';

const LocationPicker = () => {
  const { record } = useRecord();

  const coords = record.centroidSref?.split(' ').map(Number) || [];
  const location = { latitude: coords[0], longitude: coords[1] };

  const [mapRef, setMapRef] = useState<unknown>();

  const flyToLocation = () => {
    mapFlyToLocation(mapRef as never, location as never);
  };

  useEffect(flyToLocation, [mapRef, location]);

  const setLocation = async (newLocation?: Location | null) => {
    if (!newLocation) return;

    record.centroidSref = `${newLocation.latitude} ${newLocation.longitude}`;
  };

  const onManuallyTypedLocationChange = (e: any) =>
    setLocation(textToLocation(e?.target?.value));

  const onMapClick = (e: unknown) =>
    setLocation(mapEventToLocation(e as never));

  // default view to the user's selected country.
  let initialViewState;

  if (
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    isValidLocation(location as never)
  ) {
    initialViewState = { ...location };
  } else {
    const country = countries[appModel.data.country!];

    if (country?.zoom) {
      initialViewState = { ...country };
    }
  }

  return (
    <>
      <MapHeader>
        <MapHeader.Location
          location={location as never}
          onChange={onManuallyTypedLocationChange}
        />
      </MapHeader>

      <Main className="[--padding-bottom:0] [--padding-top:0]">
        <MapContainer
          onReady={setMapRef}
          onClick={onMapClick}
          accessToken={config.map.mapboxApiKey}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
          maxPitch={0}
          initialViewState={initialViewState as never}
        >
          <GeolocateButton />

          <MapContainer.Marker
            latitude={Number(location.latitude)}
            longitude={Number(location.longitude)}
            gridref={undefined}
          />
        </MapContainer>
      </Main>
    </>
  );
};

export default observer(LocationPicker);
