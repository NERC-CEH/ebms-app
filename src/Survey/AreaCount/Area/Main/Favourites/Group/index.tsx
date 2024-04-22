import { observer } from 'mobx-react';
import { IonList } from '@ionic/react';
import locations, { byType } from 'models/collections/locations';
import Location, { GROUP_SITE_TYPE } from 'models/location';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Entry from './Entry';

type Props = {
  onSelect: () => void;
  groupId: string | number;
  selectedLocationId?: string | number;
};

const GroupLocations = ({ onSelect, groupId, selectedLocationId }: Props) => {
  const getEntry = (location: Location) => (
    <Entry
      key={location.cid}
      location={location}
      onSelect={onSelect}
      isSelected={location.id === selectedLocationId}
    />
  );

  const byGroup = (location: Location) => location.metadata.groupId === groupId;

  const entries = locations
    .filter(byType(GROUP_SITE_TYPE))
    .filter(byGroup)
    .map(getEntry);

  return (
    <IonList className="mt-2 flex flex-col gap-2">
      {entries.length ? (
        entries
      ) : (
        <InfoBackgroundMessage>
          You have no previous tracks.
        </InfoBackgroundMessage>
      )}
    </IonList>
  );
};

export default observer(GroupLocations);
