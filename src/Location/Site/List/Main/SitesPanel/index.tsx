import { useState } from 'react';
import { Trans as T } from 'react-i18next';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonContent,
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from '@ionic/react';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import Location from 'models/location';
import Control from './Control';
import SitesList from './SitesList';

const SNAP_POSITIONS = [0, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;

type Props = {
  isOpen: boolean;
  hasGroup: boolean;
  selectedLocationId?: string | number;
  onSelectSite?: (loc?: Location) => void;
  userLocations: Location[];
  groupLocations: Location[];
};

const Sites = ({
  isOpen,
  hasGroup,
  onSelectSite,
  selectedLocationId,
  userLocations,
  groupLocations,
}: Props) => {
  const [segment, setSegment] = useState<'user' | 'group'>('user');

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  return (
    <IonModal
      isOpen={isOpen}
      backdropDismiss={false}
      backdropBreakpoint={0.5}
      breakpoints={SNAP_POSITIONS}
      initialBreakpoint={DEFAULT_SNAP_POSITION}
      canDismiss
      className="[&::part(handle)]:mt-2"
    >
      {hasGroup && (
        <IonHeader className="ion-no-border">
          <IonToolbar className="pt-5! text-black [--background:var(--ion-page-background)]">
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
      )}

      <IonContent className="[--padding-top:20px]">
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
