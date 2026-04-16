// eslint-disable-next-line import-x/no-extraneous-dependencies
import { LineString, Polygon } from 'geojson';
import { Layer, Source } from 'react-map-gl/mapbox';
import wkt from 'wellknown';
import { transformToLatLon } from '@flumens/utils';
import Location from 'models/location';

export const getShapeFromGeom = (
  geom?: string | null
): Polygon | LineString | undefined => {
  if (!geom) return undefined;

  const geomParsed = wkt.parse(geom) as Polygon | LineString;

  geomParsed.coordinates = transformToLatLon(geomParsed);
  return geomParsed;
};

type Props = {
  site?: Location;
};

const SiteBoundary = ({ site }: Props) => {
  const shape = getShapeFromGeom(site?.data.boundaryGeom);
  if (!shape) return null;

  const data = {
    type: 'Feature' as const,
    properties: {},
    geometry: shape,
  };

  return (
    <Source id="site-boundary-source" type="geojson" data={data}>
      <Layer
        id="site-boundary-fill-layer"
        type="fill"
        paint={{ 'fill-color': '#008EEC', 'fill-opacity': 0.15 }}
      />
      <Layer
        id="site-boundary-line-layer"
        type="line"
        paint={{ 'line-color': '#008EEC', 'line-width': 2 }}
      />
    </Source>
  );
};

export default SiteBoundary;
