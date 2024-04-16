import { toJS } from 'mobx';
import wkt from 'wellknown';
import SphericalMercator from '@mapbox/sphericalmercator';

type XYPoint = [number, number];

const merc = new SphericalMercator();

export default function transformToLatLon(geometry: any) {
  try {
    const { type } = geometry;
    let { coordinates } = geometry;

    if (type === 'Point') {
      coordinates = [coordinates];
    } else if (type === 'MultiLineString') {
      const transformToLatLonWrap = (coord: any) =>
        transformToLatLon({ coordinates: coord });
      return geometry.coordinates.map(transformToLatLonWrap);
    }

    const inverseTransformToLatLon = (point: XYPoint) => merc.inverse(point);
    return coordinates.map(inverseTransformToLatLon);
  } catch (e) {
    return [];
  }
}

function transformToMeters(coordinates: any) {
  const transform = ([lat, lng]: any) => merc.forward([lat, lng]);
  return coordinates.map(transform);
}

export function getGeomString(shape: any) {
  const geoJSON = toJS(shape);
  if (geoJSON.type === 'Polygon') {
    geoJSON.coordinates[0] = transformToMeters(geoJSON.coordinates[0]);
  } else {
    geoJSON.coordinates = transformToMeters(geoJSON.coordinates);
  }

  return wkt.stringify(geoJSON);
}
