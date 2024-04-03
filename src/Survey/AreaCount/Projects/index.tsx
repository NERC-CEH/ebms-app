import { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { NavContext } from '@ionic/react';
import {
  // device,
  Header,
  Page,
  useLoader,
  useToast,
} from 'common/flumens';
import appModel from 'common/models/app';
import projects from 'common/models/collections/projects';
import {
  fetch as fetchAllProjects,
  join,
  leave,
} from 'models/collections/projects/service';
import Project, { RemoteAttributes } from 'models/project';
import Sample from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import Main from './Main';

const device = { isOnline: true }; // TODO:

type Props = {
  sample: Sample;
};

const Projects = ({ sample }: Props) => {
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();
  const navigation = useContext(NavContext);

  // eslint-disable-next-line
  projects.length; // to force refresh when projects list is updated

  const setProject = (value: any) => {
    const byId = (project: Project) => project.id === value;
    const project = projects.find(byId);
    if (!project) {
      // eslint-disable-next-line
      sample.attrs.project = undefined;
      // eslint-disable-next-line
      appModel.attrs.defaultProject = undefined;
    } else {
      const simplifiedProject = { name: project.attrs.title, id: project.id! };
      // eslint-disable-next-line
      sample.attrs.project = project ? simplifiedProject : undefined;
      appModel.attrs.defaultProject = simplifiedProject;
    }

    navigation.goBack();
  };

  const [allProjects, setAllProjects] = useState<RemoteAttributes[]>([]);

  const joinProject = async (doc: RemoteAttributes) => {
    console.log('Projects joining', doc.id);

    try {
      await loader.show('Please wait...');
      await join(doc);

      const allProjectsWithoutTheJoined = allProjects.filter(
        ({ id }: RemoteAttributes) => id !== doc.id
      );
      setAllProjects(allProjectsWithoutTheJoined);
      toast.success('Successfully joined the project.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();

    await projects.fetch();
  };

  const leaveProject = async (projectId: string) => {
    console.log('Projects leaving', projectId);

    try {
      await loader.show('Please wait...');
      await leave(projectId);
      await projects.fetch();

      if (sample.attrs.project?.id === projectId) {
        // eslint-disable-next-line
        sample.attrs.project = undefined;
      }

      if (appModel.attrs.defaultProject?.id === projectId) {
        appModel.attrs.defaultProject = undefined;
      }

      toast.success('Successfully left the project.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const refreshProjects = async (type: 'joined' | 'all') => {
    console.log('Projects refreshing', type);

    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    try {
      await loader.show('Please wait...');

      if (type === 'all') {
        const docs = await fetchAllProjects({});
        setAllProjects(docs);
      } else {
        await projects.fetch();
      }
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  return (
    <Page id="precise-area-count-edit-project">
      <Header title="Projects" />

      <Main
        sample={sample}
        setProject={setProject}
        onJoinProject={joinProject}
        onLeaveProject={leaveProject}
        allProjects={allProjects}
        onRefresh={refreshProjects}
      />
    </Page>
  );
};

export default observer(Projects);
