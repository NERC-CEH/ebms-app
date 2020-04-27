import L from 'leaflet';

export default function transformToLatLon(geometry) {
  try {
    const { type } = geometry;
    let { coordinates } = geometry;

    if (type === 'Point') {
      coordinates = [coordinates];
    } else if (type === 'MultiLineString') {
      return geometry.coordinates.map(coord =>
        transformToLatLon({ coordinates: coord })
      );
    }

    return coordinates.map(([y, x]) => {
      const { lat, lng } = L.Projection.SphericalMercator.unproject({ y, x });
      return [lat, lng];
    });
  } catch (e) {
    return [];
  }
}
