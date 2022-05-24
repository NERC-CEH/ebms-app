import * as React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import CONFIG from 'common/config';
import { date as dateHelp } from '@flumens';
import L from 'leaflet';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import './styles.scss';

const DEFAULT_CENTER = [51.505, -0.09];
const MIN_WGS84_ZOOM = 5;
L.Icon.Default.imagePath = '/images';

function getTransectMarker(sample) {
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

function getAreaCountMarker(sample) {
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

function getTransectPosition(sample) {
  try {
    // wrapping in try/catch because can't control the centroid_sref format
    const { centroid_sref: centroid } = sample.attrs.location || {};
    const [latitude, longitude] = centroid.split(' ').map(parseFloat);
    return [latitude, longitude];
  } catch (e) {
    return [];
  }
}

function getAreaCountPosition(sample) {
  const { latitude, longitude } = sample.attrs.location || {};
  if (!latitude) {
    return [];
  }
  return [latitude, longitude];
}

@observer
class Component extends React.Component {
  static propTypes = {
    savedSamples: PropTypes.array.isRequired,
    showingMap: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    this.mapContainer = React.createRef();
  }

  async componentDidMount() {
    this.map = L.map(this.mapContainer.current);
    this.map.setView(DEFAULT_CENTER, MIN_WGS84_ZOOM);
    this.map.attributionControl.setPrefix('');

    const layer = L.tileLayer(
      'https://api.mapbox.com/styles/v1/cehapps/cipqvo0c0000jcknge1z28ejp/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          '<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a><input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Leaflet © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong></div>',
        id: CONFIG.map.mapbox_satellite_id,
        accessToken: CONFIG.map.mapboxApiKey,
        tileSize: 256, // specify as, OS layer overwites this with 200 otherwise,
        minZoom: MIN_WGS84_ZOOM,
      }
    );

    layer.addTo(this.map);
    this.addRecords();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.showingMap !== this.props.showingMap) {
      this.refreshMapView();
    }
  }

  refreshMapView = () => {
    this.map.invalidateSize();
    this.zoomToRecords();
  };

  addRecords = () => {
    const { savedSamples } = this.props;

    const addSurveyMarkerToMap = sample => {
      const marker =
        sample.metadata.survey === 'transect'
          ? getTransectMarker(sample)
          : getAreaCountMarker(sample);

      if (!marker) {
        return;
      }

      this.addRecordsPopup(sample, marker);
      marker.addTo(this.map);
    };

    savedSamples.forEach(addSurveyMarkerToMap);
  };

  addRecordsPopup = (sample, marker) => {
    const date = dateHelp.print(sample.attrs.date, true);

    let speciesInfo = '';
    speciesInfo = !sample.metadata.synced_on
      ? `<br/>(<i>${t('Pending')}</i>)`
      : '';

    if (sample.metadata.survey !== 'transect') {
      speciesInfo += `<br/>${t('Species')}: ${sample.samples.length}`;
    }

    marker.bindPopup(`<b>${t(date)}</b>${speciesInfo}`);
  };

  zoomToRecords() {
    const { savedSamples } = this.props;

    const getPositionsFromSurveys = (agg, sample) => {
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

    this.map.fitBounds(positions);
  }

  render() {
    const { showingMap } = this.props;

    return (
      <div
        id="surveys-map"
        style={{ display: showingMap ? ' block' : 'none' }}
        ref={this.mapContainer}
      />
    );
  }
}

export default Component;
