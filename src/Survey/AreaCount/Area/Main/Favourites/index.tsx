import { useState } from 'react';
import { Trans as T } from 'react-i18next';
import { isValidLocation, Location, useToast } from '@flumens';
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
import HistoricalLocations from './Historical';
import ProjectLocations from './Project';

const SNAP_POSITIONS = [0, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;

type Props = {
  isOpen: boolean;
  currentLocation?: AreaCountLocation;
  onClose: any;
  mapLocation: [number, number];
  onSelectHistoricalLocation: any;
  projectId?: string | number;
  selectedLocationId?: string | number;
  onCreateProjectLocation: any;
  onSelectProjectLocation: any;
};

const Favourites = ({
  isOpen,
  onClose,
  mapLocation,
  currentLocation,
  onCreateProjectLocation,
  onSelectHistoricalLocation,
  onSelectProjectLocation,
  projectId,
  selectedLocationId,
}: Props) => {
  const toast = useToast();

  const hasProject = !!projectId;
  const [segment, setSegment] = useState<'project' | 'historical'>(
    hasProject ? 'project' : 'historical'
  );
  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  const area = currentLocation?.area || 0;
  const isInvalid = !isValidLocation(currentLocation) || area <= 0;
  const onCreateProjectLocationWrap = () => {
    if (isInvalid) {
      toast.warn('Your survey does not have a valid location to save.');
      return;
    }

    onCreateProjectLocation();
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
        hasProject && !selectedLocationId ? 0.5 : DEFAULT_SNAP_POSITION
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

            {segment === 'project' && (
              <HeaderButton
                onClick={onCreateProjectLocationWrap}
                isInvalid={isInvalid}
                className="hidden text-sm"
              >
                Add
              </HeaderButton>
            )}
          </div>
        </IonToolbar>

        {hasProject && (
          <IonToolbar className=" !p-0 text-black [--background:var(--ion-page-background)]">
            <IonSegment onIonChange={onSegmentClick} value={segment}>
              <IonSegmentButton value="project">
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
        {segment === 'project' && (
          <ProjectLocations
            onSelect={onSelectProjectLocation}
            projectId={projectId!}
            selectedLocationId={selectedLocationId}
          />
        )}
      </IonContent>
    </IonModal>
  );
};

Favourites.Control = Control;

export default Favourites;
