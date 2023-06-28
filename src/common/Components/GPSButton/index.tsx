import { FC, useState, useEffect } from 'react';
import { locateOutline } from 'ionicons/icons';
import Leaflet from 'leaflet';
import { IonIcon } from '@ionic/react';
import GPS from 'helpers/GPS';
import './styles.scss';

const MAX_ZOOM = 18;

interface Props {
  onLocationChange: any;
  map: Leaflet.Map;
  isLocationCurrentlySelected?: boolean;
  isDisabled?: boolean;
  currentSelectedLocation?: any;
}

const GPSButton: FC<Props> = ({
  onLocationChange,
  map,
  isLocationCurrentlySelected,
  isDisabled,
  currentSelectedLocation,
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
    if (isDisabled && currentSelectedLocation) {
      if (!map) return;

      map.setView(currentSelectedLocation, MAX_ZOOM);
      return;
    }

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
