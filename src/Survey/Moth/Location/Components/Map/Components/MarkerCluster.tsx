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
  onLocationSelect: (mothTrap: MothTrap) => void;
  sample: typeof Sample;
  isDisabled?: boolean;
}

const MarkerClusterGroupWrap: FC<Props> = ({
  mothTraps,
  onLocationSelect,
  sample,
  isDisabled,
}) => {
  const hasLocationMatch = (smp: typeof Sample, mothTrap: MothTrap) =>
    smp.attrs.location?.id === mothTrap.id;

  const getMarker = (mothTrap: MothTrap): JSX.Element => (
    <Marker
      key={mothTrap.id}
      mothTrap={mothTrap}
      onSelect={onLocationSelect}
      isSelected={hasLocationMatch(sample, mothTrap)}
      isDisabled={isDisabled}
    />
  );
  if (mothTraps.length === null) return null;
  const markers = mothTraps.map(getMarker);

  return <MarkerClusterGroup>{markers}</MarkerClusterGroup>;
};

export default memo(MarkerClusterGroupWrap, forceSkipRefresh);
