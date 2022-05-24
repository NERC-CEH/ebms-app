import * as React from 'react';
import { useMap } from 'react-leaflet';
import { withIonLifeCycle, IonIcon, NavContext } from '@ionic/react';
import { locateOutline } from 'ionicons/icons';
import MapControl from 'common/Components/LeafletControl';
import GPS from 'helpers/GPS';
import { toJS } from 'mobx';
import L from 'leaflet';

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

const DEFAULT_POSITION = [51.505, -0.09];
const DEFAULT_LOCATED_ZOOM = 18;
const DEFAULT_SHAPE_COLOR = '#9733ff';

class MapInfo extends React.Component {
  static contextType = NavContext;

  state = {
    locating: false,
  };

  _recordMarkers = [];

  setExistingShape(shape) {
    const { map } = this.props;
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

  addDrawControls() {
    const { isDisabled, map } = this.props;

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

  addRecords = () => {
    const { sample, map } = this.props;

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

  ionViewDidEnter = () => {
    this._leaving = false;

    const { map, shape } = this.props;

    const refreshMap = () => {
      map.invalidateSize();
      if (shape) {
        this.setExistingShape(shape);
      }
    };

    map.whenReady(refreshMap);
  };

  componentDidUpdate(prevProps) {
    if (prevProps.shape !== this.props.shape) {
      if (this.props.shape && this.drawnItems) {
        this.drawnItems.clearLayers();
        this.setExistingShape(toJS(this.props.shape));
      }
    }
  }

  componentDidMount() {
    const { map, shape } = this.props;

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

  _onCreatedEventListener = e => {
    this.drawnItems.clearLayers();
    this.drawnItems.addLayer(e.layer);
    this.setShape(e);
  };

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

  zoomToPolygonShape(polygon) {
    const { map } = this.props;
    const reverseCoords = coords => [...coords].reverse();
    const positions = polygon.coordinates[0].map(reverseCoords);
    map.fitBounds(positions);
  }

  componentWillUnmount() {
    const { map } = this.props;
    map.off(L.Draw.Event.CREATED, this._onCreatedEventListener);
    map.off(L.Draw.Event.EDITED, this.setEditedShape);
    map.off(L.Draw.Event.DELETED, this.deleteShape);

    if (this.state.locating) {
      this.stopGPS();
    }
  }

  stopGPS = () => {
    GPS.stop(this.state.locating);
    this.setState({ locating: false });
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

  onGeolocate = async () => {
    if (this.state.locating) {
      this.stopGPS();
      return;
    }
    const location = await this.startGPS();
    const { map } = this.props;

    map.setView(
      new L.LatLng(location.latitude, location.longitude),
      DEFAULT_LOCATED_ZOOM
    );
  };

  render() {
    return (
      <MapControl position="topleft">
        <button
          className={`geolocate-btn ${this.state.locating ? 'spin' : ''}`}
          onClick={this.onGeolocate}
        >
          <IonIcon icon={locateOutline} mode="md" size="large" />
        </button>
      </MapControl>
    );
  }
}

function withMap(Component) {
  return function WrappedComponent(props) {
    const map = useMap();
    return <Component {...props} map={map} />;
  };
}

export default withMap(withIonLifeCycle(MapInfo));
