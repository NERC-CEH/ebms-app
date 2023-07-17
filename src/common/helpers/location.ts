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
