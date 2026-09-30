import { observer } from 'mobx-react';
import groups from 'common/models/collections/groups';

type Props = {
  groupId?: string;
  isDisabled: boolean;
  onClick?: () => void;
};

const GroupHeader = ({ groupId, isDisabled, onClick }: Props) => {
  const groupName = groups.idMap.get(groupId || '')?.data.title;
  if (!groupName) return null;

  return (
    <div
      className="line-clamp-1 bg-tertiary-600 p-1 text-center text-sm text-white"
      onClick={isDisabled ? undefined : onClick}
      aria-disabled={isDisabled}
    >
      {groupName}
    </div>
  );
};

export default observer(GroupHeader);
