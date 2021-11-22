import React, { FC, useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import Leaflet from 'leaflet';
import GPS from 'helpers/GPS';
import { locateOutline } from 'ionicons/icons';

interface Props {
  onLocationChange: any;
  map: Leaflet.Map;
  isLocationCurrentlySelected?: boolean;
}

const GPSButton: FC<Props> = ({
  onLocationChange,
  map,
  isLocationCurrentlySelected,
}) => {
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [locatingJobId, setLocating] = useState<any>(false);

  const stopGPS = (forceLocatingJobId?: any) => {
    const isLocatingAndFoundLocation = currentLocation && locatingJobId;
    if (!forceLocatingJobId && !isLocatingAndFoundLocation) return;
    GPS.stop(forceLocatingJobId || locatingJobId);
    setLocating(null);
  };
  useEffect(stopGPS, [currentLocation, locatingJobId]);

  const cleanUpGPSWrap = () => {
    if (!locatingJobId) return;
    stopGPS(locatingJobId);
  };
  const cleanUpGPS = () => cleanUpGPSWrap;
  useEffect(cleanUpGPS, [locatingJobId]);

  const onPosition = (error: any, newLocation: any) => {
    if (error) throw error;
    setCurrentLocation(newLocation);
    onLocationChange(newLocation);
  };

  const onGeolocate = () => {
    if (locatingJobId) {
      stopGPS(locatingJobId);
      return;
    }
    const jobId: number = GPS.start(onPosition);
    setCurrentLocation(null);
    setLocating(jobId);
  };

  const runGPS = () => {
    if (!map && !isLocationCurrentlySelected) return;
    onGeolocate();
  };

  useEffect(runGPS, [map]);

  return (
    <button
      className={`geolocate-btn ${locatingJobId ? 'spin' : ''}`}
      onClick={onGeolocate}
    >
      <IonIcon icon={locateOutline} mode="md" size="large" />
    </button>
  );
};

export default GPSButton;
