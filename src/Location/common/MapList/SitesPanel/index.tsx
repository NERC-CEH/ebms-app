import { useState } from 'react';
import { Trans as T } from 'react-i18next';
import { device } from '@flumens/utils';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonContent,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  useIonViewWillLeave,
  useIonViewWillEnter,
} from '@ionic/react';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import Location from 'models/location';
import SitesList from './SitesList';

const SNAP_POSITIONS = [0.05, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;
const DEFAULT_SNAP_POSITION_IF_NO_CONNECTION = 1;

type Props = {
  hasGroup: boolean;
  centroid: number[];
  selectedLocationId?: string | number;
  onSelectSite?: (loc?: Location) => void;
  userLocations: Location[];
  groupLocations: Location[];
};

const Sites = ({
  hasGroup,
  centroid,
  onSelectSite,
  selectedLocationId,
  userLocations,
  groupLocations,
}: Props) => {
  const [isMounted, setIsMounted] = useState(true);

  const [segment, setSegment] = useState<'user' | 'group'>('user');

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  const unMountBottomSheet = () => setIsMounted(false); // hack, this component is mounted as a parent with root div
  const mountBottomSheet = () => setIsMounted(true); // hack, this component is mounted as a parent with root div
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
              centroid={centroid}
              locations={userLocations}
              onSelect={onSelectSite}
              selectedLocationId={selectedLocationId}
            />
          )}
          {segment === 'group' && !!groupLocations.length && (
            <SitesList
              centroid={centroid}
              locations={groupLocations}
              onSelect={onSelectSite}
              selectedLocationId={selectedLocationId}
            />
          )}
          {segment === 'group' && !groupLocations.length && (
            <InfoBackgroundMessage>
              This project doesn't have any sites.
            </InfoBackgroundMessage>
          )}
        </IonContent>
      </IonModal>
    </div>
  );
};

export default Sites;
