import Group from 'common/models/group';

type Props = {
  group?: Group;
  onClick?: any;
};

const GroupHeader = ({ group, onClick }: Props) => {
  const groupName = group?.data?.title;
  if (!groupName) return null;

  return (
    <div
      className="line-clamp-1 bg-tertiary-600 p-1 text-center text-sm text-white"
      onClick={onClick}
    >
      {groupName}
    </div>
  );
};

export default GroupHeader;
