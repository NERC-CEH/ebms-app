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
import {
  RadioInput,
  Main,
  RadioOption,
  InfoBackgroundMessage,
} from 'common/flumens';
import projects from 'common/models/collections/projects';
import { RemoteProject } from 'common/models/collections/projects/service';
import Project from 'common/models/project';
import Sample from 'models/sample';
import AllProjects from './AllProjects';

type Props = {
  onRefresh: any;
  setProject: any;
  onJoinProject: any;
  allProjects: RemoteProject[];
  sample: Sample;
};

const ProjectsMain = ({
  sample,
  setProject,
  onRefresh,
  allProjects,
  onJoinProject,
}: Props) => {
  const [segment, setSegment] = useState<'joined' | 'all'>('joined');

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);

    if (!allProjects.length) onRefresh('all');
  };

  const refreshProjects = async (e: any) => {
    e?.detail?.complete(); // refresh pull update
    onRefresh(segment);
  };

  const getOption = (project: Project) => ({
    value: project.id!,
    label: project.attrs.name!,
  });

  const projectOptions: RadioOption[] = projects.map(getOption);

  projectOptions.unshift({
    value: '',
    label: 'Not linked to any project',
    isDefault: true,
  });

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
        <>
          {!!projects.length ? (
            <RadioInput
              options={projectOptions}
              onChange={setProject}
              value={sample.attrs.project?.id}
            />
          ) : (
            <InfoBackgroundMessage>
              Pull the page down to refresh the list of projects.
            </InfoBackgroundMessage>
          )}
        </>
      )}

      {segment === 'all' && (
        <AllProjects projects={allProjects} onJoin={onJoinProject} />
      )}
    </Main>
  );
};

export default ProjectsMain;
