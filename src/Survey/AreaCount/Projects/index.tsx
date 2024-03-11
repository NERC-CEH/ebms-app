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
// import fetchProjects from 'common/models/collections/projects/service';
import {
  fetchMock as fetchProjects,
  joinMock,
} from 'common/models/collections/projects/service';
import { RemoteProject } from 'common/models/collections/projects/service';
import Project from 'common/models/project';
import Sample from 'common/models/sample';
import { useUserStatusCheck } from 'common/models/user';
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

  projects.length; // to force refresh when projects list is updated

  const setProject = (value: any) => {
    const byId = (project: Project) => project.id === value;
    const project = projects.find(byId);
    if (!project) {
      sample.attrs.project = undefined;
      appModel.attrs.defaultProject = undefined;
    } else {
      const simplifiedProject = { name: project!.attrs.name, id: project!.id! };
      sample.attrs.project = project ? simplifiedProject : undefined;
      appModel.attrs.defaultProject = simplifiedProject;
    }

    navigation.goBack();
  };

  const joinProject = async (doc: RemoteProject) => {
    console.log('joining', doc);

    try {
      await loader.show('Please wait...');
      await joinMock(doc);

      const allProjectsWithoutTheJoined = allProjects.filter(
        ({ id }: RemoteProject) => id !== doc.id
      );
      setAllProjects(allProjectsWithoutTheJoined);
      toast.success('Successfully joined the project.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();

    const project = new Project(Project.parseRemoteJSON(doc));
    project.save();
    projects.push(project);
  };

  const [allProjects, setAllProjects] = useState<RemoteProject[]>([]);

  const refreshProjects = async (type: 'joined' | 'all') => {
    console.log('Projects refreshing', type);

    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    // TODO:
    // const isUserOK = await checkUserStatus();
    // if (!isUserOK) return;

    try {
      await loader.show('Please wait...');

      if (type === 'all') {
        const docs = await fetchProjects({});
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
    <Page id="precise-area-count-edit-taxa">
      <Header title="Projects" />

      <Main
        sample={sample}
        setProject={setProject}
        onJoinProject={joinProject}
        allProjects={allProjects}
        onRefresh={refreshProjects}
      />
    </Page>
  );
};

export default observer(Projects);
