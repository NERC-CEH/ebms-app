import L from 'leaflet';

export default function transformToLatLon(geometry) {
  try {
    const { type } = geometry;
    let { coordinates } = geometry;

    if (type === 'Point') {
      coordinates = [coordinates];
    } else if (type === 'MultiLineString') {
      const transformToLatLonWrap = coord =>
        transformToLatLon({ coordinates: coord });
      return geometry.coordinates.map(transformToLatLonWrap);
    }

    const inverseTransformToLatLon = ([y, x]) => {
      const { lat, lng } = L.Projection.SphericalMercator.unproject({ y, x });
      return [lat, lng];
    };
    return coordinates.map(inverseTransformToLatLon);
  } catch (e) {
    return [];
  }
}
