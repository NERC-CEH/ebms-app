import { useEffect } from 'react';
import { useMapFlyToCurrentLocation, MapContainer } from '@flumens';
import GPS from 'helpers/GPS';

type Props = {
  autoLocate?: boolean;
};

const GeolocateButton = ({ autoLocate = false }: Props) => {
  const { isLocating, centerMapToCurrentLocation } = useMapFlyToCurrentLocation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GPS as any
  );

  useEffect(() => {
    if (autoLocate) {
      centerMapToCurrentLocation();
    }
  }, [autoLocate]);

  return (
    <MapContainer.Control.Geolocate
      isLocating={isLocating}
      onClick={centerMapToCurrentLocation}
    />
  );
};

export default GeolocateButton;
