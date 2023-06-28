import { FC, memo } from 'react';
import { observer } from 'mobx-react';
// eslint-disable-next-line
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import MothTrap from 'common/models/location';
import locationsCollection from 'models/collections/locations';
import Sample from 'models/sample';
import hasLocationMatch from 'Survey/common/hasLocationMatch';
import Marker from './Marker';

const forceSkipRefresh = (prevProps: any, nextProps: any) =>
  prevProps.mothTraps.length === nextProps.mothTraps.length;

interface Props {
  mothTraps: typeof locationsCollection;
  onLocationSelect: (mothTrap: MothTrap) => void;
  sample: Sample;
  isDisabled?: boolean;
}

const MarkerClusterGroupWrap: FC<Props> = ({
  mothTraps,
  onLocationSelect,
  sample,
  isDisabled,
}) => {
  const getMarker = (mothTrap: MothTrap): JSX.Element => (
    <Marker
      key={mothTrap.id || mothTrap.cid}
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

export default memo(observer(MarkerClusterGroupWrap), forceSkipRefresh);
