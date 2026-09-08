import { useMapFlyToCurrentLocation, MapContainer } from '@flumens';
import GPS from 'helpers/GPS';

const GeolocateButton = () => {
  const { isLocating, centerMapToCurrentLocation } = useMapFlyToCurrentLocation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
