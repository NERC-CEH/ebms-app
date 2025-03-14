import { useMemo } from 'react';
import { MapContainer } from '@flumens';
import Location from 'models/location';
import Sample from 'models/sample';
import hasLocationMatch from 'Survey/common/hasLocationMatch';

type Props = {
  sample: Sample;
  onSelect: any;
  mothTraps: Location[];
};

const Traps = ({ sample, onSelect, mothTraps }: Props) => {
  const getGeoJSON = (traps?: Location[]): any => {
    const getFeature = (trap: Location) => ({
      type: 'Feature',
      properties: {
        id: trap.id || trap.cid,
        selected: hasLocationMatch(sample, trap) && 'yes',
        type: 'record',
      },
      geometry: {
        type: 'Point',
        coordinates: [
          trap.data.location?.longitude,
          trap.data.location?.latitude,
          0.0,
        ],
      },
    });

    return {
      type: 'FeatureCollection',
      features: traps?.map(getFeature) || [],
    };
  };

  const data = useMemo(
    // eslint-disable-next-line @getify/proper-arrows/name
    () => getGeoJSON(mothTraps),
    [mothTraps]
  );

  return (
    <MapContainer.Cluster data={data}>
      <MapContainer.Cluster.Clusters />
      <MapContainer.Cluster.Markers
        onClick={onSelect}
        paint={{
          'circle-color': [
            'match',
            ['get', 'selected'],
            'yes',
            '#00b900',
            /* other */ '#df9100',
          ],
        }}
      />
    </MapContainer.Cluster>
  );
};

export default Traps;
