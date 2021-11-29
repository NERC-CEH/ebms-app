import React, { FC, useState, useContext, useEffect } from 'react';
import CONFIG from 'common/config/config';
import { MapContainer, TileLayer } from 'react-leaflet';
import MapControl from 'common/Components/LeafletControl';
import { observer } from 'mobx-react';
import { device, InfoBackgroundMessage } from '@apps';
import {
  NavContext,
  useIonViewDidEnter,
  isPlatform,
  IonIcon,
} from '@ionic/react';
import { wifiOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import GPSButton from 'common/Components/GPSButton';
import Leaflet from 'leaflet';
import appModel from 'models/appModel';
import Sample from 'models/sample';
import { Point } from 'common/types';
import COUNTRIES_CENTROID from '../../country_centroide';
import BottomSheet from '../BottomSheet';
import pointData from '../../dummy_points.json';
import Marker from './Components/Marker';
import 'leaflet.markercluster';
import './styles.scss';
import 'leaflet/dist/leaflet.css';

const MAX_ZOOM = 18;
const DEFAULT_ZOOM = 5;
const DEFAULT_CENTER: any = [51.505, -0.09];

const hasLocationMatch = (sample: typeof Sample, point: Point) =>
  sample.attrs.location?.latitude === point.latitude &&
  sample.attrs.location?.longitude === point.longitude;

interface Props {
  sample: typeof Sample;
}

const infoMessage = (
  <div className="info-background-message-wrapper">
    <InfoBackgroundMessage className="text-center">
      <IonIcon icon={wifiOutline} />{' '}
      <T>To see the map please connect to the internet.</T>
    </InfoBackgroundMessage>
  </div>
);

const MapComponent: FC<Props> = ({ sample }) => {
  const { goBack } = useContext(NavContext);
  const [map, setMap]: any = useState(null);
  const [mapZoom, setMapZoom]: any = useState(DEFAULT_ZOOM);
  const [mapCenter, setMapCenter]: any = useState(DEFAULT_CENTER);

  const assignRef = (mapRef: Leaflet.Map) => setMap(mapRef);

  const updateLayout = () => map && map.invalidateSize();
  useIonViewDidEnter(updateLayout, [map]);

  const refreshMapPositionAndZoom = () =>
    map && map.setView(mapCenter, mapZoom);
  useEffect(refreshMapPositionAndZoom, [map, mapCenter, mapZoom]);

  const setInitialZoomAndCenter = () => {
    const { location } = sample.attrs;
    if (location) {
      setMapCenter([location?.latitude, location?.longitude]);
      setMapZoom(MAX_ZOOM);
      return;
    }

    const country = COUNTRIES_CENTROID[appModel.attrs.country];
    if (country.zoom) {
      setMapCenter([country.lat, country.long]);
      setMapZoom(country.zoom);
    }
  };
  useEffect(setInitialZoomAndCenter, []);

  // dynamic center when the user moves the map manually
  const [currentMapCenter, setMapCurrentCenter]: any = useState(mapCenter);

  const attachOnMove = () => {
    if (!map) return;
    map.on('moveend', function (s: any) {
      const { lat, lng } = map.getCenter();
      setMapCurrentCenter([lat, lng]);
    });
    // return () => {
    //   // TODO: remove the moveend listener
    // };
  };
  useEffect(attachOnMove, [map]);

  const onLocationSelect = (point: Point) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = point;
    sample.save();

    goBack();
  };

  const getMarker = (point: Point): JSX.Element => (
    <Marker
      key={point.id}
      point={point}
      onSelect={onLocationSelect}
      isSelected={hasLocationMatch(sample, point)}
    />
  );
  const markers = pointData.map(getMarker);

  function recenterMapToCurrentLocation(currentLocation: any) {
    if (!currentLocation) return;

    setMapCenter([currentLocation.latitude, currentLocation.longitude]);
    setMapZoom(MAX_ZOOM);
  }

  const isLocationCurrentlySelected =
    sample.attrs.location?.latitude && sample.attrs.location?.longitude;

  const isDisabled = sample.isUploaded();

  const isDeviceOnline = device.isOnline();

  return (
    <>
      {!isDeviceOnline && infoMessage}
      {isDeviceOnline && (
        <MapContainer
          id="moth-survey-map"
          whenCreated={assignRef}
          minZoom={4}
          tap={!isPlatform('ios')} // TODO: https://github.com/Leaflet/Leaflet/issues/7255
        >
          <TileLayer
            attribution='<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a><input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Leaflet © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong></div>'
            url="https://api.mapbox.com/styles/v1/cehapps/cipqvo0c0000jcknge1z28ejp/tiles/256/{z}/{x}/{y}?access_token={accessToken}"
            accessToken={CONFIG.map.mapboxApiKey}
          />
          <MarkerClusterGroup>{markers}</MarkerClusterGroup>

            <MapControl
              position="topleft"
              className="gps-button"
              isDisabled={isDisabled}
            >
              <GPSButton
                onLocationChange={recenterMapToCurrentLocation}
                map={map}
                isLocationCurrentlySelected={!!isLocationCurrentlySelected}
              />
            </MapControl>
          )}
        </MapContainer>
      )}

      <BottomSheet
        pointData={pointData}
        centroid={currentMapCenter}
        updateRecord={onLocationSelect}
      />
    </>
  );
};

export default observer(MapComponent);
