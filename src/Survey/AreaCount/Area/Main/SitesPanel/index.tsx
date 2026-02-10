import { useState } from 'react';
import SitesList from 'Location/Site/List/Main/SitesList';
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
import Location from 'models/location';
import HeaderButton from 'Survey/common/HeaderButton';
import Control from './Control';

const SNAP_POSITIONS = [0, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;

type Props = {
  isOpen: boolean;
  onClose: any;
  selectedLocationId?: string | number;
  onCreateSite: any;
  onSelectSite: (loc?: Location) => void;
  userLocations: Location[];
  groupLocations: Location[];
};

const Sites = ({
  isOpen,
  onClose,
  onCreateSite,
  onSelectSite,
  selectedLocationId,
  userLocations,
  groupLocations,
}: Props) => {
  const toast = useToast();

  const [segment, setSegment] = useState<'user' | 'group'>('user');

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  const onCreateSiteWrap = () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    onCreateSite();
  };

  useIonViewWillLeave(onClose);

  return (
    <IonModal
      isOpen={isOpen}
      backdropDismiss={false}
      backdropBreakpoint={0.5}
      breakpoints={SNAP_POSITIONS}
      initialBreakpoint={DEFAULT_SNAP_POSITION}
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
              onClick={onCreateSiteWrap}
              isInvalid={!device.isOnline}
              className="text-sm"
            >
              Add
            </HeaderButton>
          </div>
        </IonToolbar>

        <IonToolbar className="!p-0 text-black [--background:var(--ion-page-background)]">
          <IonSegment onIonChange={onSegmentClick} value={segment}>
            <IonSegmentButton value="user">
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
        {segment === 'user' && (
          <SitesList
            locations={userLocations}
            onSelect={onSelectSite}
            selectedLocationId={selectedLocationId}
          />
        )}
        {segment === 'group' && !!groupLocations.length && (
          <SitesList
            locations={groupLocations}
            onSelect={onSelectSite}
            selectedLocationId={selectedLocationId}
          />
        )}
        {segment === 'group' && !groupLocations.length && (
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
