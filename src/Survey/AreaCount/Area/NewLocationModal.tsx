import { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { resizeOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { z, object } from 'zod';
import { Main } from '@flumens';
import TextInput from '@flumens/tailwind/dist/components/Input';
import { isPlatform } from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonActionSheet,
} from '@ionic/react';
import { Project } from 'common/models/sample';
import HeaderButton from 'Survey/common/HeaderButton';

const schema = object({
  name: z.string().min(1, 'Please fill in'),
  comment: z.string().optional(),
});

type FixedLocation = z.infer<typeof schema>;

const useDismissHandler = (newLocation: any) => {
  const [present] = useIonActionSheet();
  const canDismiss = () =>
    new Promise<boolean>(resolve => {
      const isEmpty = !Object.values(newLocation).length;
      if (isEmpty) {
        resolve(true);
        return;
      }

      present({
        header: 'Are you sure?',
        subHeader: 'This will discard the new location form data.',
        buttons: [
          { text: 'Yes', role: 'confirm' },
          { text: 'No', role: 'cancel' },
        ],
        onWillDismiss: ev => resolve(ev.detail.role === 'confirm'),
      });
    });

  return canDismiss;
};

type Props = {
  presentingElement: any;
  isOpen: any;
  onCancel: any;
  onSave: (location: FixedLocation) => void;
  project: Project;
  location: any;
};

const NewLocationModal = (
  { presentingElement, isOpen, onCancel, onSave, project, location }: Props,
  ref: any
) => {
  const [newLocation, setNewLocation] = useState<FixedLocation>({
    name: '',
    comment: '',
  });

  const { success: isValidLocation } = schema.safeParse(newLocation);

  const canDismiss = useDismissHandler(newLocation || {});

  const onSaveWrap = () => onSave(location);

  const cleanUp = () => setNewLocation({ name: '', comment: '' });

  const { area } = location;

  async function dismiss() {
    const closing = await ref.current?.dismiss();
    if (closing) onCancel();
  }

  return (
    <IonModal
      ref={ref}
      isOpen={isOpen}
      backdropDismiss={false}
      presentingElement={presentingElement}
      canDismiss={canDismiss}
      onWillDismiss={cleanUp}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={dismiss}>
              <T>Cancel</T>
            </IonButton>
          </IonButtons>
          <IonTitle className={clsx(isPlatform('ios') && 'pr-[130px]')}>
            <T>New Location</T>
          </IonTitle>
          <IonButtons slot="end">
            <HeaderButton isInvalid={!isValidLocation} onClick={onSaveWrap}>
              Save
            </HeaderButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar id="area-edit-toolbar">
          <IonTitle size="small">
            <div className="text-with-icon-wrapper">
              <IonIcon icon={resizeOutline} />
              <T>Selected area</T>: {area?.toLocaleString()} m²
            </div>
          </IonTitle>
        </IonToolbar>
        <div className="bg-tertiary-600 p-1 text-center text-sm text-white">
          {project?.name}
        </div>
      </IonHeader>

      <Main>
        <div className="m-3 rounded">
          <TextInput
            value={newLocation.name}
            label="Site name"
            onChange={(newVal: string) =>
              setNewLocation({ ...newLocation, name: newVal })
            }
            platform="ios"
          />
          <TextInput
            value={newLocation.comment}
            label="Notes"
            onChange={(newVal: string) =>
              setNewLocation({ ...newLocation, comment: newVal })
            }
            platform="ios"
            labelPlacement="floating"
            isMultiline
          />
        </div>
      </Main>
    </IonModal>
  );
};

export default forwardRef(NewLocationModal);
