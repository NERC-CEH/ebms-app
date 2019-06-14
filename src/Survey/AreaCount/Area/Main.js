import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonIcon } from '@ionic/react';
import CONFIG from 'config';
import L from 'leaflet';
import GPS from 'helpers/GPS';
import { Map, TileLayer } from 'react-leaflet';
import LeafletControl from 'react-leaflet-control';
import 'leaflet-draw';
import { observer } from 'mobx-react';
import geojsonArea from '@mapbox/geojson-area';

L.Icon.Default.imagePath =
  '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/';

const DEFAULT_POSITION = [51.505, -0.09];
const DEFAULT_ZOOM = 5;
const DEFAULT_POLYGON_COLOR = '#9733ff';

@observer
class AreaAttr extends Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
  };

  state = {
    locating: false,
  };

  constructor(props) {
    super(props);
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

    const location = this.props.sample.get('location') || {};
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

  onGeolocate = async () => {
    if (this.state.locating) {
      this.stopGPS();
      return;
    }
    const location = await this.startGPS();
    const map = this.map.current.leafletElement;
    map.setView(new L.LatLng(location.latitude, location.longitude), 15);
  };

  startGPS = () => {
    return new Promise((resolve, reject) => {
      const options = {
        accuracyLimit: 160,

        onUpdate: () => {},

        callback: (error, location) => {
          this.stopGPS();

          if (error) {
            this.stopGPS();
            reject(error);
            return;
          }
          resolve(location);
        },
      };

      const locatingJobId = GPS.start(options);
      this.setState({ locating: locatingJobId });
    });
  };

  stopGPS = () => {
    GPS.stop(this.state.locating);
    this.setState({ locating: false });
  };

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

    if (this.state.locating) {
      this.stopGPS();
    }
  }

  setEditedShape = e => e.layers.eachLayer(layer => this.setShape({ layer }));

  setShape = async e => {
    const geojson = e.layer.toGeoJSON();
    const area = Math.floor(geojsonArea.geometry(geojson.geometry));
    const shape = geojson.geometry.coordinates[0];
    this.zoomToShape(shape);

    const [longitude, latitude] = shape[0];
    this.props.sample.save({
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
    this.props.sample.save({
      location: null,
    });
  };

  render() {
    return (
      <div className="leaflet-container">
        <Map ref={this.map} zoom={DEFAULT_ZOOM} onClick={this.handleClick}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://api.mapbox.com/styles/v1/cehapps/cipqvo0c0000jcknge1z28ejp/tiles/256/{z}/{x}/{y}?access_token={accessToken}"
            accessToken={CONFIG.map.mapbox_api_key}
          />
          <LeafletControl position="topleft">
            <button
              className={`geolocate-btn ${this.state.locating ? 'spin' : ''}`}
              onClick={this.onGeolocate}
            >
              <IonIcon name="md-locate" size="large" />
            </button>
          </LeafletControl>
        </Map>
      </div>
    );
  }
}

export default AreaAttr;
