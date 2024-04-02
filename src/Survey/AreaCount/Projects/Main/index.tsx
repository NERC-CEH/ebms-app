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
import projects from 'common/models/collections/projects';
import { ProjectAttributes } from 'common/models/project';
import Sample from 'models/sample';
import AllProjects from './All';
import UserProjects from './User';

type Props = {
  onRefresh: any;
  setProject: any;
  onJoinProject: any;
  onLeaveProject: any;
  allProjects: ProjectAttributes[];
  sample: Sample;
};

const ProjectsMain = ({
  sample,
  setProject,
  onRefresh,
  allProjects,
  onJoinProject,
  onLeaveProject,
}: Props) => {
  const [segment, setSegment] = useState<'joined' | 'all'>('joined');

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);

    if (newSegment === 'all' && !allProjects.length) onRefresh('all');
    if (newSegment === 'joined' && !projects.length) onRefresh('all');
  };

  const refreshProjects = async (e: any) => {
    e?.detail?.complete(); // refresh pull update
    onRefresh(segment);
  };

  return (
    <Main>
      <IonRefresher slot="fixed" onIonRefresh={refreshProjects}>
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
        <UserProjects
          sample={sample}
          onSelect={setProject}
          onLeave={onLeaveProject}
        />
      )}

      {segment === 'all' && (
        <AllProjects projects={allProjects} onJoin={onJoinProject} />
      )}
    </Main>
  );
};

export default ProjectsMain;
