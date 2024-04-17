import { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { informationCircleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { InfoMessage, device, Button } from '@flumens';
import {
  useIonViewWillLeave,
  useIonViewWillEnter,
  IonContent,
  IonModal,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonList,
  NavContext,
} from '@ionic/react';
import turf from '@turf/distance';
import MothTrap from 'models/location';
import Sample from 'models/sample';
import hasLocationMatch from 'Survey/common/hasLocationMatch';
import Entry from './Entry';

const SNAP_POSITIONS = [0.05, 0.22, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.5;
const DEFAULT_SNAP_POSITION_IF_NO_CONNECTION = 1;

interface Props {
  mothTraps: MothTrap[];
  updateRecord: (mothTrap: MothTrap) => void;
  deleteTrap: (mothTrap: MothTrap) => void;
  uploadTrap: (mothTrap: MothTrap) => void;
  createTrap: () => void;
  sample: Sample;
  centroid: number[];
}

const BottomSheet = ({
  mothTraps,
  updateRecord,
  deleteTrap,
  uploadTrap,
  createTrap,
  sample,
  centroid,
}: Props) => {
  const { navigate } = useContext(NavContext);
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
    <Entry
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
          prefix={<IonIcon src={informationCircleOutline} className="size-6" />}
          className="info-message"
        >
          You do not have any moth traps yet.
          <Button
            onPress={() => navigate('/location')}
            className="mx-auto my-2 px-4 py-1"
          >
            Create first moth trap
          </Button>
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

  const defaultPosition = device.isOnline
    ? DEFAULT_SNAP_POSITION
    : DEFAULT_SNAP_POSITION_IF_NO_CONNECTION;

  return (
    <div className="wrap-to-prevent-modal-from-crashing">
      <IonModal
        isOpen={isMounted}
        backdropDismiss={false}
        backdropBreakpoint={0.5}
        breakpoints={SNAP_POSITIONS}
        initialBreakpoint={defaultPosition}
        className="[&::part(handle)]:mt-2"
      >
        <IonHeader class="ion-no-border">
          <IonToolbar className="ion-no-padding !p-0 [--background:var(--ion-page-background)] [--min-height:20px]">
            <div className="flex justify-between gap-4 px-2 py-1">
              <div className="flex items-center px-2 font-semibold text-black">
                <T>Moth traps</T>
              </div>
              <Button
                color="secondary"
                onPress={createTrap}
                className="px-4 py-1"
              >
                Add
              </Button>
            </div>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <IonList className="mt-2 flex flex-col gap-2">
            {getMothTraps()}
          </IonList>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default observer(BottomSheet);
