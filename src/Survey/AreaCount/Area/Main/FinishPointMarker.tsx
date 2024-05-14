import { CircleMarker, Location } from '@flumens';

type Props = Location & { active: boolean };

const FinishPointMarker = ({ shape, active }: Props) => {
  const isShapePolyline =
    shape?.type === 'LineString' && Array.isArray(shape?.coordinates);

  const [longitude, latitude] = isShapePolyline
    ? shape.coordinates.at(-1)!
    : [];

  const isValidLocation =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  if (!isShapePolyline || !isValidLocation) return null;

  const paint = active
    ? {
        'circle-radius': 10,
        'circle-color': '#f04141',
        'circle-opacity': 1,
        'circle-stroke-color': 'white',
      }
    : {
        'circle-radius': 10,
        'circle-color': 'black',
        'circle-stroke-color': 'white',
      };

  return (
    <CircleMarker
      id="finish"
      latitude={latitude}
      longitude={longitude}
      paint={paint}
    />
  );
};

export default FinishPointMarker;
