import { useState } from 'react';
import { Trans as T } from 'react-i18next';
import { device, useToast } from '@flumens';
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
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import userModel from 'common/models/user';
import locations, { byType } from 'models/collections/locations';
import Location, { LocationType } from 'models/location';
import HeaderButton from 'Survey/common/HeaderButton';
import Control from './Control';
import SitesList from './SitesList';

const SNAP_POSITIONS = [0, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;

type Props = {
  isOpen: boolean;
  onClose: any;
  groupId?: string | number;
  selectedLocationId?: string | number;
  onCreateGroupLocation: any;
  onSelectGroupLocation: any;
};

const Sites = ({
  isOpen,
  onClose,
  onCreateGroupLocation,
  onSelectGroupLocation,
  groupId,
  selectedLocationId,
}: Props) => {
  const toast = useToast();

  const hasGroup = !!groupId;
  const [segment, setSegment] = useState<'my' | 'group'>(
    hasGroup ? 'group' : 'my'
  );
  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  const onCreateGroupLocationWrap = () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    onCreateGroupLocation();
  };

  useIonViewWillLeave(onClose);

  const alphabeticallyByName = (a: Location, b: Location) =>
    a.data.location.name.localeCompare(b.data.location.name);

  const byGroup = (location: Location) => location.metadata.groupId === groupId;
  const groupLocations = locations
    .filter(byType(LocationType.Site))
    .filter(byGroup)
    .sort(alphabeticallyByName);

  const byCreatedByMe = (location: Location) =>
    location.data.createdById === `${userModel.data.indiciaUserId}`;
  const myLocations = locations
    .filter(byType(LocationType.Site))
    .filter(byCreatedByMe)
    .sort(alphabeticallyByName);

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
              <T>Sites</T>
            </div>

            <HeaderButton
              onClick={onCreateGroupLocationWrap}
              isInvalid={!device.isOnline}
              className="text-sm"
            >
              Add
            </HeaderButton>
          </div>
        </IonToolbar>

        <IonToolbar className="!p-0 text-black [--background:var(--ion-page-background)]">
          <IonSegment onIonChange={onSegmentClick} value={segment}>
            <IonSegmentButton value="my">
              <IonLabel className="ion-text-wrap">
                <T>My sites</T>
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="group">
              <IonLabel className="ion-text-wrap">
                <T>Project</T>
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {segment === 'my' && (
          <SitesList
            locations={myLocations}
            onSelect={onSelectGroupLocation}
            selectedLocationId={selectedLocationId}
          />
        )}
        {segment === 'group' && hasGroup && (
          <SitesList
            locations={groupLocations}
            onSelect={onSelectGroupLocation}
            selectedLocationId={selectedLocationId}
          />
        )}
        {segment === 'group' && !hasGroup && (
          <InfoBackgroundMessage>
            Please select a project to view its sites.
          </InfoBackgroundMessage>
        )}
      </IonContent>
    </IonModal>
  );
};

Sites.Control = Control;

export default Sites;
