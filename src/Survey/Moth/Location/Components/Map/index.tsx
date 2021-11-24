import React, { FC, useState, useContext, useEffect } from 'react';
import CONFIG from 'common/config/config';
import { MapContainer, TileLayer } from 'react-leaflet';
import MapControl from 'common/Components/LeafletControl';
import { observer } from 'mobx-react';
import { NavContext, useIonViewDidEnter, isPlatform } from '@ionic/react';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useRouteMatch } from 'react-router';
import GPSButton from 'common/Components/GPSButton';
import Leaflet from 'leaflet';
import appModel from 'models/appModel';
import Sample from 'models/sample';
import { Point } from 'common/types';
import COUNTRIES_CENTROID from '../../country_centroide';
import pointData from '../../dummy_points.json';
import Marker from '../Marker';
import 'leaflet.markercluster';
import './styles.scss';
import 'leaflet/dist/leaflet.css';

const MAX_ZOOM = 18;
let DEFAULT_ZOOM = 5;
const DEFAULT_CENTER: any = [51.505, -0.09];

interface Props {
  sample: typeof Sample;
}

const MapComponent: FC<Props> = ({ sample }) => {
  const { navigate } = useContext(NavContext);
  const [map, setMap]: any = useState(null);
  const match = useRouteMatch();
  const isDisabled = sample.isUploaded();

  const refreshMap = () => map && map.invalidateSize();
  useIonViewDidEnter(refreshMap, [map]);

  const assignRef = (mapRef: Leaflet.Map) => setMap(mapRef);

  const updateRecord = (point: Point) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = point;
    sample.save();

    const path = match.url.replace('/location', '');
    navigate(path, undefined, undefined, undefined, {
      unmount: true,
    });
  };

  const zoomToSelectedMarker = () => {
    if (!map || !sample.attrs.location) return;

    map.setView(
      [sample.attrs.location?.latitude, sample.attrs.location?.longitude],
      MAX_ZOOM
    );
  };
  useEffect(zoomToSelectedMarker, [map]);

  const getMarker = (point: Point) => {
    const isCurrentlySelected =
      sample.attrs.location?.latitude === point.latitude &&
      sample.attrs.location?.longitude === point.longitude;

    return (
      <Marker
        key={point.id}
        point={point}
        updateRecord={updateRecord}
        isCurrentlySelected={isCurrentlySelected}
      />
    );
  };
  const getMarkers = () => pointData.map(getMarker);

  function recenterMapToCurrentLocation(currentLocation: any) {
    if (!currentLocation) return;

    map.setView(
      new Leaflet.LatLng(currentLocation.latitude, currentLocation.longitude),
      5
    );
  }

  const getCentroide: any = () => {
    const countryCentroid = COUNTRIES_CENTROID[appModel.attrs.country];

    if (!countryCentroid) return DEFAULT_CENTER;
    DEFAULT_ZOOM = countryCentroid.zoom ? countryCentroid.zoom : 5;

    return [countryCentroid.lat, countryCentroid.long];
  };

  const isLocationCurrentlySelected =
    sample.attrs.location?.latitude && sample.attrs.location?.longitude;

  return (
    <MapContainer
      id="moth-survey-map"
      whenCreated={assignRef}
      zoom={DEFAULT_ZOOM}
      center={getCentroide()}
      minZoom={4}
      tap={!isPlatform('ios')} // TODO: https://github.com/Leaflet/Leaflet/issues/7255
    >
      <TileLayer
        attribution='<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a><input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Leaflet © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong></div>'
        url="https://api.mapbox.com/styles/v1/cehapps/cipqvo0c0000jcknge1z28ejp/tiles/256/{z}/{x}/{y}?access_token={accessToken}"
        accessToken={CONFIG.map.mapboxApiKey}
      />
      <MarkerClusterGroup>{getMarkers()}</MarkerClusterGroup>

      {!isDisabled && (
        <MapControl position="topleft" className="gps-button">
          <GPSButton
            onLocationChange={recenterMapToCurrentLocation}
            map={map}
            isLocationCurrentlySelected={!!isLocationCurrentlySelected}
          />
        </MapControl>
      )}
    </MapContainer>
  );
};

export default observer(MapComponent);
