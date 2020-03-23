import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonIcon,
  IonContent,
  IonLifeCycleContext,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import { locate } from 'ionicons/icons';
import CONFIG from 'config';
import L from 'leaflet';
import GPS from 'helpers/GPS';
import { Map, TileLayer } from 'react-leaflet';
import LeafletControl from 'react-leaflet-control';
import 'leaflet-draw';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.imagePath = '/images';

const DEFAULT_POSITION = [51.505, -0.09];
const DEFAULT_ZOOM = 5;
const DEFAULT_LOCATED_ZOOM = 18;
const DEFAULT_SHAPE_COLOR = '#9733ff';

function translateDrawInterface() {
  L.drawLocal.draw.toolbar.actions.text = t('Cancel');
  L.drawLocal.draw.toolbar.finish.text = t('Finish');
  L.drawLocal.draw.toolbar.undo.text = t('Delete last point');
  L.drawLocal.edit.toolbar.actions.save.text = t('Save');
  L.drawLocal.edit.toolbar.actions.cancel.text = t('Cancel');
  L.drawLocal.edit.toolbar.actions.clearAll.text = t('Clear All');
  L.drawLocal.edit.handlers.edit.tooltip = {
    text: t('Drag handles or markers to edit features.'),
    subtext: t('Click cancel to undo changes.'),
  };
  L.drawLocal.draw.handlers.polygon.tooltip = {
    start: t('Click to start drawing shape.'),
    cont: t('Click to continue drawing shape.'),
    end: t('Click first point to close this shape.'),
  };
  L.drawLocal.draw.handlers.polyline = {
    tooltip: {
      start: t('Click to start drawing line.'),
      cont: t('Click to continue drawing line.'),
      end: t('Click last point to finish line.'),
    },
  };
}


L.Draw.Polyline.prototype._onTouch = L.Util.falseFn;

@observer
class AreaAttr extends Component {
  static contextType = IonLifeCycleContext;

  static propTypes = {
    location: PropTypes.object.isRequired,
    setLocation: PropTypes.func.isRequired,
    areaPretty: PropTypes.string.isRequired,
    isGPSTracking: PropTypes.bool.isRequired,
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
          allowIntersection: true, // to edit GPS messed up polygon
        },
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);
    translateDrawInterface();

    return drawnItems;
  }

  setExistingShape(shape) {
    const map = this.map.current.leafletElement;

    if (shape.type === 'Polygon') {
      const positions = shape.coordinates[0].map(coordinates =>
        [...coordinates].reverse().map(float => Number.parseFloat(float))
      );
      const polygon = L.polygon(positions, { color: DEFAULT_SHAPE_COLOR });
      polygon.addTo(this.drawnItems);
      this.zoomToPolygonShape(shape);
      return;
    }

    const positions = shape.coordinates.map(coordinates =>
      [...coordinates].reverse().map(float => Number.parseFloat(float))
    );

    const polyline = L.polyline(positions, { color: DEFAULT_SHAPE_COLOR });
    polyline.addTo(this.drawnItems);
    map.setView(positions[positions.length - 1], DEFAULT_LOCATED_ZOOM);
  }

  componentDidMount() {
    const map = this.map.current.leafletElement;

    // correct map size after animation
    const { location } = this.props;

    this.context.onIonViewDidEnter(() => {
      map.whenReady(() => {
        map.invalidateSize();
        if (location.shape) {
          this.setExistingShape(location.shape);
        }
      });
    });

    this.drawnItems = this.addDrawControls();

    if (location.shape) {
      this.setExistingShape(location.shape);
    } else {
      map.panTo(new L.LatLng(...DEFAULT_POSITION));
    }

    this._onCreatedEventListener = e => {
      this.drawnItems.clearLayers();
      this.drawnItems.addLayer(e.layer);
      this.setShape(e);
    };
    map.on(L.Draw.Event.CREATED, this._onCreatedEventListener);
    map.on(L.Draw.Event.EDITED, this.setEditedShape);
    map.on(L.Draw.Event.DELETED, this.deleteShape);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.shape !== this.props.location.shape) {
      if (this.props.location.shape) {
        this.drawnItems.clearLayers();
        this.setExistingShape(toJS(this.props.location.shape));
      }
    }
  }

  onGeolocate = async () => {
    if (this.state.locating) {
      this.stopGPS();
      return;
    }
    const location = await this.startGPS();
    const map = this.map.current.leafletElement;
    map.setView(
      new L.LatLng(location.latitude, location.longitude),
      DEFAULT_LOCATED_ZOOM
    );
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
    console.log('setging shape!');
    
    const { setLocation } = this.props;
    const geojson = e.layer.toGeoJSON();
    const shape = geojson.geometry;
    setLocation(shape);

    if (shape.type === 'Polygon') {
      this.zoomToPolygonShape(shape);
    }
  };

  deleteShape = () => {
    this.props.setLocation();
  };

  render() {
    const { isGPSTracking, areaPretty } = this.props;
    return (
      <IonContent className={`${isGPSTracking ? 'GPStracking' : ''}`}>
        <IonToolbar id="area-edit-toolbar">
          <IonTitle slot="start">{areaPretty}</IonTitle>
        </IonToolbar>
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
              <IonIcon icon={locate} mode="md" size="large" />
            </button>
          </LeafletControl>
        </Map>
      </IonContent>
    );
  }
}

export default AreaAttr;
