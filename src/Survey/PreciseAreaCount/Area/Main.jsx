import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonIcon,
  NavContext,
  IonToolbar,
  IonTitle,
  withIonLifeCycle,
} from '@ionic/react';
import { withRouter } from 'react-router';
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

@observer
class AreaAttr extends Component {
  static contextType = NavContext;

  static propTypes = {
    match: PropTypes.object.isRequired,
    sample: PropTypes.object.isRequired,
    shape: PropTypes.object.isRequired,
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
      const reverseCoords = coords =>
        [...coords].reverse().map(Number.parseFloat);
      const positions = shape.coordinates[0].map(reverseCoords);

      const polygon = L.polygon(positions, { color: DEFAULT_SHAPE_COLOR });

      polygon.addTo(this.drawnItems);

      this.zoomToPolygonShape(shape);
      return;
    }

    const reverseCoords = coords =>
      [...coords].reverse().map(Number.parseFloat);
    const positions = shape.coordinates.map(reverseCoords);

    const polyline = L.polyline(positions, { color: DEFAULT_SHAPE_COLOR });
    polyline.addTo(this.drawnItems);
    map.setView(positions[positions.length - 1], DEFAULT_LOCATED_ZOOM);
  }

  ionViewDidEnter = () => {
    this._leaving = false;

    // correct map size after animation
    const { shape } = this.props;

    const map = this.map.current.leafletElement;

    const refreshMap = () => {
      map.invalidateSize();
      if (shape) {
        this.setExistingShape(shape);
      }
    };

    map.whenReady(refreshMap);
  };

  ionViewWillEnter = () => {
    this.updateRecords();
  };

  _onCreatedEventListener = e => {
    this.drawnItems.clearLayers();
    this.drawnItems.addLayer(e.layer);
    this.setShape(e);
  };

  componentDidMount() {
    const map = this.map.current.leafletElement;

    const { shape } = this.props;

    this.drawnItems = this.addDrawControls();

    map.attributionControl.setPrefix('');

    if (shape) {
      this.setExistingShape(shape);
    } else {
      map.panTo(new L.LatLng(...DEFAULT_POSITION));
    }

    map.on(L.Draw.Event.CREATED, this._onCreatedEventListener);
    map.on(L.Draw.Event.EDITED, this.setEditedShape);
    map.on(L.Draw.Event.DELETED, this.deleteShape);
    this.addRecords();
  }

  addRecordsPopup = (sample, marker) => {
    const { match } = this.props;
    const url = match.url.split('/area');
    url.pop();

    const occ = sample.occurrences[0];

    const onMarkerClick = () => {
      if (this._leaving) {
        return;
      }
      this._leaving = true;
      this.context.navigate(`${url}/samples/${sample.cid}/occ/${occ.cid}`);
    };

    marker.on(`click`, onMarkerClick);
  };

  _recordMarkers = [];

  updateRecords = () => {
    const updateMarker = ([marker, smp]) => {
      const { latitude, longitude } = smp.attrs.location || {};
      if (!latitude) {
        return;
      }

      marker.setLatLng([latitude, longitude]);
    };

    this._recordMarkers.forEach(updateMarker);
  };

  addRecords = () => {
    const map = this.map.current.leafletElement;

    const { sample } = this.props;

    const addSurveyMarkerToMap = smp => {
      const marker = getAreaCountMarker(smp);

      if (!marker) {
        return;
      }

      this._recordMarkers.push([marker, smp]);

      this.addRecordsPopup(smp, marker);
      marker.addTo(map);
    };

    sample.samples.forEach(addSurveyMarkerToMap);
  };

  componentDidUpdate(prevProps) {
    if (prevProps.shape !== this.props.shape) {
      if (this.props.shape && this.drawnItems) {
        this.drawnItems.clearLayers();
        this.setExistingShape(toJS(this.props.shape));
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
    const reverseCoords = coords => [...coords].reverse();
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
    e.layers.eachLayer(setShape);
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
            attribution='<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a><input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Leaflet © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong></div>'
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

export default withRouter(withIonLifeCycle(AreaAttr));
