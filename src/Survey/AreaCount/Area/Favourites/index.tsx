import { Location } from '@flumens';
import { IonModal, IonHeader, IonToolbar, IonContent } from '@ionic/react';
import Sample from 'models/sample';
import PastLocationsList from 'Survey/AreaCount/common/Components/PastLocationsList';
import Control from './Control';
import './styles.scss';

const SNAP_POSITIONS = [0, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;

type Props = {
  sample: Sample;
  isOpen: boolean;
  onClose: any;
  onCreateNewLocation: any;
  onSelectPastLocation: any;
  currentLocation: [number, number];
};

const Favourites = ({
  sample,
  isOpen,
  onClose,
  currentLocation,
  onCreateNewLocation,
  onSelectPastLocation,
}: Props) => {
  const onSelectPastLocationWrap = (location: Location) => {
    onClose();
    onSelectPastLocation(location);
  };

  return (
    <IonModal
      id="bottom-sheet-tracks"
      isOpen={isOpen}
      backdropDismiss={false}
      backdropBreakpoint={0.5}
      breakpoints={SNAP_POSITIONS}
      initialBreakpoint={DEFAULT_SNAP_POSITION}
      canDismiss
      onIonModalWillDismiss={onClose}
    >
      <IonHeader class="ion-no-border">
        <IonToolbar>
          <div className="flex justify-between">
            <div className="px-2 py-1 font-semibold text-black">Locations:</div>
            <button
              className="rounded-lg bg-secondary px-2 py-1"
              onClick={onCreateNewLocation}
            >
              Add New
            </button>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PastLocationsList
          onSelect={onSelectPastLocationWrap}
          position={currentLocation}
        />
      </IonContent>
    </IonModal>
  );
};

Favourites.Control = Control;

export default Favourites;
