/* eslint-disable no-restricted-syntax */
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { MapRef } from 'react-map-gl';
import {
  MapContainer,
  MapHeader,
  Page,
  Main,
  textToLocation,
  mapEventToLocation,
  toggleGPS,
  mapFlyToLocation,
} from '@flumens';
import config from 'common/config';
import Location from 'models/location';
import Sample from 'models/sample';

type Props = {
  sample: Sample;
  subSample?: Sample;
};

const ModelLocationMap = ({ subSample, sample }: Props) => {
  const model = subSample || sample;
  const location = model.attrs.location || {};
  const parentLocation = model.parent?.attrs.location;

  const isMothSurvey = model instanceof Location;

  const setLocation = async (newLocation: any) => {
    if (!newLocation) return;
    if (model.isGPSRunning()) model.stopGPS();

    model.attrs.location = { ...model.attrs.location, ...newLocation };
  };

  const onManuallyTypedLocationChange = (e: any) =>
    setLocation(textToLocation(e?.target?.value));

  const onMapClick = (e: any) => setLocation(mapEventToLocation(e));
  const onGPSClick = () => toggleGPS(model);

  const onLocationNameChange = ({ name }: any) => {
    model.attrs.location.name = name;
  };

  const [mapRef, setMapRef] = useState<MapRef>();
  const flyToLocation = () => {
    mapFlyToLocation(mapRef, location as any);
  };
  useEffect(flyToLocation, [mapRef, location]);

  return (
    <Page id="model-location">
      <MapHeader>
        <MapHeader.Location
          location={location}
          onChange={onManuallyTypedLocationChange}
          useGridRef
        />
        {isMothSurvey && (
          <MapHeader.LocationName
            onChange={onLocationNameChange}
            value={location.name}
            placeholder="Moth trap name"
          />
        )}
      </MapHeader>
      <Main>
        <MapContainer
          onReady={setMapRef}
          onClick={onMapClick}
          accessToken={config.map.mapboxApiKey}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
          maxPitch={0}
          // initialViewState // TODO: default to the current country
        >
          <MapContainer.Control.Geolocate
            isLocating={model.gps.locating}
            onClick={onGPSClick}
          />

          <MapContainer.Marker
            parentGridref={parentLocation?.gridref}
            {...location}
          />
        </MapContainer>
      </Main>
    </Page>
  );
};

export default observer(ModelLocationMap);
