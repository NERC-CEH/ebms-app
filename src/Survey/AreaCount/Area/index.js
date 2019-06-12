import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonTitle, IonToolbar } from '@ionic/react';
import CONFIG from 'config';
import AppHeader from 'common/Components/Header';
import L from 'leaflet';
import { Map, TileLayer } from 'react-leaflet';
import 'leaflet-draw';
import { observer } from 'mobx-react';
import geojsonArea from '@mapbox/geojson-area';
import './styles.scss';

L.Icon.Default.imagePath =
  '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/';

const DEFAULT_POSITION = [51.505, -0.09];
const DEFAULT_ZOOM = 5;
const DEFAULT_POLYGON_COLOR = '#9733ff';

@observer
class AreaAttr extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    savedSamples: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { match, savedSamples } = props;

    this.sample = savedSamples.get(match.params.id);

    window.sample = this.sample;
    this.map = React.createRef();
  }

  componentDidMount() {
    const map = this.map.current.leafletElement;
    L.drawLocal.draw.toolbar.buttons.polygon = t('Draw an area');

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        marker: false,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        polygon: {
          className: 'lala',
          showArea: true,
          precision: { m: 1 },
          metric: ['m'],
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: "<strong>Sorry, the area can't intersect!",
          },
          shapeOptions: {
            color: DEFAULT_POLYGON_COLOR,
          },
        },
      },
      edit: {
        poly: {
          allowIntersection: false,
        },
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);

    const location = this.sample.get('location') || {};
    if (location.shape) {
      const positions = location.shape.map(coordinates =>
        [...coordinates].reverse()
      );
      const polygon = L.polygon(positions, { color: DEFAULT_POLYGON_COLOR });
      polygon.addTo(drawnItems);
      this.zoomToShape(location.shape);
    } else {
      map.panTo(new L.LatLng(...DEFAULT_POSITION));
    }

    this._onCreatedEventListener = e => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);
      this.setShape(e);
    };
    map.on(L.Draw.Event.CREATED, this._onCreatedEventListener);
    map.on(L.Draw.Event.EDITED, this.setEditedShape);
    map.on(L.Draw.Event.DELETED, this.deleteShape);
  }

  zoomToShape(savedShape) {
    const map = this.map.current.leafletElement;
    const positions = savedShape.map(coordinates => [...coordinates].reverse());
    map.fitBounds(positions);
  }

  componentWillUnmount() {
    const map = this.map.current.leafletElement;
    map.off(L.Draw.Event.CREATED, this._onCreatedEventListener);
    map.off(L.Draw.Event.EDITED, this.setEditedShape);
    map.off(L.Draw.Event.DELETED, this.deleteShape);
  }

  setEditedShape = e => e.layers.eachLayer(layer => this.setShape({ layer }));

  setShape = async e => {
    const geojson = e.layer.toGeoJSON();
    const area = Math.floor(geojsonArea.geometry(geojson.geometry));
    const shape = geojson.geometry.coordinates[0];
    this.zoomToShape(shape);

    const [longitude, latitude] = shape[0];
    this.sample.save({
      location: {
        latitude,
        longitude,
        area,
        shape,
        source: 'map',
      },
    });
  };

  deleteShape = () => {
    this.sample.save({
      location: null,
    });
  };

  render() {
    const location = this.sample.get('location') || {};
    const { area } = location;

    let areaPretty;
    if (area) {
      areaPretty = `${t('Selected area')}: ${area.toLocaleString()} m²`;
    } else {
      areaPretty = t('Please draw your area on the map');
    }

    return (
      <>
        <AppHeader title={t('Area')} />
        <IonToolbar id="area-edit-toolbar">
          <IonTitle slot="start">{areaPretty}</IonTitle>
        </IonToolbar>

        <div className="leaflet-container">
          <Map ref={this.map} zoom={DEFAULT_ZOOM} onClick={this.handleClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://api.mapbox.com/styles/v1/cehapps/cipqvo0c0000jcknge1z28ejp/tiles/256/{z}/{x}/{y}?access_token={accessToken}"
              accessToken={CONFIG.map.mapbox_api_key}
            />
          </Map>
        </div>
      </>
    );
  }
}

export default AreaAttr;
