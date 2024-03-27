import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { informationCircleOutline } from 'ionicons/icons';
import { InfoMessage, device } from '@flumens';
import {
  useIonViewWillLeave,
  useIonViewWillEnter,
  IonButton,
  IonContent,
  IonModal,
  IonHeader,
  IonToolbar,
  IonIcon,
} from '@ionic/react';
import turf from '@turf/distance';
import locations from 'models/collections/locations';
import MothTrap from 'models/location';
import Sample from 'models/sample';
import hasLocationMatch from 'Survey/common/hasLocationMatch';
import BottomSheetMothTrapEntry from './BottomSheetMothTrapEntry';

const SNAP_POSITIONS = [0.05, 0.22, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.22;
const DEFAULT_SNAP_POSITION_IF_NO_CONNECTION = 0.05;

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

  type MothTrapWithDistance = [MothTrap, number];

  const getMothTrapWithDistance = (
    mothTrap: MothTrap
  ): MothTrapWithDistance => {
    if (!mothTrap.attrs.location?.latitude) return [mothTrap, 0];

    const { latitude, longitude } = mothTrap.attrs?.location || {};

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
          startAddon={<IonIcon src={informationCircleOutline} />}
          className="info-message"
        >
          You do not have any moth traps yet.
          <IonButton routerLink="/location">Create first moth trap</IonButton>
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
    <div className="wrap-to-prevent-modal-from-crashing">
      <IonModal
        id="bottom-sheet"
        isOpen={isMounted}
        backdropDismiss={false}
        backdropBreakpoint={0.5}
        breakpoints={SNAP_POSITIONS}
        initialBreakpoint={defeaultPosition}
      >
        <IonHeader class="ion-no-border">
          <IonToolbar />
        </IonHeader>
        <IonContent>{getMothTraps()}</IonContent>
      </IonModal>
    </div>
  );
};

export default observer(BottomSheet);
