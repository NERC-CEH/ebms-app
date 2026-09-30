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
import userModel from 'common/models/user';
import LocationModel, {
  LocationType,
  type Data as Record,
} from 'models/location';
import Details from './Details';
import {
  mothTrapLampsAttr,
  mothTrapOtherTypeAttr,
  mothTrapUserAttr,
} from './config';

const getNewLocation = (initialRecord?: Partial<Record>, groupId?: string) =>
  new LocationModel({
    skipStore: true,
    metadata: { groupId },
    data: {
      locationTypeId: LocationType.MothTrap,
      centroidSrefSystem: '4326',
      [mothTrapOtherTypeAttr.id]: '',
      [mothTrapUserAttr.id]: userModel.id,
      ...initialRecord,
      [mothTrapLampsAttr.id]: initialRecord?.[mothTrapLampsAttr.id] || [],
    } as Record,
  });

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
  presentingElement: HTMLElement | null;
  initialRecord?: Partial<Record>;
  onSave: (location: LocationModel) => Promise<boolean>;
  groupId?: string;
  isTemporary?: boolean;
};

const NewSiteModal = (
  { presentingElement, initialRecord, onSave, groupId, isTemporary }: Props,
  ref: React.ForwardedRef<HTMLIonModalElement>
) => {
  const modalRef = ref as MutableRefObject<HTMLIonModalElement | null>;

  const onDismiss = async () => {
    await modalRef.current?.dismiss();
    return true;
  };

  const [location, setLocation] = useState<LocationModel>(
    getNewLocation(initialRecord, groupId)
  );

  const resetState = () => setLocation(getNewLocation(initialRecord, groupId));

  useEffect(resetState, [initialRecord, groupId]);

  const context: LocationContext = useMemo(
    () => ({ location, setLocation }),
    [location, setLocation]
  );

  const detailsRoot = useCallback(
    () => <Details onSave={onSave} isTemporary={isTemporary} />,
    []
  );

  // prevent swipe-down gesture from closing the modal
  const canDismiss = async (_: unknown, role?: string) => role !== 'gesture';

  return (
    <IonModal
      ref={ref}
      backdropDismiss={false}
      canDismiss={canDismiss}
      presentingElement={presentingElement || undefined}
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
