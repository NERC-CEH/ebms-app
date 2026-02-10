import { useMemo } from 'react';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import { FeatureCollection, LineString, Point, Polygon } from 'geojson';
import { Layer, Source } from 'react-map-gl/mapbox';
import wkt from 'wellknown';
import { transformToLatLon } from '@flumens/utils';
import { MapContainer } from 'common/flumens';
import Location from 'models/location';

type SiteFeatureProperties = {
  id: string;
  type: string;
};

const getShapeFromGeom = (
  geom?: string | null
): Polygon | LineString | undefined => {
  if (!geom) return undefined;

  const geomParsed = wkt.parse(geom) as Polygon | LineString;

  geomParsed.coordinates = transformToLatLon(geomParsed);
  return geomParsed;
};

const getGeoJSONfromRecords = (
  locations?: Location[]
): FeatureCollection<Point, SiteFeatureProperties> => {
  const getFeature = (location: Location) => ({
    type: 'Feature' as const,
    properties: {
      id: location.id || '',
      type: 'record',
    },
    geometry: {
      type: 'Point' as const,
      coordinates: [Number(location.data.lon), Number(location.data.lat), 0.0],
    },
  });

  return {
    type: 'FeatureCollection',
    features: locations?.map(getFeature) || [],
  };
};

const getAreasGeoJSON = (
  locations?: Location[]
): FeatureCollection<Polygon | LineString, SiteFeatureProperties> => {
  const getFeature = (location: Location) => {
    const shape = getShapeFromGeom(location.data.boundaryGeom);
    if (!shape) return null;

    return {
      type: 'Feature' as const,
      properties: {
        id: location.id || '',
        type: 'area',
      },
      geometry: shape,
    };
  };

  return {
    type: 'FeatureCollection',
    features: locations?.map(getFeature).filter(Boolean) || [],
  } as FeatureCollection<Polygon | LineString, SiteFeatureProperties>;
};

type Props = {
  onSelectSite?: (location?: Location) => void;
  locations: Location[];
};

const Sites = ({ onSelectSite, locations }: Props) => {
  const data = useMemo(() => getGeoJSONfromRecords(locations), [locations]);
  const areasData = useMemo(() => getAreasGeoJSON(locations), [locations]);

  const onClick = (feature: any) => {
    const { id } = feature.properties as SiteFeatureProperties;
    const location = locations.find(loc => loc.id === id);
    if (!location) return;

    onSelectSite?.(location);
  };

  return (
    <>
      <Source id="areas-source" type="geojson" data={areasData}>
        <Layer
          id="areas-fill-layer"
          type="fill"
          minzoom={13}
          paint={{ 'fill-color': '#008EEC', 'fill-opacity': 0.3 }}
        />
        <Layer
          id="areas-line-layer"
          type="line"
          minzoom={13}
          paint={{ 'line-color': '#008EEC', 'line-width': 2 }}
        />
      </Source>

      <MapContainer.Cluster data={data} id="sites">
        <MapContainer.Cluster.Clusters id="sites-clusters" />
        <MapContainer.Cluster.Markers id="sites-markers" onClick={onClick} />
      </MapContainer.Cluster>
    </>
  );
};

export default Sites;
