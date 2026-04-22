import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { IonList } from '@ionic/react';
import turf from '@turf/distance';
import Location from 'models/location';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Site from './Site';

type Props = {
  centroid: number[];
  locations: Location[];
  onSelect?: (location?: Location) => void;
  selectedLocationId?: string | number;
};

type LocationWithDistance = [Location, number];

const SitesList = ({
  centroid,
  locations,
  onSelect,
  selectedLocationId,
}: Props) => {
  const { t } = useTranslation();

  const getLocationCoords = ({ data: { location } }: Location) => {
    if (!Number.isFinite(location?.latitude)) return null;

    return [location?.latitude, location?.longitude];
  };

  const getLocationWithDistance = (loc: Location): LocationWithDistance => {
    const coords = getLocationCoords(loc);
    if (!coords) return [loc, 0];

    const distance = turf(coords, centroid, { units: 'kilometers' });

    return [loc, parseFloat(distance.toFixed(2))];
  };

  const byDistance = (
    [, distanceA]: LocationWithDistance,
    [, distanceB]: LocationWithDistance
  ) => distanceA - distanceB;

  const getEntry = ([location, distance]: LocationWithDistance) => (
    <Site
      key={location.cid}
      latitude={location.data.location.latitude}
      longitude={location.data.location.longitude}
      name={location.data.name}
      distance={distance}
      hasLists={!!location.taxonListCids?.length}
      onClick={() => onSelect?.(location)}
      isSelected={location.id === selectedLocationId}
    />
  );

  const entries = [...locations]
    .map(getLocationWithDistance)
    .sort(byDistance)
    .map(getEntry);

  const emptyOption = !!onSelect && (
    <Site
      name={t('No site')}
      onClick={() => onSelect?.()}
      isSelected={!selectedLocationId}
      className="h-12 opacity-60"
    />
  );

  return (
    <IonList className="mt-2! flex flex-col gap-2">
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
