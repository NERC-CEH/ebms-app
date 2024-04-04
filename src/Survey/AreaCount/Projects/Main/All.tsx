import { useTranslation } from 'react-i18next';
import { Button } from '@flumens';
import countries from 'common/config/countries';
import appModel from 'models/app';
import { RemoteAttributes } from 'models/project';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

type Props = {
  projects: RemoteAttributes[];
  onJoin: any;
};

const AllProjects = ({ projects, onJoin }: Props) => {
  const { t } = useTranslation();

  const countryCode = appModel.attrs.country!;
  const country = t(countries[countryCode]?.name);

  if (!projects.length)
    return (
      <InfoBackgroundMessage>
        <div className="my-3 opacity-50">{{ country } as any}</div>
        There are currently no new projects available to join.
        <br />
        <br />
        Pull the page down to refresh the list.
      </InfoBackgroundMessage>
    );

  const getProjectButton = (project: RemoteAttributes) => {
    const onJoinWrap = () => onJoin(project);

    return (
      <div
        className="border-1 flex max-w-sm flex-col gap-2 rounded-md bg-white p-3"
        key={project.id}
      >
        <div className="line-clamp-2 font-bold">{project.title}</div>

        {!!project.description && (
          <div className="line-clamp-3 text-balance border-t border-solid border-[var(--background)] pt-2 text-black/70">
            {project.description}
          </div>
        )}

        <div>
          <Button className="mx-auto" onPress={onJoinWrap} color="secondary">
            Join
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="m-3 flex flex-col items-center gap-4">
      {projects.map(getProjectButton)}
    </div>
  );
};

export default AllProjects;
