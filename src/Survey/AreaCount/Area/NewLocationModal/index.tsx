import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IonModal } from '@ionic/react';
import { ModalNav } from 'common/flumens';
import LocationModel, { LocationType } from 'common/models/location';
import { Group } from 'common/models/sample';
import Details from './Details';
import { responsibleAttr } from './config';

const getNewLocation = (group: Group) => {
  const isVielFalterGarten = group?.title.includes('VielFalterGarten');
  const isUNPplus = group?.title.includes('UNPplus');

  const data: any = {
    lat: '',
    lon: '',
    centroidSref: '',
    centroidSrefSystem: '',
    locationTypeId: LocationType.Site,
    name: '',
  };

  if (isVielFalterGarten || isUNPplus) {
    data[responsibleAttr.id] = '1';
  }

  const location = new LocationModel({ skipStore: true, data });
  location.metadata.groupId = group?.id;

  return location;
};

export type LocationContext = {
  location: LocationModel;
  setLocation: (location: LocationModel) => void;
};

const LocationContext = createContext<LocationContext | null>(null);

export function useLocation(): LocationContext {
  const ctx = useContext(LocationContext);
  if (!ctx)
    throw new Error('useLocation must be used within <LocationContext/>');
  return ctx;
}

type Props = {
  presentingElement: any;
  onSave: (location: LocationModel) => Promise<boolean>;
  group: Group;
};

const NewLocationModal = (
  { presentingElement, onSave, group }: Props,
  ref: any
) => {
  // const canDismiss = useDismissHandler(newLocation || {});
  const onDismiss = async () => ref.current?.dismiss();

  const [location, setLocation] = useState<LocationModel>(
    getNewLocation(group)
  );

  const resetState = () => {
    setLocation(getNewLocation(group));
  };
  useEffect(resetState, []);

  const context: LocationContext = useMemo(
    () => ({ location, setLocation }),
    [location, setLocation]
  );

  return (
    <IonModal
      ref={ref}
      backdropDismiss={false}
      presentingElement={presentingElement}
      // canDismiss={canDismiss}
      onWillDismiss={resetState}
      focusTrap={false}
    >
      <LocationContext.Provider value={context}>
        <ModalNav
          // eslint-disable-next-line react/no-unstable-nested-components
          root={() => <Details onSave={onSave} />}
          onDismiss={onDismiss}
        />
      </LocationContext.Provider>
    </IonModal>
  );
};

export default forwardRef(NewLocationModal);
