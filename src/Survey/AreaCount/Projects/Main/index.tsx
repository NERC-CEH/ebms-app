import { useState } from 'react';
import clsx from 'clsx';
import { Trans as T, useTranslation } from 'react-i18next';
import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
} from '@ionic/react';
import { Main, RadioOption } from 'common/flumens';
import projects from 'common/models/collections/projects';
import { RemoteProject } from 'common/models/collections/projects/service';
import Project from 'common/models/project';
import Sample from 'models/sample';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import AllProjects from './AllProjects';

type Props = {
  onRefresh: any;
  setProject: any;
  onJoinProject: any;
  onLeaveProject: any;
  allProjects: RemoteProject[];
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
  const { t } = useTranslation();

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

  const getOption = (project: Project) => ({
    value: project.id!,
    label: project.attrs.name!,
  });

  const projectOptions: RadioOption[] = projects.map(getOption);

  projectOptions.unshift({
    value: '',
    label: t('Not linked to any project'),
    isDefault: true,
  });

  const getProjectOption = (p: any) => {
    const onLeaveProjectWrap = () => onLeaveProject(p?.value);

    return (
      <IonItemSliding
        key={p.value}
        className={clsx(
          'my-3 rounded-[var(--theme-border-radius)]',
          p.isDefault && 'opacity-70'
        )}
        disabled={p.isDefault}
      >
        <IonItem className="!m-0 !rounded-none ![--border-radius:0]">
          <IonRadio labelPlacement="start" value={p.value}>
            {p.label}
          </IonRadio>
        </IonItem>

        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={onLeaveProjectWrap}>
            <T>Leave</T>
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    );
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
        <>
          {projects.length ? (
            <IonList lines="full" className="radio-input-attr">
              <IonRadioGroup
                value={sample.attrs.project?.id}
                onIonChange={(e: any) => setProject(e.detail.value)}
              >
                {projectOptions.map(getProjectOption)}
              </IonRadioGroup>
            </IonList>
          ) : (
            <InfoBackgroundMessage>
              You haven't joined any projects yet. Go to the "All projects" tab
              to join a project.
              <br />
              <br />
              Pull the page down to refresh the list.
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
