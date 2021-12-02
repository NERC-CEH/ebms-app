import React, { FC, memo } from 'react';
import { MothTrap } from 'common/types';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import Sample from 'models/sample';
import Marker from './Marker';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';

const forceSkipRefresh = (prevProps: any, nextProps: any) =>
  prevProps.mothTraps.length === nextProps.mothTraps.length;

interface Props {
  mothTraps: MothTrap[];
  onLocationSelect: any;
  sample: typeof Sample;
  isDisabled?: boolean;
}

const MarkerClusterGroupWrap: FC<Props> = ({
  mothTraps,
  onLocationSelect,
  sample,
  isDisabled,
}) => {
  const hasLocationMatch = (smp: typeof Sample, point: MothTrap) =>
    smp.attrs.location?.id === point.id;

  const getMarker = (point: MothTrap): JSX.Element => (
    <Marker
      key={point.id}
      point={point}
      onSelect={onLocationSelect}
      isSelected={hasLocationMatch(sample, point)}
      isDisabled={isDisabled}
    />
  );
  if (mothTraps.length === null) return null;
  const markers = mothTraps.map(getMarker);

  return <MarkerClusterGroup>{markers}</MarkerClusterGroup>;
};

export default memo(MarkerClusterGroupWrap, forceSkipRefresh);
