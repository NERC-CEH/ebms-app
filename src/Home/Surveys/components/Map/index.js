import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import CONFIG from 'config';
import DateHelp from 'helpers/date';
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

    const layer = L.tileLayer(
      'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
      {
        attribution:
          "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        id: CONFIG.map.mapbox_satellite_id,
        accessToken: CONFIG.map.mapbox_api_key,
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
    const date = DateHelp.print(sample.attrs.date, true);

    let speciesInfo = '';
    speciesInfo = !sample.metadata.synced_on
      ? `<br/>(<i>${t('Pending')}</i>)`
      : '';

    if (sample.metadata.survey !== 'transect') {
      speciesInfo += `<br/>${t('Species')}: ${sample.occurrences.length}`;
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
