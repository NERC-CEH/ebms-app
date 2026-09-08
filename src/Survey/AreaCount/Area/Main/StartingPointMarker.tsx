import { CircleMarker, Location } from '@flumens';

type Props = Location;

const StartingPointMarker = ({ shape }: Props) => {
  const isShapePolyline = shape?.type === 'LineString';
  if (!isShapePolyline) return null;

  const startPosition = shape.coordinates[0];
  if (!startPosition?.length) return null;

  const [longitude, latitude] = startPosition;

  return (
    <CircleMarker
      id="start"
      latitude={latitude}
      longitude={longitude}
      paint={{
        'circle-radius': 10,
        'circle-color': 'white',
        'circle-opacity': 1,
        'circle-stroke-color': 'white',
      }}
    />
  );
};

export default StartingPointMarker;
