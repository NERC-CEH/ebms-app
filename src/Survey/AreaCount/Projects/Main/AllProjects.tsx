import { Trans as T } from 'react-i18next';
import { InfoBackgroundMessage } from 'common/flumens';
import { RemoteProject } from 'common/models/collections/projects/service';

type Props = {
  projects: RemoteProject[];
  onJoin: any;
};

const AllProjects = ({ projects, onJoin }: Props) => {
  if (!projects.length)
    return (
      <>
        <InfoBackgroundMessage>
          There are currently no new projects available to join.
          <br />
          <br />
          Pull the page down to refresh the list.
        </InfoBackgroundMessage>
      </>
    );

  const getProjectButton = (project: RemoteProject) => {
    const onJoinWrap = () => onJoin(project);

    return (
      <div
        className="border-1 m-3 flex flex-col gap-2 rounded-md bg-white p-3"
        key={project.id}
        onClick={onJoinWrap}
      >
        <div className="line-clamp-2 font-bold">{project.title}</div>

        {!!project.description && (
          <div className="line-clamp-3 border-t border-solid border-[var(--background)] pt-2 text-black/70">
            {project.description}
          </div>
        )}

        <button className="mx-auto w-3/4 rounded-md bg-secondary px-3 py-1 text-white">
          <T>Join</T>
        </button>
      </div>
    );
  };

  return <div className="">{projects.map(getProjectButton)}</div>;
};

export default AllProjects;
