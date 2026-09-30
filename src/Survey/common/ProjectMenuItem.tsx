import { observer } from 'mobx-react';
import { peopleOutline } from 'ionicons/icons';
import { useRouteMatch } from 'react-router';
import { MenuAttrItem } from '@flumens';
import groups from 'models/collections/groups';

type Props = {
  isDisabled: boolean;
  groupId?: string;
};

const ProjectMenuItem = ({ isDisabled, groupId }: Props) => {
  const { url } = useRouteMatch();
  const group = groups.idMap.get(groupId || '');

  return (
    <MenuAttrItem
      routerLink={`${url}/group`}
      disabled={isDisabled}
      icon={peopleOutline}
      label="common.project"
      value={group?.data.title}
      skipValueTranslation
    />
  );
};

export default observer(ProjectMenuItem);
