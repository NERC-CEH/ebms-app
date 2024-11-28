import { useState } from 'react';
import { Trans as T } from 'react-i18next';
import { device, isValidLocation, Location, useToast } from '@flumens';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonContent,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  useIonViewWillLeave,
} from '@ionic/react';
import { AreaCountLocation } from 'common/models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import Control from './Control';
import GroupLocations from './Group';
import HistoricalLocations from './Historical';

const SNAP_POSITIONS = [0, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;

type Props = {
  isOpen: boolean;
  isGPSTracking: boolean;
  currentLocation?: AreaCountLocation;
  onClose: any;
  mapLocation: [number, number];
  onSelectHistoricalLocation: any;
  groupId?: string | number;
  selectedLocationId?: string | number;
  onCreateGroupLocation: any;
  onSelectGroupLocation: any;
};

const Favourites = ({
  isOpen,
  onClose,
  mapLocation,
  currentLocation,
  onCreateGroupLocation,
  onSelectHistoricalLocation,
  onSelectGroupLocation,
  groupId,
  selectedLocationId,
  isGPSTracking,
}: Props) => {
  const toast = useToast();

  const hasGroup = !!groupId;
  const [segment, setSegment] = useState<'group' | 'historical'>(
    hasGroup ? 'group' : 'historical'
  );
  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  const area = currentLocation?.area || 0;
  const isInvalid =
    !isValidLocation(currentLocation) ||
    area <= 0 ||
    !device.isOnline ||
    isGPSTracking;
  const onCreateGroupLocationWrap = () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    if (isGPSTracking) {
      toast.warn('The survey area is still being tracked.');
      return;
    }

    if (isInvalid) {
      toast.warn('Your survey does not have a valid location to save.');
      return;
    }

    onCreateGroupLocation();
  };

  const onSelectPastLocationWrap = (location: Location) => {
    onClose();
    onSelectHistoricalLocation(location);
  };

  useIonViewWillLeave(onClose);

  return (
    <IonModal
      isOpen={isOpen}
      backdropDismiss={false}
      backdropBreakpoint={0.5}
      breakpoints={SNAP_POSITIONS}
      initialBreakpoint={
        hasGroup && !selectedLocationId ? 0.5 : DEFAULT_SNAP_POSITION
      }
      canDismiss
      onIonModalWillDismiss={onClose}
      className="[&::part(handle)]:mt-2"
    >
      <IonHeader class="ion-no-border">
        <IonToolbar className="ion-no-padding !p-0 [--background:var(--ion-page-background)] [--min-height:20px]">
          <div className="flex h-8 justify-between gap-4 px-2 py-1">
            <div className="flex items-center px-2 font-semibold text-black">
              <T>Locations</T>
            </div>

            {segment === 'group' && (
              <HeaderButton
                onClick={onCreateGroupLocationWrap}
                isInvalid={isInvalid}
                className="text-sm"
              >
                Add
              </HeaderButton>
            )}
          </div>
        </IonToolbar>

        {hasGroup && (
          <IonToolbar className="!p-0 text-black [--background:var(--ion-page-background)]">
            <IonSegment onIonChange={onSegmentClick} value={segment}>
              <IonSegmentButton value="group">
                <IonLabel className="ion-text-wrap">
                  <T>Project</T>
                </IonLabel>
              </IonSegmentButton>

              <IonSegmentButton value="historical">
                <IonLabel className="ion-text-wrap">
                  <T>Previous</T>
                </IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent>
        {segment === 'historical' && (
          <HistoricalLocations
            onSelect={onSelectPastLocationWrap}
            position={mapLocation}
          />
        )}
        {segment === 'group' && (
          <GroupLocations
            onSelect={onSelectGroupLocation}
            groupId={groupId!}
            selectedLocationId={selectedLocationId}
          />
        )}
      </IonContent>
    </IonModal>
  );
};

Favourites.Control = Control;

export default Favourites;
