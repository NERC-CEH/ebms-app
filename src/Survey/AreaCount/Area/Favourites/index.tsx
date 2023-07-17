import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonContent,
  isPlatform,
} from '@ionic/react';
import Sample from 'models/sample';
import PastLocationsList from 'Survey/AreaCount/common/Components/PastLocationsList';
import Control from './Control';

const SNAP_POSITIONS = [0, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;

type Props = {
  sample: Sample;
  isOpen: boolean;
  onClose: any;
  currentLocation: [number, number];
};

const Favourites = ({ sample, isOpen, onClose, currentLocation }: Props) => {
  const onSelectPastLoaction = (location: any) => {
    if (sample.isGPSRunning()) sample.stopGPS();
    onClose();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = location;
    sample.save();
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
        <IonToolbar />
      </IonHeader>
      <IonContent>
        <PastLocationsList
          onSelect={onSelectPastLoaction}
          position={currentLocation}
        />
      </IonContent>
    </IonModal>
  );
};

Favourites.Control = Control;

export default Favourites;
