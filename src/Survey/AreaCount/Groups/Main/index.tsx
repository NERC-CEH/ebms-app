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
import { Main } from 'common/flumens';
import groups from 'common/models/collections/groups';
import { RemoteAttributes } from 'common/models/group';
import Sample from 'models/sample';
import AllGroups from './All';
import UserGroups from './User';

type Props = {
  onRefresh: any;
  setGroup: any;
  onJoinGroup: any;
  onLeaveGroup: any;
  allGroups: RemoteAttributes[];
  sample: Sample;
};

const GroupsMain = ({
  sample,
  setGroup,
  onRefresh,
  allGroups,
  onJoinGroup,
  onLeaveGroup,
}: Props) => {
  const [segment, setSegment] = useState<'joined' | 'all'>('joined');

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);

    if (newSegment === 'all' && !allGroups.length) onRefresh('all');
    if (newSegment === 'joined' && !groups.length) onRefresh('all');
  };

  const refreshGroups = async (e: any) => {
    e?.detail?.complete(); // refresh pull update
    onRefresh(segment);
  };

  return (
    <Main>
      <IonRefresher slot="fixed" onIonRefresh={refreshGroups}>
        <IonRefresherContent />
      </IonRefresher>

      <IonToolbar className="text-black [--background:transparent]">
        <IonSegment onIonChange={onSegmentClick} value={segment}>
          <IonSegmentButton value="joined">
            <IonLabel className="ion-text-wrap">
              <T>My projects</T>
            </IonLabel>
          </IonSegmentButton>

          <IonSegmentButton value="all">
            <IonLabel className="ion-text-wrap">
              <T>All projects</T>
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </IonToolbar>

      {segment === 'joined' && (
        <UserGroups
          sample={sample}
          onSelect={setGroup}
          onLeave={onLeaveGroup}
        />
      )}

      {segment === 'all' && (
        <AllGroups groups={allGroups} onJoin={onJoinGroup} />
      )}
    </Main>
  );
};

export default GroupsMain;
