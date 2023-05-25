import { FC, useEffect, useState, useRef } from 'react';
import {
  IonToolbar,
  IonTitle,
  isPlatform,
  IonIcon,
  IonModal,
  IonContent,
  useIonViewDidEnter,
  useIonViewWillLeave,
  IonHeader,
} from '@ionic/react';
import { Main } from '@flumens';
import CONFIG from 'common/config';
import Sample from 'models/sample';
import { useRouteMatch } from 'react-router';
import L, { LatLngExpression } from 'leaflet';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { starOutline } from 'ionicons/icons';
import 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@flumens/ionic/dist/components/ModelLocationMap/Map/map/leaflet-mapbox-gl';
import hasWebGL from 'common/helpers/webGLSupport';
import { MapContainer, Marker } from 'react-leaflet';
import 'leaflet-draw';
import MapControl from 'common/Components/LeafletControl';
import { observer } from 'mobx-react';
import MapInfo from './MapInfo';
import PastLocationsList from '../common/Components/PastLocationsList';

const SNAP_POSITIONS = [0, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;

const MapBoxAttribution =
  '<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a><input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Leaflet © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong></div>';

const URL =
  'https://api.mapbox.com/styles/v1/cehapps/cipqvo0c0000jcknge1z28ejp/tiles/256/{z}/{x}/{y}?access_token={accessToken}';

L.Icon.Default.imagePath = '/images';

const finishFlag = L.divIcon({
  className: 'finish-flag',
  html: `<span />`,
  iconAnchor: [11, 27],
});

const startFlag = L.divIcon({
  className: 'start-flag',
  html: `<span />`,
  iconAnchor: [11, 27],
});

const lastFlag = L.divIcon({
  className: 'last-flag',
  html: `<span />`,
  iconAnchor: [11, 27],
});

const DEFAULT_ZOOM = 5;

type Props = {
  sample: Sample;
  shape: any;
  setLocation: any;
  areaPretty: any;
  isGPSTracking: boolean;
  isDisabled?: boolean;
};

const AreaAttr: FC<Props> = ({
  sample,
  shape,
  setLocation,
  areaPretty,
  isGPSTracking,
  isDisabled,
}) => {
  const [showPastLocations, setShowPastLocations] = useState(false);
  const [currentMapCenter, setMapCurrentCenter] = useState([51, -1]);

  const buttonRef = useRef<any>(null);
  const fixFavBtnClickMapPropagation = () =>
    buttonRef.current && L.DomEvent.disableClickPropagation(buttonRef.current);
  useIonViewDidEnter(fixFavBtnClickMapPropagation);

  const fixOpenModalWhenLeavingPage = () => setShowPastLocations(false);
  useIonViewWillLeave(fixOpenModalWhenLeavingPage);

  const onSelectPastLoaction = (location: any) => {
    if (sample.isGPSRunning()) sample.stopGPS();
    setShowPastLocations(false);

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = location;
    sample.save();
  };

  const disableTapForIOS = !isPlatform('ios'); // TODO: https://github.com/Leaflet/Leaflet/issues/7255

  const [map, setMap]: any = useState(null);

  const setTileLayer = (mapRef: L.Map) => {
    const suppportsWebGL = hasWebGL();

    if (suppportsWebGL) {
      (L as any)
        .mapboxGL({
          accessToken: CONFIG.map.mapboxApiKey,
          style: 'mapbox://styles/mapbox/satellite-streets-v11',
          // eslint-disable-next-line
          // @ts-ignore
          attribution: MapBoxAttribution,
        })
        .addTo(mapRef);
    } else {
      L.tileLayer(URL, {
        attribution: MapBoxAttribution,
        accessToken: CONFIG.map.mapboxApiKey,
      }).addTo(mapRef);
    }

    setMap(mapRef);
  };

  const match = useRouteMatch();

  const hasLocation =
    sample.attrs.location?.latitude || sample.attrs.location?.longitude;

  const startPointLocation: LatLngExpression = [
    sample.attrs.location?.latitude,
    sample.attrs.location?.longitude,
  ];
  const endPointLocation = sample.attrs.location?.shape?.coordinates?.length
    ? sample.attrs.location?.shape?.coordinates?.slice().reverse()
    : null;

  const finishPosition =
    endPointLocation && endPointLocation[0].slice().reverse();
  const isFinished = sample.metadata.saved || sample.isTimerFinished();
  const isShapePolyline = sample.attrs.location?.shape?.type === 'LineString';
  const showStartMarker = isShapePolyline && hasLocation;
  const showLastMarker = isShapePolyline && endPointLocation;
  const lastIcon = isFinished ? finishFlag : lastFlag;

  const attachOnMoveWrap = () => {
    const attachOnMove = () => {
      if (!map) return;
      const onMoveEnd = (): void => {
        const { lat, lng } = map.getCenter();

        setMapCurrentCenter([lat, lng]);
      };

      map.on('moveend', onMoveEnd);
    };
    attachOnMove();

    return function cleanup() {
      if (!map) return;

      map.off('moveend');
    };
  };

  useEffect(attachOnMoveWrap, [map]);

  return (
    <Main className={`${isGPSTracking ? 'GPStracking' : ''}`}>
      <IonToolbar id="area-edit-toolbar">
        <IonTitle slot="start">{areaPretty}</IonTitle>
      </IonToolbar>

      <MapContainer
        tap={disableTapForIOS}
        zoom={DEFAULT_ZOOM}
        whenCreated={setTileLayer}
      >
        {showStartMarker && (
          <Marker position={startPointLocation} icon={startFlag} />
        )}

        {showLastMarker && <Marker position={finishPosition} icon={lastIcon} />}

        <MapInfo
          sample={sample}
          isDisabled={isDisabled}
          setLocation={setLocation}
          shape={shape}
          match={match}
        />

        {!isGPSTracking && (
          <MapControl position="topleft" className="favorite-btn">
            <button
              ref={buttonRef}
              className="geolocate-btn"
              onClick={(e: any) => {
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);
                e.preventDefault();
                e.stopPropagation();

                setShowPastLocations(true);
              }}
            >
              <IonIcon icon={starOutline} mode="md" size="large" />
            </button>
          </MapControl>
        )}
      </MapContainer>

      <div className="wrap-to-prevent-modal-from-crashing">
        <IonModal
          id="bottom-sheet-tracks"
          isOpen={showPastLocations}
          backdropDismiss={false}
          backdropBreakpoint={0.5}
          breakpoints={SNAP_POSITIONS}
          initialBreakpoint={DEFAULT_SNAP_POSITION}
          canDismiss
          onIonModalWillDismiss={() => {
            setShowPastLocations(false);
          }}
        >
          <IonHeader class="ion-no-border">
            <IonToolbar />
          </IonHeader>
          <IonContent>
            <PastLocationsList
              onSelect={onSelectPastLoaction}
              position={currentMapCenter}
            />
          </IonContent>
        </IonModal>
      </div>
    </Main>
  );
};

export default observer(AreaAttr);
