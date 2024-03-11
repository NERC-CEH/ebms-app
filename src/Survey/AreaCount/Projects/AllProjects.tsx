import { InfoBackgroundMessage } from 'common/flumens';
import { RemoteProject } from 'common/models/collections/projects/service';

type Props = {
  projects: RemoteProject[];
  onJoin: any;
};

const AllProjects = ({ projects, onJoin }: Props) => {
  if (!projects.length)
    return (
      <InfoBackgroundMessage>
        Pull the page down to refresh the list of projects.
      </InfoBackgroundMessage>
    );

  const getProjectButton = (project: RemoteProject) => {
    const onJoinWrap = () => onJoin(project);

    return (
      <div
        className="border-1 m-3 flex items-center justify-between gap-2 rounded-md bg-white p-3"
        key={project.id}
        onClick={onJoinWrap}
      >
        <div className="flex flex-col gap-2">
          <div className="font-bold">{project.title}</div>
          <div className="text-black/70">{project.description}</div>
        </div>

        <button className="rounded-md bg-secondary px-3 py-1 text-white">
          Join
        </button>
      </div>
    );
  };

  return <div className="">{projects.map(getProjectButton)}</div>;
};

export default AllProjects;
