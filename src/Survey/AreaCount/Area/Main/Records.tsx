import { useContext, useMemo } from 'react';
import type { Feature, FeatureCollection, Point } from 'geojson';
import { useRouteMatch } from 'react-router';
import { MapContainer } from '@flumens';
import { NavContext } from '@ionic/react';
import Sample from 'models/sample';

type Props = { sample: Sample };

const Records = ({ sample }: Props) => {
  const match = useRouteMatch();
  const { navigate } = useContext(NavContext);

  type RecordProperties = { id?: string; occId?: string; type: 'record' };

  const onRecordClick = (feature: Feature<Point, RecordProperties>) => {
    const { id, occId } = feature.properties;
    if (!id || !occId) return; // in case occ was not fetched from remote

    const url = match.url.split('/area');
    url.pop();
    navigate(`${url}/samples/${id}/occ/${occId}`);
  };

  const getGeoJSONfromRecords = (
    samples?: Sample[]
  ): FeatureCollection<Point, RecordProperties> => {
    const getFeature = (smp: Sample): Feature<Point, RecordProperties> => ({
      type: 'Feature',
      properties: {
        id: smp.cid,
        occId: smp.occurrences[0]?.cid,
        type: 'record',
      },
      geometry: {
        type: 'Point',
        coordinates: [
          smp.data.location?.longitude as number,
          smp.data.location?.latitude as number,
          0.0,
        ],
      },
    });

    return {
      type: 'FeatureCollection',
      features: samples?.map(getFeature) || [],
    };
  };

  const data = useMemo(() => getGeoJSONfromRecords(sample.samples), [sample]);

  return (
    <MapContainer.Cluster data={data}>
      <MapContainer.Cluster.Clusters />
      <MapContainer.Cluster.Markers
        onClick={onRecordClick}
        paint={{ 'circle-color': '#df9100' }}
      />
    </MapContainer.Cluster>
  );
};

export default Records;
