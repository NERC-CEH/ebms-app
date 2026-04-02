import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
} from '@ionic/react';
import { Badge, RadioInput } from 'common/flumens';
import Group from 'common/models/group';
import Sample from 'models/sample';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

type Props = {
  sample: Sample;
  onSelect: (groupId: string) => void;
  onLeave: (group: Group) => void;
  groups: Group[];
};

const UserGroups = ({ sample, onSelect, onLeave, groups }: Props) => {
  const groupOptions: (Group | null)[] = [...groups];
  groupOptions.unshift(null); // add empty option for "no group"

  if (!groups.length)
    return (
      <InfoBackgroundMessage>
        You haven't joined any projects yet. Go to the "All projects" tab to
        join a project.
        <br />
        <br />
        Pull the page down to refresh the list.
      </InfoBackgroundMessage>
    );

  const getOption = (group: Group | null) => {
    if (!group)
      return <RadioInput.Option value="" label="Not linked to any project" />;

    return (
      <IonItemSliding key={group?.id} className="rounded-md mt-1">
        <IonItem className="[--padding-start:0] [--inner-padding-end:0] [--border-style:none]">
          <div className="flex flex-col w-full rounded-md border-neutral-200 border">
            <RadioInput.Option
              value={group.id!}
              label={group.data.title}
              className="w-full "
            />
            <div className="flex items-center gap-2 m-1 empty:hidden">
              {!!group.taxonListCids.length && (
                <Badge size="small">Has species lists</Badge>
              )}
              {!!group.locationCids.length && (
                <Badge size="small">Has sites</Badge>
              )}
            </div>
          </div>
        </IonItem>

        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={() => onLeave(group)}>
            <T>Leave</T>
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    );
  };

  return (
    <IonList>
      <RadioInput
        onChange={onSelect}
        value={sample.data.groupId || ''}
        platform="ios"
        className="mt-4"
      >
        {groupOptions.map(getOption)}
      </RadioInput>
    </IonList>
  );
};

export default observer(UserGroups);
