import { useTranslation } from 'react-i18next';
import { Button } from '@flumens';
import countries from 'common/config/countries';
import appModel from 'models/app';
import Group from 'models/group';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

type Props = {
  groups: Group[];
  onJoin: (group: Group) => void;
};

const AllGroups = ({ groups, onJoin }: Props) => {
  const { t } = useTranslation();

  const countryCode = appModel.data.country!;
  const country = t(countries[countryCode]?.name);

  if (!groups.length)
    return (
      <InfoBackgroundMessage>
        <div className="my-3 opacity-50">{{ country } as any}</div>
        There are currently no new projects available to join.
        <br />
        <br />
        Pull the page down to refresh the list.
      </InfoBackgroundMessage>
    );

  const getGroupButton = (group: Group) => {
    const onJoinWrap = () => onJoin(group);

    return (
      <div
        className="flex w-full max-w-sm flex-col gap-2 rounded-md border border-solid border-neutral-300 bg-white p-3"
        key={group.id}
      >
        <div className="flex items-center gap-2 justify-between">
          <div className="line-clamp-2 font-bold">{group.data.title}</div>

          <Button
            className="py-1 px-4 text-sm shrink-0"
            onPress={onJoinWrap}
            color="secondary"
            fill="outline"
          >
            Join
          </Button>
        </div>

        {!!group.data.description && (
          <div className="line-clamp-3 text-balance border-t border-solid border-[var(--background)] pt-2 text-black/70">
            {group.data.description}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="m-3 flex flex-col items-center gap-4">
      {groups.map(getGroupButton)}
    </div>
  );
};

export default AllGroups;
