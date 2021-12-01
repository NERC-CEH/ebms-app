import React, { FC, useEffect, useState } from 'react';
import Sheet, { SheetRef } from 'react-modal-sheet';
import Sample from 'models/sample';
import { InfoMessage, device } from '@apps';
import { useIonViewWillLeave } from '@ionic/react';
import { observer } from 'mobx-react';
import turf from '@turf/distance';
import { informationCircleOutline } from 'ionicons/icons';
import { MothTrap } from 'common/types';
import BottomSheetPointEntry from './BottomSheetPointEntry';

const SNAP_POSITIONS = [0.8, 0.7, 0.6, 0.5, 0.4, 0.22, 0.05];
const DEFAULT_SNAP_POSITION = SNAP_POSITIONS.length - 2;
const DEFAULT_SNAP_POSITION_IF_NO_CONNECTION = 1;

const hasLocationMatch = (sample: typeof Sample, point: MothTrap) =>
  sample.attrs.location?.id === point.id;

interface Props {
  pointData: MothTrap;
  updateRecord: any;
  sample: typeof Sample;
  centroid: any;
}

const BottomSheet: FC<Props> = ({
  pointData,
  updateRecord,
  sample,
  centroid,
}) => {
  const pointDataWrap: any = pointData;
  const [unmountState, setUnmount] = useState<boolean>(false);
  const [pointsWithDistance, setDistance] = useState<any>([]);

  const ref = React.useRef<SheetRef>();
  const snapTo = (i: number) => ref.current?.snapTo(i);
  const onClose = () => () => snapTo;

  const getDistance: any = () => {
    const getPointsWithDistance = (point: MothTrap) => {
      const { latitude, longitude } = point;

      const from = [longitude, latitude]; // turf long, lat first
      const to = [...centroid].reverse(); // turf long, lat first
      const distance: number = turf(from, to, { units: 'kilometers' });

      return { ...point, distance: distance.toFixed(2) };
    };

    return setDistance(pointDataWrap.map(getPointsWithDistance));
  };

  const getDistanceWrap = () => getDistance();
  useEffect(getDistanceWrap, [centroid]);

  const byDistance = (pointA: any, pointB: any) =>
    pointA?.distance - pointB?.distance;

  const getPoint = (point: MothTrap) => (
    <BottomSheetPointEntry
      key={point.id}
      point={point}
      updateRecord={updateRecord}
      isSelected={hasLocationMatch(sample, point)}
    />
  );

  const getPoints = () => {
    if (pointsWithDistance.length === 1 && sample.attrs.location) {
      return (
        <InfoMessage
          icon={informationCircleOutline}
          color="black"
          className="info-message"
        >
          You have only one moth trap. To create more please go to the{' '}
          <a href="https://test-brc-ebms.pantheonsite.io/my-moth-trap-sites">
            website.
          </a>
        </InfoMessage>
      );
    }

    if (!pointsWithDistance.length) {
      return (
        <InfoMessage
          icon={informationCircleOutline}
          color="black"
          className="info-message"
        >
          You have not created any moth traps yet. To create one please go to
          the{' '}
          <a href="https://test-brc-ebms.pantheonsite.io/my-moth-trap-sites">
            website.
          </a>
        </InfoMessage>
      );
    }

    return pointsWithDistance.sort(byDistance).map(getPoint);
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
        <Sheet.Content>{getPoints()}</Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
};

export default observer(BottomSheet);
