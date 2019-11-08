import L from 'leaflet';

export default function transformToLatLon(coordinates) {
  return coordinates.map(([y, x]) => {
    const { lat, lng } = L.Projection.SphericalMercator.unproject({ y, x });
    return [lat, lng];
  });
}
