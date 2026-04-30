import { useMemo } from 'react';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import {
  FeatureCollection,
  LineString,
  MultiPolygon,
  Point,
  Polygon,
} from 'geojson';
import { Layer, Source } from 'react-map-gl/mapbox';
import wkt from 'wellknown';
import { MapContainer, getGeomMetersToLatLon } from '@flumens';
import Location from 'models/location';

type SiteFeatureProperties = {
  id: string;
  type: string;
};

type AreaShape = Polygon | LineString | MultiPolygon;

const getShapeFromGeom = (geom?: string | null) => {
  if (!geom) return null;

  const geomParsed = wkt.parse(geom) as AreaShape;
  if (geomParsed?.type === 'MultiPolygon') return null;

  return getGeomMetersToLatLon(geomParsed) as AreaShape;
};

const getGeoJSONfromRecords = (
  locations?: Location[],
  selectedLocationId?: string
): FeatureCollection<Point, SiteFeatureProperties> => {
  const getFeature = (location: Location) => ({
    type: 'Feature' as const,
    properties: {
      id: location.id || '',
      selected: location.id === selectedLocationId && 'yes',
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
): FeatureCollection<AreaShape, SiteFeatureProperties> => {
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
  } as FeatureCollection<AreaShape, SiteFeatureProperties>;
};

type Props = {
  onSelectSite?: (location?: Location) => void;
  locations: Location[];
  selectedLocationId?: string;
};

type SiteMarkerFeature = {
  properties?: SiteFeatureProperties;
};

const Sites = ({ onSelectSite, locations, selectedLocationId }: Props) => {
  const data = useMemo(
    () => getGeoJSONfromRecords(locations, selectedLocationId),
    [locations, selectedLocationId]
  );
  const areasData = useMemo(() => getAreasGeoJSON(locations), [locations]);

  const onClick = (feature: SiteMarkerFeature) => {
    if (!feature.properties) return;

    const { id } = feature.properties;
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
        <MapContainer.Cluster.Markers
          id="sites-markers"
          onClick={onClick}
          paint={{
            'circle-color': [
              'match',
              ['get', 'selected'],
              'yes',
              '#df9100',
              /* other */ '#745a8f',
            ],
          }}
        />
      </MapContainer.Cluster>
    </>
  );
};

export default Sites;
