import { useEffect } from 'react';
import { useMap } from 'react-map-gl';
import { CircleMarker, Location } from '@flumens';

const DEFAULT_LOCATED_ZOOM = 15;

type Props = Location & { active: boolean; tracked: boolean };

const clone = (obj: any) => JSON.parse(JSON.stringify(obj));

const FinishPointMarker = ({ shape, active, tracked }: Props) => {
  const isShapePolyline = shape?.type === 'LineString';

  const endPosition = isShapePolyline ? clone(shape?.coordinates)?.at(-1) : [];
  const [longitude, latitude] = endPosition || [];

  const isValidLocation =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  const mapRef = useMap();
  const centerToLastTrackPoint = () => {
    if (!isShapePolyline || !active || !tracked || !isValidLocation) return;

    const currentZoom = mapRef.current?.getZoom();

    const zoom =
      currentZoom! > DEFAULT_LOCATED_ZOOM ? currentZoom : DEFAULT_LOCATED_ZOOM;

    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom,
      speed: 2,
    });
  };
  useEffect(centerToLastTrackPoint, [active, latitude, longitude]);

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
