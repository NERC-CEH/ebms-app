import {
  createContext,
  forwardRef,
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { observable } from 'mobx';
import { IonModal } from '@ionic/react';
import { ModalNav } from 'common/flumens';
import userModel from 'common/models/user';
import { LocationType, type Data as Record } from 'models/location';
import Details from './Details';
import {
  mothTrapLampsAttr,
  mothTrapOtherTypeAttr,
  mothTrapUserAttr,
} from './config';

const getInitialRecord = (initialRecord?: Partial<Record>) =>
  observable({
    locationTypeId: LocationType.MothTrap,
    centroidSrefSystem: '4326',
    [mothTrapOtherTypeAttr.id]: '',
    [mothTrapUserAttr.id]: userModel.id,
    ...initialRecord,
    [mothTrapLampsAttr.id]: initialRecord?.[mothTrapLampsAttr.id] || [],
  });

export type RecordContext = {
  record: Partial<Record>;
  setRecord: (record: Partial<Record>) => void;
};

const RecordContext = createContext<RecordContext | null>(null);

export function useRecord(): RecordContext {
  const ctx = useContext(RecordContext);
  if (!ctx) throw new Error('useRecord must be used within <RecordContext/>');
  return ctx;
}

type Props = {
  presentingElement: HTMLElement | null;
  initialRecord?: Partial<Record>;
  onSave: (record: Partial<Record>) => Promise<boolean>;
};

const NewSiteModal = (
  { presentingElement, initialRecord, onSave }: Props,
  ref: React.ForwardedRef<HTMLIonModalElement>
) => {
  const modalRef = ref as MutableRefObject<HTMLIonModalElement | null>;

  const onDismiss = async () => {
    await modalRef.current?.dismiss();
    return true;
  };

  const [record, setRecord] = useState<Partial<Record>>(
    getInitialRecord(initialRecord)
  );

  const resetState = () => {
    setRecord(getInitialRecord(initialRecord));
  };

  useEffect(() => {
    resetState();
  }, [initialRecord]);

  const context: RecordContext = useMemo(
    () => ({ record, setRecord }),
    [record, setRecord]
  );

  return (
    <IonModal
      ref={ref}
      backdropDismiss={false}
      presentingElement={presentingElement || undefined}
      onWillDismiss={resetState}
      focusTrap={false}
    >
      <RecordContext.Provider value={context}>
        <ModalNav
          // eslint-disable-next-line react/no-unstable-nested-components
          root={() => <Details onSave={onSave} />}
          onDismiss={onDismiss}
        />
      </RecordContext.Provider>
    </IonModal>
  );
};

export default forwardRef(NewSiteModal);
