import Project from 'common/models/project';

type Props = {
  project: Project;
  onClick: any;
};

const ProjectButton = ({ project, onClick }: Props) => {
  const { name } = project.attrs;

  const onClickWrap = () => onClick(project);

  return (
    <div
      className="m-3 rounded-md border bg-white p-5 shadow-sm"
      onClick={onClickWrap}
    >
      <div className="">{name}</div>
    </div>
  );
};

export default ProjectButton;
