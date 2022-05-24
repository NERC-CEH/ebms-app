import { useRef, FC, useState } from 'react';
import Sheet, { SheetRef } from 'react-modal-sheet';
import Sample from 'models/sample';
import appModel from 'models/app';
import locations from 'models/collections/locations';
import MothTrap from 'models/location';
import { InfoMessage, device } from '@flumens';
import {
  useIonViewWillLeave,
  useIonViewWillEnter,
  IonButton,
} from '@ionic/react';
import { observer } from 'mobx-react';
import turf from '@turf/distance';
import hasLocationMatch from 'Survey/common/hasLocationMatch';
import { informationCircleOutline } from 'ionicons/icons';
import BottomSheetMothTrapEntry from './BottomSheetMothTrapEntry';

const SNAP_POSITIONS = [0.8, 0.5, 0.22, 0.05];
const DEFAULT_SNAP_POSITION = SNAP_POSITIONS.length - 2;
const DEFAULT_SNAP_POSITION_IF_NO_CONNECTION = 1;

interface Props {
  mothTraps: typeof locations;
  updateRecord: (mothTrap: MothTrap) => void;
  deleteTrap: (mothTrap: MothTrap) => void;
  uploadTrap: (mothTrap: MothTrap) => void;
  sample: Sample;
  centroid: number[];
}

const BottomSheet: FC<Props> = ({
  mothTraps,
  updateRecord,
  deleteTrap,
  uploadTrap,
  sample,
  centroid,
}) => {
  const [isMounted, setUnmount] = useState(true);

  const ref = useRef<SheetRef>();
  const snapTo = (i: number) => ref.current?.snapTo(i);
  const onClose = () => snapTo(SNAP_POSITIONS.length - 1); // prevent full closure

  type MothTrapWithDistance = [MothTrap, number];

  const getMothTrapWithDistance = (
    mothTrap: MothTrap
  ): MothTrapWithDistance => {
    if (!mothTrap.attrs.location?.latitude) return [mothTrap, 0];

    const { latitude, longitude } = mothTrap.attrs?.location;

    const from = [longitude, latitude]; // turf long, lat first
    const to = [...centroid].reverse(); // turf long, lat first
    const distance = turf(from, to, { units: 'kilometers' });

    return [mothTrap, parseFloat(distance.toFixed(2))];
  };

  const byDistance = (
    [, distanceA]: MothTrapWithDistance,
    [, distanceB]: MothTrapWithDistance
  ) => distanceA - distanceB;

  const byUploadStatus = ([trap]: MothTrapWithDistance) =>
    trap.isDraft() ? -1 : 1;

  const getMothTrap = ([mothTrap, distance]: any) => (
    <BottomSheetMothTrapEntry
      key={mothTrap.id || mothTrap.cid}
      mothTrap={mothTrap}
      updateRecord={updateRecord}
      deleteTrap={deleteTrap}
      onUpload={uploadTrap}
      distance={distance}
      isSelected={hasLocationMatch(sample, mothTrap)}
    />
  );

  const getMothTraps = () => {
    if (!mothTraps.length) {
      return (
        <InfoMessage
          icon={informationCircleOutline}
          color="black"
          className="info-message"
        >
          You do not have any moth traps yet.
          {appModel.attrs.useExperiments && (
            <IonButton routerLink="/location">Create first moth trap</IonButton>
          )}
        </InfoMessage>
      );
    }

    return [...mothTraps]
      .map(getMothTrapWithDistance)
      .sort(byDistance)
      .sort(byUploadStatus)
      .map(getMothTrap);
  };

  const unMountBottomSheet = () => setUnmount(false); // hack, this component is mounted as a parent with root div
  const mountBottomSheet = () => setUnmount(true); // hack, this component is mounted as a parent with root div
  useIonViewWillLeave(unMountBottomSheet);
  useIonViewWillEnter(mountBottomSheet);

  const defeaultPosition = device.isOnline
    ? DEFAULT_SNAP_POSITION
    : DEFAULT_SNAP_POSITION_IF_NO_CONNECTION;

  return (
    <Sheet
      id="bottom-sheet"
      ref={ref}
      isOpen={isMounted}
      onClose={onClose}
      snapPoints={SNAP_POSITIONS}
      initialSnap={defeaultPosition}
    >
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content>{getMothTraps()}</Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
};

export default observer(BottomSheet);
