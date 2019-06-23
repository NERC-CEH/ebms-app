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
const DEFAULT_SHAPE_COLOR = '#9733ff';
const DEFAULT_TRANSECT_BUFFER = 10; // 2x5m

function calculateLineLenght(lineString) {
  /**
   * Calculate the approximate distance between two coordinates (lat/lon)
   *
   * © Chris Veness, MIT-licensed,
   * http://www.movable-type.co.uk/scripts/latlong.html#equirectangular
   */
  function distance(λ1, φ1, λ2, φ2) {
    const R = 6371000;
    const Δλ = ((λ2 - λ1) * Math.PI) / 180;
    φ1 = (φ1 * Math.PI) / 180; //eslint-disable-line
    φ2 = (φ2 * Math.PI) / 180; //eslint-disable-line
    const x = Δλ * Math.cos((φ1 + φ2) / 2);
    const y = φ2 - φ1;
    const d = Math.sqrt(x * x + y * y);
    return R * d;
  }

  if (lineString.length < 2) return 0;
  let result = 0;
  for (let i = 1; i < lineString.length; i++)
    result += distance(
      lineString[i - 1][0],
      lineString[i - 1][1],
      lineString[i][0],
      lineString[i][1]
    );
  return result;
}

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

  addDrawControls() {
    const map = this.map.current.leafletElement;

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        marker: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        polyline: {
          showLength: true,
          metric: ['m'],
          shapeOptions: {
            color: DEFAULT_SHAPE_COLOR,
          },
        },
        polygon: {
          showArea: true,
          precision: { m: 1 },
          metric: ['m'],
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: "<strong>Sorry, the area can't intersect!",
          },
          shapeOptions: {
            color: DEFAULT_SHAPE_COLOR,
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

    return drawnItems;
  }

  setExistingShape(shape, drawnItems) {
    const map = this.map.current.leafletElement;

    if (shape.type === 'Polygon') {
      const positions = shape.coordinates[0].map(coordinates =>
        [...coordinates].reverse()
      );
      const polygon = L.polygon(positions, { color: DEFAULT_SHAPE_COLOR });
      polygon.addTo(drawnItems);
      this.zoomToPolygonShape(shape);
      return;
    }

    const positions = shape.coordinates.map(coordinates =>
      [...coordinates].reverse()
    );
    const polygon = L.polyline(positions, { color: DEFAULT_SHAPE_COLOR });
    polygon.addTo(drawnItems);
    map.fitBounds(positions);
  }

  componentDidMount() {
    const map = this.map.current.leafletElement;
    const drawnItems = this.addDrawControls();

    const location = this.props.sample.get('location') || {};
    if (location.shape) {
      this.setExistingShape(location.shape, drawnItems);
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

  zoomToPolygonShape(polygon) {
    const map = this.map.current.leafletElement;
    const positions = polygon.coordinates[0].map(coordinates =>
      [...coordinates].reverse()
    );
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
    const shape = geojson.geometry;

    if (geojson.geometry.type === 'Polygon') {
      const area = Math.floor(geojsonArea.geometry(shape));
      const [longitude, latitude] = shape.coordinates[0][0];
      this.zoomToPolygonShape(shape);
      this.props.sample.save({
        location: {
          latitude,
          longitude,
          area,
          shape,
          source: 'map',
        },
      });
      return;
    }

    const area =
      DEFAULT_TRANSECT_BUFFER * calculateLineLenght(shape.coordinates);
    const [longitude, latitude] = shape.coordinates[0];
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
