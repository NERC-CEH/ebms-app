import React, { FC, useEffect, useState } from 'react';
import Sheet, { SheetRef } from 'react-modal-sheet';
import { useIonViewWillLeave } from '@ionic/react';
import { observer } from 'mobx-react';
import turf from '@turf/distance';
import { Point } from 'common/types';
import BottomSheetPointEntry from './BottomSheetPointEntry';

const SNAP_POSITIONS = [0.8, 0.7, 0.6, 0.5, 0.4, 0.22, 0.05];
const DEFAULT_SNAP_POSITION = SNAP_POSITIONS.length - 2;

interface Props {
  pointData: any;
  centroid: any;
  updateRecord: any;
}

const BottomSheet: FC<Props> = ({ pointData, centroid, updateRecord }) => {
  const pointDataWrap: any = pointData;
  const [unmountState, setUnmount] = useState<boolean>(false);
  const [pointsWithDistance, setDistance] = useState<any>([]);

  const ref = React.useRef<SheetRef>();
  const snapTo = (i: number) => ref.current?.snapTo(i);
  const onClose = () => () => snapTo;

  const getDistance: any = () => {
    const getPointsWithDistance: any = (point: Point) => {
      const from = [point.longitude, point.latitude]; // turf long, lat first
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

  const getPoint = (point: Point) => (
    <BottomSheetPointEntry
      key={point.id}
      point={point}
      updateRecord={updateRecord}
    />
  );

  const getPoints = () => pointsWithDistance.sort(byDistance).map(getPoint);

  const unMountBottomSheet = () => setUnmount(true); // hack, this component is mounted as a parent with root div
  useIonViewWillLeave(unMountBottomSheet);

  if (unmountState) return null;

  return (
    <Sheet
      id="bottom-sheet"
      ref={ref}
      isOpen
      snapPoints={SNAP_POSITIONS}
      initialSnap={DEFAULT_SNAP_POSITION}
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
