import React, { FC, memo } from 'react';
import { MothTrap } from 'common/types';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import Sample from 'models/sample';
import UserModelTypes from 'models/userModel';
import Marker from './Marker';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';

const forceSkipRefresh = () => true;

interface Props {
  userModel: typeof UserModelTypes;
  onLocationSelect: any;
  sample: typeof Sample;
}

const MarkerClusterGroupWrap: FC<Props> = ({
  userModel,
  onLocationSelect,
  sample,
}) => {
  const { mothTraps } = userModel.attrs;

  const hasLocationMatch = (smp: typeof Sample, point: MothTrap) =>
    smp.attrs.location?.id === point.id;

  const getMarker = (point: MothTrap): JSX.Element => (
    <Marker
      key={point.id}
      point={point}
      onSelect={onLocationSelect}
      isSelected={hasLocationMatch(sample, point)}
    />
  );
  if (mothTraps.length === null) return null;
  const markers = mothTraps.map(getMarker);

  return <MarkerClusterGroup>{markers}</MarkerClusterGroup>;
};

export default memo(MarkerClusterGroupWrap, forceSkipRefresh);
