import {
  createContext,
  forwardRef,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IonModal } from '@ionic/react';
import { ModalNav } from 'common/flumens';
import groups from 'common/models/collections/groups';
import LocationModel, {
  LocationType,
  type Data as LocationData,
} from 'common/models/location';
import Details from './Details';
import { responsibleAttr } from './config';

const getNewLocation = (groupId?: string) => {
  const group = groups.idMap.get(groupId!);

  const isVielFalterGarten = group?.data.title?.includes('VielFalterGarten');
  const isUNPplus = group?.data.title?.includes('UNPplus');

  const data: Partial<LocationData> = {
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

  const location = new LocationModel({
    skipStore: true,
    data: data as LocationData,
  });
  location.metadata.groupId = groupId;

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
  presentingElement?: HTMLElement;
  onSave: (location: LocationModel) => Promise<boolean>;
  groupId?: string;
};

const NewSiteModal = (
  { presentingElement, onSave, groupId }: Props,
  ref: React.ForwardedRef<HTMLIonModalElement>
) => {
  // const canDismiss = useDismissHandler(newLocation || {});
  const modalRef = ref as MutableRefObject<HTMLIonModalElement | null>;

  const onDismiss = async () => {
    await modalRef.current?.dismiss();
    return true;
  };

  const [location, setLocation] = useState<LocationModel>(
    getNewLocation(groupId)
  );

  const resetState = () => {
    setLocation(getNewLocation(groupId));
  };
  useEffect(resetState, []);

  const context: LocationContext = useMemo(
    () => ({ location, setLocation }),
    [location, setLocation]
  );

  const detailsRoot = useCallback(() => <Details onSave={onSave} />, []);

  // prevent swipe-down gesture from closing the modal
  const canDismiss = async (_: unknown, role?: string) => role !== 'gesture';

  return (
    <IonModal
      ref={ref}
      backdropDismiss={false}
      presentingElement={presentingElement || undefined}
      canDismiss={canDismiss}
      onWillDismiss={resetState}
      focusTrap={false}
    >
      <LocationContext.Provider value={context}>
        <ModalNav
          root={detailsRoot}
          onDismiss={onDismiss}
          swipeGesture={false}
        />
      </LocationContext.Provider>
    </IonModal>
  );
};

export default forwardRef(NewSiteModal);
