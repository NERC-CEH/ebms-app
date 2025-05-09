import { useState } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { useTranslation, Trans as T } from 'react-i18next';
import {
  IonList,
  IonRadioGroup,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonRadio,
} from '@ionic/react';
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
  const { t } = useTranslation();

  // force update the radio styles
  const [currentValue, forceRefresh] = useState(sample.data.group?.id);

  const onSelectWrap = (e: any) => {
    onSelect(e.detail.value);
    forceRefresh(e.detail.value);
  };

  const groupOptions: (Group | null)[] = [...groups];
  groupOptions.unshift(null); // add

  const getGroupOption = (group: Group | null) => {
    let value = group?.id;
    let label = group?.data?.title;

    if (!group) {
      value = '';
      label = t('Not linked to any project');
    }

    const onLeaveGroupWrap = () => onLeave(group!);

    const isSelected = currentValue === value;

    const isMembershipPending = group?.data.userIsPending === 't';

    return (
      <IonItemSliding
        key={value}
        className={clsx(
          'my-3 rounded-md border border-solid',
          !value && 'opacity-70',
          isSelected ? 'border-[var(--form-value-color)]' : 'border-neutral-300'
        )}
        disabled={!value}
      >
        <IonItem
          className={clsx(
            '!m-0 !rounded-none !border-none ![--border-radius:0]',
            isSelected &&
              'bg-white text-[var(--form-value-color)] [--background:rgba(var(--color-tertiary-900-rgb),0.02)] [--ion-color-primary:var(--form-value-color)]'
          )}
        >
          <IonRadio
            labelPlacement="start"
            value={value}
            mode="ios"
            disabled={isMembershipPending}
          >
            {label}
          </IonRadio>
        </IonItem>

        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={onLeaveGroupWrap}>
            <T>Leave</T>
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    );
  };

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

  return (
    <IonList lines="full" className="radio-input-attr">
      <IonRadioGroup
        value={sample.data.group?.id}
        allowEmptySelection
        onIonChange={onSelectWrap}
      >
        {groupOptions.map(getGroupOption)}
      </IonRadioGroup>
    </IonList>
  );
};

export default observer(UserGroups);
