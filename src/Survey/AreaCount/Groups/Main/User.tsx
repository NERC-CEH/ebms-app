import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
} from '@ionic/react';
import { RadioInput } from 'common/flumens';
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
      <IonItemSliding key={group?.id} className="rounded-md overflow-hidden">
        <IonItem className="[--padding-start:0] [--inner-padding-end:0] [--border-style:none]">
          <RadioInput.Option
            value={group.id!}
            label={group.data.title}
            className="w-full "
          />
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
        value={sample.data.group?.id || ''}
        platform="ios"
        skipTranslation
        className="mt-4"
      >
        {groupOptions.map(getOption)}
      </RadioInput>
    </IonList>
  );
};

export default observer(UserGroups);
