import { useState } from 'react';
import { Trans as T } from 'react-i18next';
import {
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
} from '@ionic/react';
import { InfoBackgroundMessage, Main } from 'common/flumens';
import Location from 'models/location';
import SitesList from './SitesList';

type Props = {
  hasGroup: boolean;
  myLocations: Location[];
  groupLocations: Location[];
  onSelectSite: (location?: Location) => void;
  selectedLocationId?: string;
  onRefresh: () => void;
};

const MainSites = ({
  hasGroup,
  myLocations,
  groupLocations,
  onSelectSite,
  selectedLocationId,
  onRefresh,
}: Props) => {
  const [segment, setSegment] = useState<'my' | 'group'>(
    hasGroup ? 'group' : 'my'
  );
  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  const refreshGroups = async (e: any) => {
    e?.detail?.complete(); // refresh pull update
    onRefresh();
  };

  return (
    <Main>
      <IonRefresher slot="fixed" onIonRefresh={refreshGroups}>
        <IonRefresherContent />
      </IonRefresher>

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

      {segment === 'my' && (
        <SitesList
          locations={myLocations}
          onSelect={onSelectSite}
          selectedLocationId={selectedLocationId}
        />
      )}
      {segment === 'group' && hasGroup && (
        <SitesList
          locations={groupLocations}
          onSelect={onSelectSite}
          selectedLocationId={selectedLocationId}
        />
      )}
      {segment === 'group' && !hasGroup && (
        <InfoBackgroundMessage>
          Please select a project to view its sites.
        </InfoBackgroundMessage>
      )}
    </Main>
  );
};

export default MainSites;
