import { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { MapRef, LngLatBounds } from 'react-map-gl';
import { Link } from 'react-router-dom';
import { useToast, device, MapContainer, ElasticOccurrence } from '@flumens';
import { IonSpinner } from '@ionic/react';
import GeolocateButton from 'common/Components/GeolocateButton';
import config from 'common/config';
import { centroids as countries } from 'common/config/countries';
import appModel from 'common/models/app';
import userModel from 'models/user';
import RecordProfiles from './RecordProfiles';
import { fetchRecords, fetchSquares, Square } from './recordsService';
import './styles.scss';

/**
 * Returns square size in meters.
 */
const getSquareSize = (zoomLevel: number) => {
  if (zoomLevel < 8) return 10000;
  if (zoomLevel < 10) return 2000;

  return 1000;
};

const getTotalSquares = (squares: Square[]) => {
  const addSquares = (acc: number, square: Square): number =>
    acc + square.doc_count;

  // protection division from 0, defaulting to 1
  return squares?.reduce(addSquares, 0) || 1;
};

const Map = () => {
  const [mapRef, setMapRef] = useState<{ current?: MapRef }>({});
  const measuredRef = useCallback(
    (node: any) => node && setMapRef({ current: node }),
    []
  );

  const [isFetchingRecords, setFetchingRecords] = useState<any>(null);
  const toast = useToast();

  const [totalSquares, setTotalSquares] = useState<number>(1);
  const [squares, setSquares] = useState<Square[]>([]);
  const [records, setRecords] = useState<ElasticOccurrence[]>([]);

  const userIsLoggedIn = userModel.isLoggedIn();

  const updateRecords = async () => {
    if (
      !mapRef.current ||
      !userIsLoggedIn ||
      !userModel.attrs.verified ||
      !device.isOnline
    )
      return;

    const bounds: LngLatBounds = mapRef.current.getBounds(); // TODO: .pad(0.5); // padding +50%

    const zoomLevel = mapRef.current.getZoom();
    const northWest = bounds.getNorthWest();
    const southEast = bounds.getSouthEast();

    if (northWest.lat === southEast.lat) return; // first time the bounds can be flat

    const shouldFetchRecords = zoomLevel >= 13;
    if (shouldFetchRecords) {
      setFetchingRecords(true);
      const fetchedRecords = await fetchRecords(northWest, southEast).catch(
        toast.error
      );
      // Previous request was cancelled
      if (!fetchedRecords) return;
      setRecords(fetchedRecords);
      setSquares([]);
      setFetchingRecords(false);
      return;
    }

    const squareSize = getSquareSize(zoomLevel);

    setFetchingRecords(true);
    const fetchedSquares = await fetchSquares(
      northWest,
      southEast,
      squareSize
    ).catch(toast.error);

    // Previous request was cancelled
    if (!fetchedSquares) return;
    setRecords([]);

    setTotalSquares(getTotalSquares(fetchedSquares));
    setSquares(fetchedSquares);
    setFetchingRecords(false);
  };

  const updateMapCentre = () => updateRecords();

  const [showRecordsInfo, setShowRecordsInfo] = useState<ElasticOccurrence[]>(
    []
  );
  const closeRecordInfo = () => setShowRecordsInfo([]);

  const updateRecordsFirstTime = () => {
    updateRecords();
  };
  useEffect(updateRecordsFirstTime, [mapRef]);

  const getRecordMarker = (record: ElasticOccurrence) => {
    const [latitude, longitude] = record.location.point
      .split(',')
      .map(parseFloat);

    let fillColor = '#fcb500';
    const status = record.identification.verification_status;
    if (status === 'V') {
      fillColor = '#00bd1a';
    } else if (status === 'R') {
      fillColor = '#f04141';
    }

    return (
      <MapContainer.Marker.Circle
        key={record.id}
        id={record.id}
        longitude={longitude}
        latitude={latitude}
        paint={{
          'circle-radius': 10,
          'circle-stroke-color': 'white',
          'circle-color': fillColor,
          'circle-opacity': 1,
        }}
        onClick={() => setShowRecordsInfo([record])}
      />
    );
  };
  const recordMarkers = records.map(getRecordMarker);

  const getSquareMarker = (square: Square) => {
    const opacity = Number((square.doc_count / totalSquares).toFixed(2));

    // max 90%, min 40%
    const normalizedOpacity = Math.min(Math.max(opacity, 0.4), 0.9);

    const [longitude, latitude] = square.key.split(' ').map(parseFloat);

    const radius = square.size! / 2;
    const padding = 1.1; // extra padding between squares
    const metersToPixels =
      radius / padding / 0.075 / Math.cos((latitude * Math.PI) / 180);

    return (
      <MapContainer.Marker.Circle
        key={square.key}
        id={square.key}
        longitude={longitude}
        latitude={latitude}
        paint={{
          'circle-stroke-color': 'white',
          'circle-color': '#745a8f',
          'circle-opacity': normalizedOpacity,
          'circle-radius': [
            'interpolate',
            ['exponential', 2],
            ['zoom'],
            0,
            0,
            20,
            metersToPixels,
          ],
        }}
      />
    );
  };

  const squareMarkers = squares.map(getSquareMarker);

  let initialViewState;
  const country = countries[appModel.attrs.country];
  if (country?.zoom) {
    initialViewState = { ...country };
  }

  return (
    <MapContainer
      id="user-records"
      ref={measuredRef}
      accessToken={config.map.mapboxApiKey}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
      maxPitch={0}
      maxZoom={20}
      initialViewState={initialViewState}
      onMoveEnd={updateMapCentre}
    >
      {!userIsLoggedIn && (
        <div className="login-message">
          <T>
            You need to <Link to="/user/login">login</Link> to your account to
            be able to view the records.
          </T>
        </div>
      )}

      <GeolocateButton />

      {squareMarkers}

      {recordMarkers}

      <MapContainer.Control>
        {isFetchingRecords ? <IonSpinner /> : <div />}
      </MapContainer.Control>

      {!!showRecordsInfo?.length && (
        <RecordProfiles records={showRecordsInfo} onClose={closeRecordInfo} />
      )}
    </MapContainer>
  );
};

export default observer(Map);
