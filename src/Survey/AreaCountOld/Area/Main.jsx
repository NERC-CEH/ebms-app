/* eslint-disable @getify/proper-arrows/name */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonIcon,
  IonLifeCycleContext,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import { Main } from '@apps';
import { locateOutline } from 'ionicons/icons';
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
    isDisabled: PropTypes.bool,
  };

  state = {
    locating: false,
  };

  constructor(props) {
    super(props);
    this.map = React.createRef();
  }

  addDrawControls() {
    const { isDisabled } = this.props;
    const map = this.map.current.leafletElement;

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    if (isDisabled) {
      return drawnItems;
    }

    const draw = {
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
    };

    const edit = {
      poly: {
        allowIntersection: true, // to edit GPS messed up polygon
      },
      featureGroup: drawnItems,
      remove: true,
    };

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw,
      edit,
    });
    map.addControl(drawControl);
    translateDrawInterface();

    return drawnItems;
  }

  setExistingShape(shape) {
    const map = this.map.current.leafletElement;

    if (shape.type === 'Polygon') {
      const toFloatNumber = float => Number.parseFloat(float);
      const reverseCoords = coordinates =>
        [...coordinates].reverse().map(toFloatNumber);
      const positions = shape.coordinates[0].map(reverseCoords);
      const polygon = L.polygon(positions, { color: DEFAULT_SHAPE_COLOR });
      polygon.addTo(this.drawnItems);
      this.zoomToPolygonShape(shape);
      return;
    }

    const toFloatNumber = float => Number.parseFloat(float);
    const reverseCoords = coordinates =>
      [...coordinates].reverse().map(toFloatNumber);
    const positions = shape.coordinates.map(reverseCoords);

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
      if (this.props.location.shape && this.drawnItems) {
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
    const startGPS = (resolve, reject) => {
      const onPosition = (error, location) => {
        this.stopGPS();

        if (error) {
          reject(error);
          return;
        }

        resolve(location);
      };

      const locatingJobId = GPS.start(onPosition);
      this.setState({ locating: locatingJobId });
    };

    return new Promise(startGPS);
  };

  stopGPS = () => {
    GPS.stop(this.state.locating);
    this.setState({ locating: false });
  };

  zoomToPolygonShape(polygon) {
    const map = this.map.current.leafletElement;
    const reverseCoords = coordinates => [...coordinates].reverse();
    const positions = polygon.coordinates[0].map(reverseCoords);
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

  setEditedShape = e => {
    const setShape = layer => this.setShape({ layer });
    return e.layers.eachLayer(setShape);
  };

  setShape = async e => {
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
    const { isGPSTracking, areaPretty, isDisabled } = this.props;
    return (
      <Main className={`${isGPSTracking ? 'GPStracking' : ''}`}>
        <IonToolbar id="area-edit-toolbar">
          <IonTitle slot="start">{areaPretty}</IonTitle>
        </IonToolbar>
        <Map ref={this.map} zoom={DEFAULT_ZOOM} onClick={this.handleClick}>
          <TileLayer
            attribution='<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a> © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
            url="https://api.mapbox.com/styles/v1/cehapps/cipqvo0c0000jcknge1z28ejp/tiles/256/{z}/{x}/{y}?access_token={accessToken}"
            accessToken={CONFIG.map.mapboxApiKey}
          />
          {!isDisabled && (
            <LeafletControl position="topleft">
              <button
                className={`geolocate-btn ${this.state.locating ? 'spin' : ''}`}
                onClick={this.onGeolocate}
              >
                <IonIcon icon={locateOutline} mode="md" size="large" />
              </button>
            </LeafletControl>
          )}
        </Map>
      </Main>
    );
  }
}

export default AreaAttr;
