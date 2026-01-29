import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import useLocation from 'Location/MothTrap/useLocation';
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
} from '@flumens';
import config from 'common/config';
import Location from 'models/location';
import Sample, { AreaCountLocation } from 'models/sample';

const ModelLocationMap = () => {
  const { sample, subSample } = useSample<Sample>();
  const { location: locationModel } = useLocation();

  const model = subSample! || sample! || locationModel!;

  const location = (model.data.location as AreaCountLocation) || {};
  const parentLocation = model.parent?.data.location as AreaCountLocation;

  const isMothSurvey = model instanceof Location;

  const setLocation = async (newLocation: any) => {
    if (!newLocation) return;
    if (model.isGPSRunning()) model.stopGPS();

    model.data.location = { ...model.data.location, ...newLocation };
  };

  const onManuallyTypedLocationChange = (e: any) =>
    setLocation(textToLocation(e?.target?.value));

  const onMapClick = (e: any) => setLocation(mapEventToLocation(e));
  const onGPSClick = () => toggleGPS(model);

  const onLocationNameChange = ({ name }: any) => {
    (model.data.location as AreaCountLocation).name = name;
  };

  const [mapRef, setMapRef] = useState<any>();
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
      <Main className="[--padding-bottom:0] [--padding-top:0]">
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
