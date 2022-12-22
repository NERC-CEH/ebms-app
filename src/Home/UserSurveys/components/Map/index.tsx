import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import CONFIG from 'common/config';
import savedSamples from 'models/collections/samples';
import Sample from 'models/sample';
import { MapContainer } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useIonViewDidEnter } from '@ionic/react';
import hasWebGL from 'common/helpers/webGLSupport';
import { date as dateHelp } from '@flumens';
import L, { LatLngExpression } from 'leaflet';
import 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@flumens/ionic/dist/components/ModelLocationMap/Map/map/leaflet-mapbox-gl';
import './styles.scss';

const DEFAULT_ZOOM = 5;
const DEFAULT_CENTER: LatLngExpression = [51.505, -0.09];

const URL =
  'https://api.mapbox.com/styles/v1/cehapps/cipqvo0c0000jcknge1z28ejp/tiles/256/{z}/{x}/{y}?access_token={accessToken}';

const MapBoxAttribution =
  '<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a><input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Leaflet © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong></div>';

function getTransectMarker(sample: Sample) {
  let latitude;
  let longitude;
  try {
    const { centroid_sref: centroid } = sample.attrs.location || {};
    [latitude, longitude] = centroid.split(' ').map(parseFloat);
  } catch (e) {
    return null;
  }

  const square = L.divIcon({
    className: 'square-leaflet-icon',
  });

  return L.marker([latitude, longitude], { icon: square });
}

function getAreaCountMarker(sample: Sample) {
  const { latitude, longitude } = sample.attrs.location || {};

  if (!latitude) {
    return null;
  }

  return L.circleMarker([latitude, longitude], {
    color: 'white',
    fillColor: '#745a8f',
    fillOpacity: 1,
    weight: 4,
  });
}

function getTransectPosition(sample: Sample) {
  try {
    // wrapping in try/catch because can't control the centroid_sref format
    const { centroid_sref: centroid } = sample.attrs.location || {};
    const [latitude, longitude] = centroid.split(' ').map(parseFloat);
    return [latitude, longitude];
  } catch (e) {
    return [];
  }
}

function getAreaCountPosition(sample: Sample) {
  const { latitude, longitude } = sample.attrs.location || {};
  if (!latitude) {
    return [];
  }

  return [latitude, longitude];
}

type Props = {
  savedSamples: typeof savedSamples;
  showingMap: boolean;
};

const Component: FC<Props> = () => {
  const [map, setMap]: any = useState(null);

  const { t } = useTranslation();

  const addRecordsPopup = (sample: Sample, marker: any) => {
    const date = dateHelp.print(sample.attrs.date, true);

    let speciesInfo = '';
    speciesInfo = !sample.metadata.synced_on
      ? `<br/>(<i>${t('Pending')}</i>)`
      : '';

    if (sample.metadata.survey !== 'transect') {
      speciesInfo += `<br/>${t('Species')}: ${sample.samples.length}`;
    }

    marker.bindPopup(`<b>${date}</b>${speciesInfo}`);
  };

  const addRecords = (mapRef: L.Map) => {
    const addSurveyMarkerToMap = (sample: Sample) => {
      const marker =
        sample.metadata.survey === 'transect'
          ? getTransectMarker(sample)
          : getAreaCountMarker(sample);

      if (!marker) {
        return;
      }

      addRecordsPopup(sample, marker);
      marker.addTo(mapRef);
    };

    savedSamples.forEach(addSurveyMarkerToMap);
  };

  const zoomToRecords = (mapRef: L.Map) => {
    const getPositionsFromSurveys = (agg: any, sample: Sample) => {
      const position =
        sample.metadata.survey === 'transect'
          ? getTransectPosition(sample)
          : getAreaCountPosition(sample);

      if (!position.length) {
        return agg;
      }

      return [...agg, position];
    };

    const positions = savedSamples.reduce(getPositionsFromSurveys, []);

    if (!positions.length) {
      return;
    }

    mapRef.fitBounds(positions);

    // TODO: BUG! Single position or multiple positions but same coords(like a transect) have same bounds and zoom becames infinity
    const zoom = mapRef.getZoom();
    if (zoom === Infinity) {
      mapRef.setZoom(DEFAULT_ZOOM);
    }
  };

  const initMap = (mapRef: L.Map) => {
    setMap(mapRef);

    const suppportsWebGL = hasWebGL();

    const layer = suppportsWebGL
      ? (L as any).mapboxGL({
          accessToken: CONFIG.map.mapboxApiKey,
          style: 'mapbox://styles/mapbox/satellite-streets-v11',
          attribution: MapBoxAttribution,
        })
      : L.tileLayer(URL, {
          attribution:
            '<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a><input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Leaflet © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong></div>',
          accessToken: CONFIG.map.mapboxApiKey,
          tileSize: 256, // specify as, OS layer overwites this with 200 otherwise,
          minZoom: DEFAULT_ZOOM,
        });

    layer.addTo(mapRef);

    addRecords(mapRef);

    zoomToRecords(mapRef);
  };

  const updateLayout = () => map && map.invalidateSize();
  useIonViewDidEnter(updateLayout, [map]);

  return (
    <MapContainer
      id="surveys-map"
      whenCreated={initMap}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
    />
  );
};

export default observer(Component);
