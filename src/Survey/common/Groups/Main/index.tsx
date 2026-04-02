import { useState } from 'react';
import { observer } from 'mobx-react';
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
import Group from 'common/models/group';
import Sample from 'models/sample';
import AllGroups from './All';
import UserGroups from './User';

type Props = {
  onRefresh: (type: 'member' | 'joinable') => void;
  setGroup: (groupId: string) => void;
  onJoinGroup: (group: Group) => void;
  onLeaveGroup: (group: Group) => void;
  memberGroups: Group[];
  joinableGroups: Group[];
  sample: Sample;
};

const GroupsMain = ({
  sample,
  setGroup,
  onRefresh,
  joinableGroups,
  memberGroups,
  onJoinGroup,
  onLeaveGroup,
}: Props) => {
  const [segment, setSegment] = useState<'joined' | 'all'>('joined');

  const onJoinGroupWrap = async (group: Group) => {
    await onJoinGroup(group);
    setSegment('joined');
  };

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);

    if (newSegment === 'all' && !joinableGroups.length) onRefresh('joinable');
    if (newSegment === 'joined' && !memberGroups.length) onRefresh('member');
  };

  const refreshGroups = async (e: any) => {
    e?.detail?.complete(); // refresh pull update
    onRefresh(segment === 'joined' ? 'member' : 'joinable');
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
          groups={memberGroups}
        />
      )}

      {segment === 'all' && (
        <AllGroups groups={joinableGroups} onJoin={onJoinGroupWrap} />
      )}
    </Main>
  );
};

export default observer(GroupsMain);
