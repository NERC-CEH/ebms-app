import { useContext, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { MapContainer } from '@flumens';
import { NavContext } from '@ionic/react';
import Sample, { AreaCountLocation } from 'models/sample';

type Props = { sample: Sample };

const Records = ({ sample }: Props) => {
  const match = useRouteMatch();
  const { navigate } = useContext(NavContext);

  const onRecordClick = (feature: any) => {
    const { id, occId } = feature.properties;
    if (!id || !occId) return; // in case occ was not fetched from remote

    const url = match.url.split('/area');
    url.pop();
    navigate(`${url}/samples/${id}/occ/${occId}`);
  };

  const getGeoJSONfromRecords = (samples?: Sample[]): any => {
    const getFeature = (smp: Sample) => ({
      type: 'Feature',
      properties: {
        id: smp.cid,
        occId: smp.occurrences[0]?.cid,
        type: 'record',
      },
      geometry: {
        type: 'Point',
        coordinates: [
          (smp.attrs.location as AreaCountLocation).longitude,
          (smp.attrs.location as AreaCountLocation).latitude,
          0.0,
        ],
      },
    });

    return {
      type: 'FeatureCollection',
      features: samples?.map(getFeature) || [],
    };
  };

  const data = useMemo(
    // eslint-disable-next-line @getify/proper-arrows/name
    () => getGeoJSONfromRecords(sample.samples),
    [sample]
  );

  return (
    <MapContainer.Cluster data={data}>
      <MapContainer.Cluster.Clusters />
      <MapContainer.Cluster.Markers
        onClick={onRecordClick}
        paint={{
          'circle-color': '#df9100',
        }}
      />
    </MapContainer.Cluster>
  );
};

export default Records;
