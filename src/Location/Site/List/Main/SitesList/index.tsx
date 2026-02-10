import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { IonList } from '@ionic/react';
import Location from 'models/location';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Site from './Site';

type Props = {
  locations: Location[];
  onSelect?: (location?: Location) => void;
  selectedLocationId?: string | number;
};

const SitesList = ({ locations, onSelect, selectedLocationId }: Props) => {
  const { t } = useTranslation();

  const getEntry = (location: Location) => (
    <Site
      key={location.cid}
      latitude={location.data.location.latitude}
      longitude={location.data.location.longitude}
      name={location.data.location.name}
      onClick={() => onSelect?.(location)}
      isSelected={location.id === selectedLocationId}
    />
  );

  const entries = locations.map(getEntry);

  const emptyOption = !!onSelect && (
    <Site
      name={t('No site')}
      onClick={() => onSelect?.()}
      isSelected={!selectedLocationId}
      className="h-12 opacity-60"
    />
  );

  return (
    <IonList className="mt-2 flex flex-col gap-2">
      {entries.length ? (
        <>
          {emptyOption}
          {entries}
        </>
      ) : (
        <InfoBackgroundMessage>You have no saved sites.</InfoBackgroundMessage>
      )}
    </IonList>
  );
};

export default observer(SitesList);
