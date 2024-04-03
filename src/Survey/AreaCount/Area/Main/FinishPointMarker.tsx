import { CircleMarker, Location } from '@flumens';

type Props = Location & { active: boolean };

const clone = (obj: any) => JSON.parse(JSON.stringify(obj));

const FinishPointMarker = ({ shape, active }: Props) => {
  const isShapePolyline = shape?.type === 'LineString';

  const endPosition = isShapePolyline ? clone(shape?.coordinates)?.at(-1) : [];
  const [longitude, latitude] = endPosition || [];

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
