import { useMapFlyToCurrentLocation, MapContainer } from '@flumens';
import GPS from 'helpers/GPS';

const GeolocateButton = () => {
  const { isLocating, centerMapToCurrentLocation } = useMapFlyToCurrentLocation(
    GPS as any
  );

  return (
    <MapContainer.Control.Geolocate
      isLocating={isLocating}
      onClick={centerMapToCurrentLocation}
    />
  );
};

export default GeolocateButton;
