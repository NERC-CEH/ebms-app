import React, { FC, useState } from 'react';
import Sheet, { SheetRef } from 'react-modal-sheet';
import Sample from 'models/sample';
import CONFIG from 'common/config/config';
import { InfoMessage, device } from '@apps';
import { useIonViewWillLeave } from '@ionic/react';
import { observer } from 'mobx-react';
import turf from '@turf/distance';
import hasLocationMatch from 'Survey/common/hasLocationMatch';
import { informationCircleOutline } from 'ionicons/icons';
import { MothTrap } from 'common/types';
import BottomSheetMothTrapEntry from './BottomSheetMothTrapEntry';

const SNAP_POSITIONS = [0.8, 0.5, 0.22, 0.05];
const DEFAULT_SNAP_POSITION = SNAP_POSITIONS.length - 2;
const DEFAULT_SNAP_POSITION_IF_NO_CONNECTION = 1;

interface Props {
  mothTrapData: MothTrap[];
  updateRecord: (mothTrap: MothTrap) => void;
  sample: typeof Sample;
  centroid: number[];
}

const BottomSheet: FC<Props> = ({
  mothTrapData,
  updateRecord,
  sample,
  centroid,
}) => {
  const [unmountState, setUnmount] = useState(false);

  const ref = React.useRef<SheetRef>();
  const snapTo = (i: number) => ref.current?.snapTo(i);
  const onClose = () => () => snapTo;

  const getMothTrapWithDistance = (mothTrap: MothTrap) => {
    const { latitude, longitude } = mothTrap;

    const from = [longitude, latitude]; // turf long, lat first
    const to = [...centroid].reverse(); // turf long, lat first
    const distance = turf(from, to, { units: 'kilometers' });

    return { ...mothTrap, distance: distance.toFixed(2) };
  };

  const byDistance = (mothTrapA: MothTrap, mothTrapB: MothTrap) => {
    if (!mothTrapA?.distance) return -1;
    if (!mothTrapB?.distance) return -1;

    return mothTrapA.distance - mothTrapB.distance;
  };

  const getMothTrap = (mothTrap: MothTrap) => (
    <BottomSheetMothTrapEntry
      key={mothTrap.id}
      mothTrap={mothTrap}
      updateRecord={updateRecord}
      isSelected={hasLocationMatch(sample, mothTrap)}
    />
  );

  const getMothTraps = () => {
    if (mothTrapData.length === 1 && sample.attrs.location) {
      return (
        <InfoMessage
          icon={informationCircleOutline}
          color="black"
          className="info-message"
        >
          You have only one moth trap. To create more please go to the{' '}
          <a href={`${CONFIG.backend.url}/my-moth-trap-sites`}>website.</a>
        </InfoMessage>
      );
    }

    if (!mothTrapData.length) {
      return (
        <InfoMessage
          icon={informationCircleOutline}
          color="black"
          className="info-message"
        >
          You have not created any moth traps yet. To create one please go to
          the <a href={`${CONFIG.backend.url}/my-moth-trap-sites`}>website.</a>
        </InfoMessage>
      );
    }

    return mothTrapData
      .map(getMothTrapWithDistance)
      .sort(byDistance)
      .map(getMothTrap);
  };

  const unMountBottomSheet = () => setUnmount(true); // hack, this component is mounted as a parent with root div
  useIonViewWillLeave(unMountBottomSheet);

  if (unmountState) return null;

  const defeaultPosition = device.isOnline()
    ? DEFAULT_SNAP_POSITION
    : DEFAULT_SNAP_POSITION_IF_NO_CONNECTION;

  return (
    <Sheet
      id="bottom-sheet"
      ref={ref}
      isOpen
      snapPoints={SNAP_POSITIONS}
      initialSnap={defeaultPosition}
      onClose={onClose}
    >
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content>{getMothTraps()}</Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
};

export default observer(BottomSheet);
