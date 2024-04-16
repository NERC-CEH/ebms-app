import { observer } from 'mobx-react';
import { IonList } from '@ionic/react';
import locations, { byType } from 'models/collections/locations';
import Location, { PROJECT_SITE_TYPE } from 'models/location';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Entry from './Entry';

type Props = {
  onSelect: () => void;
  projectId: string | number;
  selectedLocationId?: string | number;
};

const ProjectLocations = ({
  onSelect,
  projectId,
  selectedLocationId,
}: Props) => {
  const getEntry = (location: Location) => (
    <Entry
      key={location.cid}
      location={location}
      onSelect={onSelect}
      isSelected={location.id === selectedLocationId}
    />
  );

  const byProject = (location: Location) =>
    location.metadata.projectId === projectId;

  const entries = locations
    .filter(byType(PROJECT_SITE_TYPE))
    .filter(byProject)
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

export default observer(ProjectLocations);
