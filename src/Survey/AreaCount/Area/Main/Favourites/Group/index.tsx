import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { IonList } from '@ionic/react';
import locations, { byType } from 'models/collections/locations';
import Location, { GROUP_SITE_TYPE } from 'models/location';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Entry from './Entry';

type Props = {
  onSelect: any;
  groupId: string | number;
  selectedLocationId?: string | number;
};

const GroupLocations = ({ onSelect, groupId, selectedLocationId }: Props) => {
  const { t } = useTranslation();

  const getEntry = (location: Location) => (
    <Entry
      key={location.cid}
      latitude={location.attrs.location.latitude}
      longitude={location.attrs.location.longitude}
      name={location.attrs.location.name}
      onClick={() => onSelect(location)}
      isSelected={location.id === selectedLocationId}
    />
  );

  const byGroup = (location: Location) => location.metadata.groupId === groupId;

  const entries = locations
    .filter(byType(GROUP_SITE_TYPE))
    .filter(byGroup)
    .map(getEntry);

  const noLocationEntry = (
    <Entry
      name={t('No location')}
      onClick={() => onSelect()}
      isSelected={!selectedLocationId}
      className="h-12 opacity-60"
    />
  );

  return (
    <IonList className="mt-2 flex flex-col gap-2">
      {entries.length ? (
        <>
          {noLocationEntry}
          {entries}
        </>
      ) : (
        <InfoBackgroundMessage>
          You have no previous tracks.
        </InfoBackgroundMessage>
      )}
    </IonList>
  );
};

export default observer(GroupLocations);